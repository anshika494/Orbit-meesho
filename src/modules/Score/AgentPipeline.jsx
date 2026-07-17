import React, { useState } from 'react';
import { Stethoscope, ListChecks, ShieldCheck } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    idle: { label: 'Idle', color: 'var(--dim)' },
    running: { label: 'Running', color: 'var(--violet)' },
    complete: { label: 'Complete', color: 'var(--green)' },
    error: { label: 'Error', color: 'var(--pink)' },
  };
  const s = map[status] || map.idle;
  return (
    <span className="badge" style={{ background: `${s.color}22`, color: s.color }}>
      {s.label}
    </span>
  );
}

function AgentCard({ icon: Icon, name, colorVar, status, output, transitionText, checklist }) {
  return (
    <div
      className={`agent-pipeline-card card ${status === 'running' ? 'pulsing' : ''}`}
      style={{ borderLeft: `4px solid var(${colorVar})` }}
    >
      <div className="agent-pipeline-card-header">
        <Icon size={18} color={`var(${colorVar})`} />
        <span className="agent-pipeline-card-name">{name}</span>
        <StatusBadge status={status} />
      </div>

      {status === 'running' && (
        <div className="typing-dots agent-pipeline-loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      {output && (status === 'complete' || status === 'running') && (
        <pre className="agent-pipeline-output">{output}</pre>
      )}

      {checklist && status === 'complete' && (
        <div className="agent-pipeline-checklist">
          {checklist.map((item, i) => (
            <ChecklistItem key={i} label={item} />
          ))}
        </div>
      )}

      {status === 'complete' && transitionText && <div className="agent-pipeline-transition">{transitionText}</div>}
    </div>
  );
}

function ChecklistItem({ label }) {
  const [done, setDone] = useState(false);
  return (
    <button className={`checklist-item ${done ? 'done' : ''}`} onClick={() => setDone((d) => !d)}>
      <span className="checklist-box">{done ? '✓' : ''}</span>
      {label}
    </button>
  );
}

function extractTasks(planText) {
  if (!planText) return [];
  return planText
    .split('\n')
    .filter((l) => /^DAY \d/i.test(l.trim()))
    .map((l) => l.trim());
}

export default function AgentPipeline({ status, diagnosisOutput, planOutput, verifyOutput, error, onRetry }) {
  const tasks = extractTasks(planOutput);

  return (
    <div className="agent-pipeline">
      <AgentCard
        icon={Stethoscope}
        name="Diagnose Agent"
        colorVar="--cyan"
        status={status.diagnose}
        output={diagnosisOutput}
        transitionText="→ passing to Plan Agent"
      />
      <AgentCard
        icon={ListChecks}
        name="Plan Agent"
        colorVar="--violet"
        status={status.plan}
        output={planOutput}
        transitionText="→ passing to Verify Agent"
      />
      <AgentCard
        icon={ShieldCheck}
        name="Verify Agent"
        colorVar="--green"
        status={status.verify}
        output={verifyOutput}
        checklist={tasks}
      />

      {error && (
        <div className="chat-error">
          Agent temporarily unavailable — retrying...
          <button className="btn-secondary" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
