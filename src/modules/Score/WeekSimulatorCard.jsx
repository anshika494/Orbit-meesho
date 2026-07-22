import React, { useState } from 'react';
import { FastForward, Sliders } from 'lucide-react';

const METRIC_CONFIG = [
  { key: 'returnRate',      label: 'Return Rate',      unit: '%',  min: 5,   max: 50,  step: 0.5, lowerBetter: true  },
  { key: 'fulfillmentRate', label: 'Fulfillment Rate', unit: '%',  min: 50,  max: 100, step: 0.5, lowerBetter: false },
  { key: 'responseTime',    label: 'Response Time',    unit: 'h',  min: 0.5, max: 12,  step: 0.5, lowerBetter: true  },
  { key: 'catalogFreshness',label: 'Catalog Freshness',unit: '%',  min: 0,   max: 100, step: 1,   lowerBetter: false },
  { key: 'repeatBuyers',    label: 'Repeat Buyers',    unit: '%',  min: 0,   max: 60,  step: 0.5, lowerBetter: false },
  { key: 'rating',          label: 'Rating',           unit: '/5', min: 1,   max: 5,   step: 0.1, lowerBetter: false },
];

export default function WeekSimulatorCard({ targets, baselineMetrics, onSimulate, loading }) {
  // Pre-fill sliders at target values — dragging left = miss, right = overachieve
  const [values, setValues] = useState(() => {
    const init = {};
    METRIC_CONFIG.forEach(({ key }) => {
      init[key] = targets?.[key] ?? baselineMetrics?.[key] ?? 50;
    });
    return init;
  });

  function handleChange(key, val) {
    setValues((prev) => ({ ...prev, [key]: Number(val) }));
  }

  function getProgress(cfg) {
    if (!targets?.[cfg.key]) return null;
    const target = targets[cfg.key];
    const baseline = baselineMetrics?.[cfg.key] ?? target;
    const actual = values[cfg.key];
    if (cfg.lowerBetter) {
      const needed = baseline - target;
      if (needed <= 0) return 100;
      return Math.round(Math.min(100, Math.max(0, ((baseline - actual) / needed) * 100)));
    } else {
      const needed = target - baseline;
      if (needed <= 0) return 100;
      return Math.round(Math.min(100, Math.max(0, ((actual - baseline) / needed) * 100)));
    }
  }

  function isHit(cfg) {
    if (!targets?.[cfg.key]) return false;
    return cfg.lowerBetter ? values[cfg.key] <= targets[cfg.key] : values[cfg.key] >= targets[cfg.key];
  }

  return (
    <div className="week-simulator-card card">
      <div className="week-sim-header">
        <div className="week-sim-title-row">
          <FastForward size={16} color="var(--gold)" />
          <span className="week-sim-title">Simulate One Week Later</span>
        </div>
        <p className="week-sim-subtitle">
          Drag each slider to reflect what actually happened after following the plan.
          Sliders start at the plan's targets — drag left if you fell short, right if you exceeded.
        </p>
      </div>

      <div className="week-sim-sliders">
        {METRIC_CONFIG.map((cfg) => {
          const progress = getProgress(cfg);
          const hit = isHit(cfg);
          const target = targets?.[cfg.key];
          return (
            <div className="week-sim-row" key={cfg.key}>
              <div className="week-sim-row-header">
                <span className="week-sim-label">{cfg.label}</span>
                <div className="week-sim-row-right">
                  {target != null && (
                    <span className="week-sim-target">target: {target}{cfg.unit}</span>
                  )}
                  <span className={`week-sim-badge ${hit ? 'hit' : 'miss'}`}>
                    {hit ? '✓ Hit' : '✗ Miss'}
                  </span>
                  <span className="week-sim-value">{values[cfg.key]}{cfg.unit}</span>
                </div>
              </div>

              <input
                type="range"
                className="week-sim-input"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={values[cfg.key]}
                onChange={(e) => handleChange(cfg.key, e.target.value)}
              />

              {progress != null && (
                <div className="week-sim-progress-bar">
                  <div
                    className="week-sim-progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: progress >= 100 ? 'var(--green)' : progress >= 50 ? 'var(--gold)' : 'var(--pink)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="btn-primary week-sim-btn"
        onClick={() => onSimulate(values)}
        disabled={loading}
      >
        {loading ? (
          <span className="typing-dots" style={{ display: 'inline-flex', gap: 4 }}>
            <span /><span /><span />
          </span>
        ) : (
          <><FastForward size={15} /> Run Outcome Verification →</>
        )}
      </button>
    </div>
  );
}
