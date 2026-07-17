import React from 'react';
import { Sprout } from 'lucide-react';

export default function ColdStartCard({ status, output }) {
  return (
    <div className="agent-pipeline-card card" style={{ borderLeft: '4px solid var(--gold)' }}>
      <div className="agent-pipeline-card-header">
        <Sprout size={18} color="var(--gold)" />
        <span className="agent-pipeline-card-name">Cold-Start Coach</span>
        <span
          className="badge"
          style={{
            background: status === 'running' ? 'rgba(124,92,255,0.15)' : 'rgba(245,183,47,0.15)',
            color: status === 'running' ? 'var(--violet)' : 'var(--gold)',
          }}
        >
          {status === 'running' ? 'Generating…' : 'Ready'}
        </span>
      </div>

      {status === 'running' && (
        <div className="typing-dots agent-pipeline-loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      {output && status === 'complete' && (
        <div className="cold-start-content">
          <p className="cold-start-note">
            Not enough order history yet for a personal score — here's what to aim for instead.
          </p>

          <div className="cold-start-benchmarks">
            <div className="cold-start-benchmark">
              <span>Expected return rate</span>
              <strong>{output.category_benchmarks?.expected_return_rate}</strong>
            </div>
            <div className="cold-start-benchmark">
              <span>Expected fulfillment rate</span>
              <strong>{output.category_benchmarks?.expected_fulfillment_rate}</strong>
            </div>
            <div className="cold-start-benchmark">
              <span>Typical time to first repeat buyer</span>
              <strong>{output.category_benchmarks?.typical_time_to_repeat_buyer}</strong>
            </div>
          </div>

          <div className="cold-start-section">
            <h4>TOP FOCUS AREA</h4>
            <p>{output.top_focus_area}</p>
          </div>

          <div className="cold-start-section">
            <h4>YOUR SCORE UNLOCKS AT</h4>
            <p>{output.unlock_milestone}</p>
          </div>

          <div className="cold-start-encouragement">{output.encouragement}</div>
        </div>
      )}
    </div>
  );
}
