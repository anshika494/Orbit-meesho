import React, { useState } from 'react';
import ScoreDial from './ScoreDial';
import MetricGrid from './MetricGrid';
import ScoreBreakdown from './ScoreBreakdown';
import AgentPipeline from './AgentPipeline';
import OrchestratorCard from './OrchestratorCard';
import ColdStartCard from './ColdStartCard';
import WeekSimulatorCard from './WeekSimulatorCard';
import OutcomeCard from './OutcomeCard';
import ScoreTrendLine from './ScoreTrendLine';
import DataSourceBadge from '../../components/DataSourceBadge';
import { useSeller } from '../../context/SellerContext';
import { runOrchestratorAgent } from '../../agents/orchestratorAgent';
import { runDiagnoseAgent } from '../../agents/diagnoseAgent';
import { runPlanAgent } from '../../agents/planAgent';
import { runVerifyAgent, runOutcomeVerifyAgent } from '../../agents/verifyAgent';
import { runColdStartAgent } from '../../agents/coldStartAgent';
import { computeSellerMetrics } from '../../agents/scoreCalculator';
import { useLanguage } from '../../context/LanguageContext';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Score() {
  const {
    seller,
    updateSeller,
    pushLog,
    orchestratorOutput,
    setOrchestratorOutput,
    diagnosisOutput,
    setDiagnosisOutput,
    planOutput,
    setPlanOutput,
    verifyOutput,
    setVerifyOutput,
    planTargets,
    setPlanTargets,
    outcomeOutput,
    setOutcomeOutput,
    scoreHistory,
    setScoreHistory,
    coldStartOutput,
    setColdStartOutput,
  } = useSeller();
  const { t } = useLanguage();

  const [status, setStatus] = useState({
    orchestrator: 'idle',
    diagnose: 'idle',
    plan: 'idle',
    verify: 'idle',
    coldStart: 'idle',
  });
  const [errors, setErrors] = useState({});
  const [simulateLoading, setSimulateLoading] = useState(false);
  // Store snapshot of metrics at the time pipeline ran (baseline for comparison)
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [outcomeScore, setOutcomeScore] = useState(null);

  async function runPipeline() {
    setErrors({});
    setOrchestratorOutput(null);
    setDiagnosisOutput(null);
    setPlanOutput(null);
    setVerifyOutput(null);
    setPlanTargets(null);
    setOutcomeOutput(null);
    setOutcomeScore(null);
    setStatus({ orchestrator: 'running', diagnose: 'idle', plan: 'idle', verify: 'idle', coldStart: 'idle' });
    pushLog('SYSTEM', 'Starting Orbit Analysis — Orchestrator deciding route');

    // Snapshot current metrics as baseline for outcome comparison
    setBaselineMetrics({
      returnRate: seller.returnRate,
      fulfillmentRate: seller.fulfillmentRate,
      responseTime: seller.responseTime,
      catalogFreshness: seller.catalogFreshness,
      repeatBuyers: seller.repeatBuyers,
      rating: seller.rating,
    });

    // Seed score history with the baseline if empty
    if (scoreHistory.length === 0 && seller.orbitScore != null) {
      setScoreHistory([{ week: 0, score: seller.orbitScore, label: 'Baseline' }]);
    }

    try {
      const decision = await runOrchestratorAgent(seller, pushLog);
      setOrchestratorOutput(decision);
      setStatus((s) => ({ ...s, orchestrator: 'complete' }));
      await wait(1000);

      if (decision.route === 'COLD_START') {
        setStatus((s) => ({ ...s, coldStart: 'running' }));
        const coldStart = await runColdStartAgent(seller, pushLog);
        setColdStartOutput(coldStart);
        setStatus((s) => ({ ...s, coldStart: 'complete' }));
        return;
      }

      // route === 'SCORE_LOOP'
      setStatus((s) => ({ ...s, diagnose: 'running' }));
      const diagnosis = await runDiagnoseAgent(seller, pushLog);
      setDiagnosisOutput(diagnosis);
      setStatus((s) => ({ ...s, diagnose: 'complete' }));

      await wait(1500);
      setStatus((s) => ({ ...s, plan: 'running' }));
      // planData = { text, targets }
      const planData = await runPlanAgent(diagnosis, pushLog);
      setPlanOutput(planData.text);
      setPlanTargets(planData.targets);
      setStatus((s) => ({ ...s, plan: 'complete' }));

      await wait(1500);
      setStatus((s) => ({ ...s, verify: 'running' }));
      // verifyResult = { text, targets }
      const verifyResult = await runVerifyAgent(planData, seller, pushLog);
      setVerifyOutput(verifyResult.text);
      // targets may be refined by verify; prefer plan's targets if both exist
      if (!planData.targets && verifyResult.targets) setPlanTargets(verifyResult.targets);
      setStatus((s) => ({ ...s, verify: 'complete' }));
    } catch (err) {
      pushLog('SYSTEM', `Pipeline error: ${err.message}`);
      setErrors((e) => ({ ...e, pipeline: err.message }));
      setStatus((s) => {
        const next = { ...s };
        Object.keys(next).forEach((k) => {
          if (next[k] === 'running') next[k] = 'error';
        });
        return next;
      });
    }
  }

  async function handleSimulate(weekOneMetrics) {
    if (!planTargets) return;
    setSimulateLoading(true);
    setOutcomeOutput(null);
    try {
      const evalText = await runOutcomeVerifyAgent(
        planTargets,
        baselineMetrics || {},
        weekOneMetrics,
        pushLog
      );
      setOutcomeOutput(evalText);

      // Recompute score from the new metric values
      const rawProxy = {
        orders: buildOrdersProxy(weekOneMetrics, seller),
        catalogItems: buildCatalogProxy(weekOneMetrics),
        responseLogs: buildResponseProxy(weekOneMetrics),
        reviews: buildReviewsProxy(weekOneMetrics),
      };
      const newMetrics = computeSellerMetrics(rawProxy);
      if (newMetrics && !newMetrics.insufficientData) {
        const newScore = newMetrics.orbitScore;
        setOutcomeScore(newScore);
        // Update the seller's displayed score
        updateSeller({ orbitScore: newScore });
        // Append to score history
        setScoreHistory((prev) => [
          ...prev,
          { week: prev.length, score: newScore, label: `Week ${prev.length}` },
        ]);
        pushLog('OUTCOME VERIFY AGENT', `New Orbit Score: ${newScore} (was ${seller.orbitScore})`);
      }
    } catch (err) {
      pushLog('SYSTEM', `Outcome verification error: ${err.message}`);
      setErrors((e) => ({ ...e, outcome: err.message }));
    } finally {
      setSimulateLoading(false);
    }
  }

  const running = Object.values(status).some((s) => s === 'running');
  const showSimulator = status.verify === 'complete' && planTargets != null && !outcomeOutput;
  const showOutcome = outcomeOutput != null;

  return (
    <div className="score-module">
      <div className="score-header">
        <h2>{t('score.title')}</h2>
        <p>{t('score.subtitle')}</p>
      </div>
      <div className="score-layout">
        <div className="score-col-left">
          <DataSourceBadge source={seller.dataSource} note={seller.dataSourceNote} />
          <ScoreDial score={seller.orbitScore} />
          <ScoreTrendLine history={scoreHistory} />
          <MetricGrid seller={seller} />
          <ScoreBreakdown seller={seller} />
          <button className="btn-primary score-run-btn" onClick={runPipeline} disabled={running || simulateLoading}>
            {running ? t('score.runningButton') : t('score.runButton')}
          </button>
        </div>

        <div className="score-col-right">
          {status.orchestrator !== 'idle' && (
            <OrchestratorCard status={status.orchestrator} decision={orchestratorOutput} />
          )}

          {orchestratorOutput?.route === 'COLD_START' ? (
            <ColdStartCard status={status.coldStart} output={coldStartOutput} />
          ) : (
            <>
              <AgentPipeline
                status={status}
                diagnosisOutput={diagnosisOutput}
                planOutput={planOutput}
                verifyOutput={verifyOutput}
                error={errors.pipeline}
                onRetry={runPipeline}
              />

              {showSimulator && (
                <WeekSimulatorCard
                  targets={planTargets}
                  baselineMetrics={baselineMetrics}
                  onSimulate={handleSimulate}
                  loading={simulateLoading}
                />
              )}

              {showOutcome && (
                <OutcomeCard
                  targets={planTargets}
                  weekOneMetrics={
                    // reconstruct from score history if available
                    scoreHistory.length >= 2 ? null : null
                  }
                  baseline={baselineMetrics}
                  outcomeText={outcomeOutput}
                  newScore={outcomeScore}
                  baselineScore={scoreHistory[0]?.score ?? seller.orbitScore}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Score proxy builders ──────────────────────────────────────────────────────
// computeSellerMetrics() expects raw order/catalog/response/review records.
// We reverse-engineer simple synthetic records from the metric values the
// seller just entered in the simulator so we can feed them through the same
// formula. This ensures the score displayed after simulation is computed
// identically to the original score — the formula is the source of truth.

function buildOrdersProxy(metrics, seller) {
  const n = Math.max(seller.orderCount || 50, 50);
  const returnRate = (metrics.returnRate ?? 18) / 100;
  const fulfillRate = (metrics.fulfillmentRate ?? 90) / 100;
  const repeatRate = (metrics.repeatBuyers ?? 20) / 100;

  const orders = [];
  const buyerPool = Array.from({ length: Math.round(n * (1 - repeatRate)) }, (_, i) => `B${i}`);
  const repeatBuyers = Array.from({ length: Math.round(n * repeatRate) }, (_, i) => `RB${i}`);
  const allBuyers = [...buyerPool, ...repeatBuyers];

  for (let i = 0; i < n; i++) {
    orders.push({
      id: `o${i}`,
      buyerId: allBuyers[i % allBuyers.length],
      fulfilled: Math.random() < fulfillRate,
      returned: Math.random() < returnRate,
    });
  }
  // Add a second order for repeat buyers so the calculator sees them
  repeatBuyers.slice(0, Math.round(n * repeatRate * 0.5)).forEach((bId, i) => {
    orders.push({ id: `o_r${i}`, buyerId: bId, fulfilled: true, returned: false });
  });
  return orders;
}

function buildCatalogProxy(metrics) {
  const freshPct = (metrics.catalogFreshness ?? 60) / 100;
  const n = 20;
  return Array.from({ length: n }, (_, i) => ({
    id: `cat${i}`,
    lastUpdatedDaysAgo: i < Math.round(n * freshPct) ? 5 : 30,
  }));
}

function buildResponseProxy(metrics) {
  const hours = metrics.responseTime ?? 3;
  return Array.from({ length: 30 }, () => ({ hours }));
}

function buildReviewsProxy(metrics) {
  const rating = metrics.rating ?? 4.0;
  return Array.from({ length: 40 }, () => ({ stars: rating }));
}
