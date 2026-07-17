import React, { useState, useMemo } from 'react';
import SignalCards from './SignalCards';
import CreditOffer from './CreditOffer';
import ROICalculator from './ROICalculator';
import { useSeller } from '../../context/SellerContext';
import { runCreditPipeline } from '../../agents/creditAgent';
import { computeCreditSignals } from '../../data/creditSignals';
import { useLanguage } from '../../context/LanguageContext';

export default function Credit() {
  const { seller, pushLog, creditOfferOutput, setCreditOfferOutput, updateSeller } = useSeller();
  const { t } = useLanguage();
  const [phase, setPhase] = useState('signals'); // signals -> converging -> analyzing -> offer
  const [risk, setRisk] = useState(null);
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
      const { offer, risk: riskResult } = await runCreditPipeline(seller, pushLog);
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
      </div>

      <SignalCards phase={phase} onConverge={runAnalysis} signals={signals} />

      {phase === 'analyzing' && (
        <div className="credit-analyzing card">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          Credit Agent is analyzing your situation…
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

      {phase === 'offer' && creditOfferOutput && (
        <>
          <CreditOffer offer={creditOfferOutput} seller={seller} risk={risk} />
          <ROICalculator />
        </>
      )}
    </div>
  );
}
