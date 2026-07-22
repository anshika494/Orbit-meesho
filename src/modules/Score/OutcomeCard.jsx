import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const METRIC_CONFIG = {
  returnRate:      { label: 'Return Rate',       unit: '%',  lowerBetter: true  },
  fulfillmentRate: { label: 'Fulfillment Rate',  unit: '%',  lowerBetter: false },
  responseTime:    { label: 'Response Time',     unit: 'h',  lowerBetter: true  },
  catalogFreshness:{ label: 'Catalog Freshness', unit: '%',  lowerBetter: false },
  repeatBuyers:    { label: 'Repeat Buyers',     unit: '%',  lowerBetter: false },
  rating:          { label: 'Rating',            unit: '/5', lowerBetter: false },
};

function TargetRow({ metricKey, target, actual, baseline }) {
  const cfg = METRIC_CONFIG[metricKey] || { label: metricKey, unit: '', lowerBetter: false };
  const isHit = cfg.lowerBetter ? actual <= target : actual >= target;

  let progress;
  if (cfg.lowerBetter) {
    const needed = (baseline ?? target * 1.3) - target;
    progress = needed <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, (((baseline ?? target * 1.3) - actual) / needed) * 100)));
  } else {
    const needed = target - (baseline ?? target * 0.8);
    progress = needed <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, ((actual - (baseline ?? target * 0.8)) / needed) * 100)));
  }

  const barColor = progress >= 100 ? 'var(--green)' : progress >= 60 ? 'var(--gold)' : 'var(--pink)';

  return (
    <div className={`outcome-row ${isHit ? 'outcome-row--hit' : 'outcome-row--miss'}`}>
      <div className="outcome-row-header">
        <span className="outcome-metric-label">{cfg.label}</span>
        <div className="outcome-row-values">
          <span className="outcome-target">target {target}{cfg.unit}</span>
          <span className="outcome-arrow">→</span>
          <span className={`outcome-actual ${isHit ? 'outcome-actual--hit' : 'outcome-actual--miss'}`}>
            {actual}{cfg.unit}
          </span>
          <span className={`outcome-badge ${isHit ? 'outcome-badge--hit' : 'outcome-badge--miss'}`}>
            {isHit ? '✓ Hit' : '✗ Missed'}
          </span>
        </div>
      </div>
      <div className="outcome-progress-bar">
        <div className="outcome-progress-fill" style={{ width: `${progress}%`, background: barColor }} />
        <span className="outcome-progress-label">{progress}% of target</span>
      </div>
    </div>
  );
}

export default function OutcomeCard({ targets, weekOneMetrics, baseline, outcomeText, newScore, baselineScore }) {
  if (!outcomeText) return null;

  const scoreDelta = newScore != null && baselineScore != null ? newScore - baselineScore : null;

  return (
    <div className="outcome-card card">
      <div className="outcome-card-header">
        <div className="outcome-title-row">
          {scoreDelta != null && scoreDelta > 0 && <TrendingUp size={18} color="var(--green)" />}
          {scoreDelta != null && scoreDelta < 0 && <TrendingDown size={18} color="var(--pink)" />}
          {scoreDelta != null && scoreDelta === 0 && <Minus size={18} color="var(--muted)" />}
          <span className="outcome-card-title">Week 1 Outcome Verification</span>
        </div>
        {scoreDelta != null && (
          <div className="outcome-score-delta" style={{ color: scoreDelta >= 0 ? 'var(--green)' : 'var(--pink)' }}>
            {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
            <span className="outcome-score-detail">
              {baselineScore} → {newScore}
            </span>
          </div>
        )}
      </div>

      {/* Per-metric hit/miss rows */}
      {targets && weekOneMetrics && (
        <div className="outcome-metrics-list">
          {Object.entries(targets).map(([key, target]) => (
            <TargetRow
              key={key}
              metricKey={key}
              target={target}
              actual={weekOneMetrics[key]}
              baseline={baseline?.[key]}
            />
          ))}
        </div>
      )}

      {/* Agent evaluation text */}
      <pre className="outcome-eval-text">{outcomeText}</pre>
    </div>
  );
}
