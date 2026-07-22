import React, { useState, useMemo } from 'react';
import SignalCards from './SignalCards';
import CreditOffer from './CreditOffer';
import ROICalculator from './ROICalculator';
import RiskGatePanel from './RiskGatePanel';
import DataSourceBadge from '../../components/DataSourceBadge';
import { useSeller } from '../../context/SellerContext';
import { runCreditPipeline } from '../../agents/creditAgent';
import { computeCreditSignals } from '../../data/creditSignals';
import { useLanguage } from '../../context/LanguageContext';

export default function Credit() {
  const { seller, pushLog, creditOfferOutput, setCreditOfferOutput, updateSeller } = useSeller();
  const { t } = useLanguage();
  const [phase, setPhase] = useState('signals'); // signals -> converging -> analyzing -> offer -> denied
  const [risk, setRisk] = useState(null);
  const [gateResult, setGateResult] = useState(null);
  const [denialReason, setDenialReason] = useState(null);
  const [error, setError] = useState(null);

  // Computed once per seller, straight from their raw order/stock data — the
  // cards show the same numbers before and after "Run Credit Analysis",
  // because they're derived, not simulated for the button click.
  const signals = useMemo(() => computeCreditSignals(seller.rawData), [seller.id]);

  async function runAnalysis() {
    setError(null);
    setPhase('converging');

    setTimeout(() => setPhase('analyzing'), 1200);

    try {
      const { offer, risk: riskResult, gateResult: gates, denied, denialReason: reason } = await runCreditPipeline(seller, pushLog);
      setGateResult(gates);

      if (denied) {
        setDenialReason(reason);
        setTimeout(() => setPhase('denied'), 1400);
        return;
      }

      setRisk(riskResult);
      if (!offer) throw new Error('Credit Agent returned no usable offer');
      setCreditOfferOutput(offer);
      updateSeller({ creditOfferSeen: true });
      setTimeout(() => setPhase('offer'), 1400);
    } catch (err) {
      pushLog('SYSTEM', `Credit Agent error: ${err.message}`);
      setError(err.message);
      setPhase('signals');
    }
  }

  return (
    <div className="credit-module">
      <div className="credit-header">
        <h2>{t('credit.title')}</h2>
        <p>{t('credit.subtitle')}</p>
        <DataSourceBadge source={seller.dataSource} note={seller.dataSourceNote} />
      </div>

      <SignalCards phase={phase} onConverge={runAnalysis} signals={signals} />

      {phase === 'analyzing' && (
        <div className="credit-analyzing card">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          Checking risk gates, then Credit Agent is analyzing your situation…
        </div>
      )}

      {error && (
        <div className="chat-error">
          Agent temporarily unavailable — retrying...
          <button className="btn-secondary" onClick={runAnalysis}>
            Retry
          </button>
        </div>
      )}

      {phase === 'denied' && gateResult && (
        <>
          <div className="card credit-denied-card">
            <h3>Not eligible for a credit offer yet</h3>
            <p>{denialReason}</p>
            <p className="credit-denied-note">
              These are hard cutoffs checked before any AI reasoning runs — no offer is generated for a seller who
              doesn't clear them, so nothing here is a judgment call.
            </p>
          </div>
          <RiskGatePanel gateResult={gateResult} expanded />
        </>
      )}

      {phase === 'offer' && creditOfferOutput && (
        <>
          <RiskGatePanel gateResult={gateResult} expanded={false} />
          <CreditOffer offer={creditOfferOutput} seller={seller} risk={risk} />
          <ROICalculator />
        </>
      )}
    </div>
  );
}
