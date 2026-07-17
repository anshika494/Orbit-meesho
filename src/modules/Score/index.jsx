import React, { useState } from 'react';
import ScoreDial from './ScoreDial';
import MetricGrid from './MetricGrid';
import ScoreBreakdown from './ScoreBreakdown';
import AgentPipeline from './AgentPipeline';
import OrchestratorCard from './OrchestratorCard';
import ColdStartCard from './ColdStartCard';
import { useSeller } from '../../context/SellerContext';
import { runOrchestratorAgent } from '../../agents/orchestratorAgent';
import { runDiagnoseAgent } from '../../agents/diagnoseAgent';
import { runPlanAgent } from '../../agents/planAgent';
import { runVerifyAgent } from '../../agents/verifyAgent';
import { runColdStartAgent } from '../../agents/coldStartAgent';
import { useLanguage } from '../../context/LanguageContext';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Score() {
  const {
    seller,
    pushLog,
    orchestratorOutput,
    setOrchestratorOutput,
    diagnosisOutput,
    setDiagnosisOutput,
    planOutput,
    setPlanOutput,
    verifyOutput,
    setVerifyOutput,
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

  async function runPipeline() {
    setErrors({});
    setOrchestratorOutput(null);
    setDiagnosisOutput(null);
    setPlanOutput(null);
    setVerifyOutput(null);
    setColdStartOutput(null);
    setStatus({ orchestrator: 'running', diagnose: 'idle', plan: 'idle', verify: 'idle', coldStart: 'idle' });
    pushLog('SYSTEM', 'Starting Orbit Analysis — Orchestrator deciding route');

    try {
      // Step 1 — the Orchestrator Agent decides the route autonomously.
      // Nothing in this component branches on seller.orderCount directly;
      // the agent looks at the same signal and makes the call itself.
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
      const plan = await runPlanAgent(diagnosis, pushLog);
      setPlanOutput(plan);
      setStatus((s) => ({ ...s, plan: 'complete' }));

      await wait(1500);
      setStatus((s) => ({ ...s, verify: 'running' }));
      const verify = await runVerifyAgent(plan, seller, pushLog);
      setVerifyOutput(verify);
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

  const running = Object.values(status).some((s) => s === 'running');

  return (
    <div className="score-module">
      <div className="score-header">
        <h2>{t('score.title')}</h2>
        <p>{t('score.subtitle')}</p>
      </div>
      <div className="score-layout">
        <div className="score-col-left">
          <ScoreDial score={seller.orbitScore} />
          <MetricGrid seller={seller} />
          <ScoreBreakdown seller={seller} />
          <button className="btn-primary score-run-btn" onClick={runPipeline} disabled={running}>
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
            <AgentPipeline
              status={status}
              diagnosisOutput={diagnosisOutput}
              planOutput={planOutput}
              verifyOutput={verifyOutput}
              error={errors.pipeline}
              onRetry={runPipeline}
            />
          )}
        </div>
      </div>
    </div>
  );
}
