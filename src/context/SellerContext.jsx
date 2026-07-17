import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getSellerRawData } from '../data/sellerDataAdapter';
import { computeSellerMetrics } from '../agents/scoreCalculator';
import { COLD_START_ORDER_THRESHOLD } from '../data/constants';

const SellerContext = createContext(null);

// Two seed profiles: an established seller with real history, and a
// day-one seller with no order history — the genuine agentic cold-start case.
//
// Note what's NOT here: returnRate, fulfillmentRate, catalogFreshness,
// responseTime, repeatBuyers, rating, orbitScore. Those used to be typed in
// as flat numbers. Now they're computed at runtime by buildSeller() below,
// from synthetic order-level records — same as a real Meesho data pull
// would feed the same calculator. Only identity/account fields live here.
export const SELLERS = {
  established: {
    id: 'established',
    name: 'Priya Sharma',
    category: 'Cotton Kurtis',
    location: 'Jaipur, Rajasthan',
    monthlyGMV: 76000,
    accountAge: 8, // months
    orderCount: 214,
    // Calibration knobs for the synthetic data generator — tuned so the
    // computed aggregates land in a realistic range for an established seller.
    baseFulfillmentMiss: 0.06,
    baseReturnRate: 0.22,
    baseResponseHours: 3.2,
    baseRating: 4.1,
    catalogStalenessSpread: 34,
    currentStockUnits: 47,
    onboardComplete: false,
    creditOfferSeen: false,
  },
  newSeller: {
    id: 'newSeller',
    name: 'Anjali Devi',
    category: 'Handmade Jewellery',
    location: 'Lucknow, Uttar Pradesh',
    monthlyGMV: 0,
    accountAge: 0, // months
    orderCount: 2,
    baseFulfillmentMiss: 0.05,
    baseReturnRate: 0.15,
    baseResponseHours: 5,
    baseRating: 4.0,
    catalogStalenessSpread: 20,
    currentStockUnits: 18,
    onboardComplete: false,
    creditOfferSeen: false,
  },
};

// Below this many completed orders, there isn't enough signal for a real score —
// this is also the threshold the Orchestrator Agent is told about, so its
// routing decision and the UI's cold-start gate agree on the same rule.
export { COLD_START_ORDER_THRESHOLD };

// The single place that turns a seller's identity/meta into a full profile:
// pull raw order-level records from the data adapter, then run them through
// the score calculator. Swap sellerDataAdapter's internals for a real
// Meesho API call later and this function — and everything that calls it —
// doesn't need to change.
function buildSeller(meta) {
  const rawData = getSellerRawData(meta.id, meta);
  const metrics = computeSellerMetrics(rawData);
  return { ...meta, ...metrics, rawData };
}

export function SellerProvider({ children }) {
  const [seller, setSeller] = useState(() => buildSeller(SELLERS.established));
  const [agentLog, setAgentLog] = useState([]);
  const [diagnosisOutput, setDiagnosisOutput] = useState(null);
  const [planOutput, setPlanOutput] = useState(null);
  const [verifyOutput, setVerifyOutput] = useState(null);
  const [creditOfferOutput, setCreditOfferOutput] = useState(null);
  const [extractedProfile, setExtractedProfile] = useState(null);
  const [catalogOutput, setCatalogOutput] = useState(null);
  const [orchestratorOutput, setOrchestratorOutput] = useState(null);
  const [coldStartOutput, setColdStartOutput] = useState(null);
  const logIdRef = useRef(0);

  const switchSeller = useCallback((sellerId) => {
    const meta = SELLERS[sellerId] || SELLERS.established;
    setSeller(buildSeller(meta));
    // Reset the Score pipeline state — it belongs to whichever seller is active
    setDiagnosisOutput(null);
    setPlanOutput(null);
    setVerifyOutput(null);
    setOrchestratorOutput(null);
    setColdStartOutput(null);
    setCreditOfferOutput(null);
  }, []);

  const pushLog = useCallback((agent, message) => {
    logIdRef.current += 1;
    const entry = {
      id: logIdRef.current,
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      agent,
      message,
    };
    setAgentLog((prev) => [...prev, entry]);
  }, []);

  const updateSeller = useCallback((patch) => {
    setSeller((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = {
    seller,
    updateSeller,
    switchSeller,
    agentLog,
    pushLog,
    diagnosisOutput,
    setDiagnosisOutput,
    planOutput,
    setPlanOutput,
    verifyOutput,
    setVerifyOutput,
    creditOfferOutput,
    setCreditOfferOutput,
    extractedProfile,
    setExtractedProfile,
    catalogOutput,
    setCatalogOutput,
    orchestratorOutput,
    setOrchestratorOutput,
    coldStartOutput,
    setColdStartOutput,
  };

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller must be used within SellerProvider');
  return ctx;
}
