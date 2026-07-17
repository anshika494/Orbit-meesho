import React from 'react';

export default function ScoreDial({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const hasScore = score !== null && score !== undefined;
  const pct = hasScore ? Math.min(100, Math.max(0, score)) / 100 : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="score-dial card">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} stroke="var(--border)" strokeWidth="12" fill="none" />
        {hasScore && (
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="var(--violet)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        )}
        {hasScore ? (
          <>
            <text x="90" y="86" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--white)">
              {score}
            </text>
            <text x="90" y="108" textAnchor="middle" fontSize="13" fill="var(--muted)">
              / 100
            </text>
          </>
        ) : (
          <text x="90" y="94" textAnchor="middle" fontSize="14" fill="var(--dim)">
            Building…
          </text>
        )}
      </svg>
      <span className="score-dial-label">{hasScore ? 'Orbit Score' : 'Orbit Score — not yet available'}</span>
    </div>
  );
}
