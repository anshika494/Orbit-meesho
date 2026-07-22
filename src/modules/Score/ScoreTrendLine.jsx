import React from 'react';

// Compact SVG sparkline showing orbit score trend across weeks.
// No external library — just math and path commands.
export default function ScoreTrendLine({ history }) {
  if (!history || history.length < 2) return null;

  const W = 220;
  const H = 70;
  const PAD = 12;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const scores = history.map((h) => h.score);
  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const range = maxScore - minScore || 1;

  const points = history.map((h, i) => {
    const x = PAD + (i / (history.length - 1)) * innerW;
    const y = PAD + innerH - ((h.score - minScore) / range) * innerH;
    return { x, y, score: h.score, label: h.label };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area fill path (closes back to bottom)
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${H - PAD + 4}` +
    ` L ${points[0].x} ${H - PAD + 4} Z`;

  const latestDelta = history.length >= 2
    ? history[history.length - 1].score - history[history.length - 2].score
    : 0;

  return (
    <div className="score-trend-card card">
      <div className="score-trend-header">
        <span className="score-trend-title">Score Trend</span>
        <span
          className="score-trend-delta"
          style={{ color: latestDelta >= 0 ? 'var(--green)' : 'var(--pink)' }}
        >
          {latestDelta >= 0 ? '+' : ''}{latestDelta} this week
        </span>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="score-trend-svg">
        {/* Area fill */}
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#trendGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--violet)" />
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="9" fill="var(--muted)">
              {p.score}
            </text>
          </g>
        ))}
      </svg>

      <div className="score-trend-labels">
        {history.map((h, i) => (
          <span key={i} className="score-trend-week-label">{h.label}</span>
        ))}
      </div>
    </div>
  );
}
