import React from 'react';
import { CheckCircle2, XCircle, Database, DatabaseZap } from 'lucide-react';

// Shows the Tier-1 hard-gate checklist that runs before any LLM call —
// see src/data/riskGates.js and api/risk-analysis.js. Used both when the
// seller passes (shown as a collapsed "cleared" summary above the offer)
// and when she's denied (shown expanded, as the reason for the denial).
export default function RiskGatePanel({ gateResult, expanded }) {
  if (!gateResult) return null;
  const { gates, source, fallbackReason } = gateResult;

  return (
    <div className={`card risk-gate-panel ${expanded ? 'risk-gate-panel-expanded' : ''}`}>
      <div className="risk-gate-header">
        {source === 'mongodb' ? <DatabaseZap size={15} color="var(--violet)" /> : <Database size={15} color="var(--muted)" />}
        <span>
          Risk Gate Check — {gates.passed ? `${gates.gates.length}/${gates.gates.length} passed` : `${gates.failedGates.length} failed`}
        </span>
        <span className="risk-gate-source">
          {source === 'mongodb' ? 'live MongoDB aggregation' : `local fallback${fallbackReason ? ` (${fallbackReason})` : ''}`}
        </span>
      </div>

      {expanded && (
        <ul className="risk-gate-list">
          {gates.gates.map((g) => (
            <li key={g.key} className={g.passed ? 'risk-gate-pass' : 'risk-gate-fail'}>
              {g.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span className="risk-gate-label">{g.label}</span>
              <span className="risk-gate-detail">{g.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
