import React from 'react';
import { GitBranch } from 'lucide-react';

export default function OrchestratorCard({ status, decision }) {
  return (
    <div className="agent-pipeline-card card orchestrator-card" style={{ borderLeft: '4px solid var(--pink)' }}>
      <div className="agent-pipeline-card-header">
        <GitBranch size={18} color="var(--pink)" />
        <span className="agent-pipeline-card-name">Orchestrator Agent</span>
        <span
          className="badge"
          style={{
            background: status === 'running' ? 'rgba(124,92,255,0.15)' : 'rgba(45,212,167,0.15)',
            color: status === 'running' ? 'var(--violet)' : 'var(--green)',
          }}
        >
          {status === 'running' ? 'Deciding route…' : 'Route decided'}
        </span>
      </div>

      {status === 'running' && (
        <div className="typing-dots agent-pipeline-loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      {decision && status === 'complete' && (
        <div className="orchestrator-decision">
          <div className="orchestrator-route-badge">
            <span className={`route-pill ${decision.route === 'COLD_START' ? 'cold' : 'score'}`}>
              → {decision.route === 'COLD_START' ? 'Cold-Start Path' : 'Full Score Loop'}
            </span>
            <span className="orchestrator-confidence mono">{decision.confidence}% confidence</span>
          </div>
          <p className="orchestrator-reasoning">{decision.reasoning}</p>
        </div>
      )}
    </div>
  );
}
