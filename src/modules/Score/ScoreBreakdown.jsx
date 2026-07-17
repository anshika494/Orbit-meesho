import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Answers "how is this score calculated?" directly on screen — every point
// in seller.scoreBreakdown traces back to a real metric computed from raw
// order data by scoreCalculator.js, not an asserted number.
export default function ScoreBreakdown({ seller }) {
  const [open, setOpen] = useState(false);

  if (seller.insufficientData || !seller.scoreBreakdown) {
    return (
      <div className="card score-breakdown-card score-breakdown-empty">
        <p className="score-breakdown-empty-note">
          Not enough order history yet ({seller.orderCount} orders) to compute a scored
          breakdown — see the Cold-Start Coach for category benchmarks instead.
        </p>
      </div>
    );
  }

  const totalEarned = seller.scoreBreakdown.reduce((s, b) => s + b.earned, 0);
  const totalPossible = seller.scoreBreakdown.reduce((s, b) => s + b.possible, 0);

  return (
    <div className="card score-breakdown-card">
      <button className="score-breakdown-toggle" onClick={() => setOpen((v) => !v)}>
        <span>How is this score calculated?</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="score-breakdown-body">
          <p className="score-breakdown-intro">
            Orbit Score is a weighted formula computed from this seller's order history —
            not an estimate. Each category below is worth a fixed number of points.
          </p>

          {seller.scoreBreakdown.map((b) => (
            <div className="score-breakdown-row" key={b.key}>
              <div className="score-breakdown-row-top">
                <span className="score-breakdown-label">{b.label}</span>
                <span className="score-breakdown-points mono">
                  {b.earned} / {b.possible} pts
                </span>
              </div>
              <div className="score-breakdown-bar">
                <div
                  className="score-breakdown-bar-fill"
                  style={{ width: `${(b.earned / b.possible) * 100}%` }}
                />
              </div>
              <span className="score-breakdown-detail">{b.detail}</span>
            </div>
          ))}

          <div className="score-breakdown-total">
            <span>Total</span>
            <span className="mono">
              {Math.round(totalEarned)} / {totalPossible} → Orbit Score {seller.orbitScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
