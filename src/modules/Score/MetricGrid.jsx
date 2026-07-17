import React from 'react';

function metricStatus(key, value) {
  const rules = {
    returnRate: value > 20 ? 'red' : value > 15 ? 'amber' : 'green',
    fulfillmentRate: value >= 90 ? 'green' : value >= 75 ? 'amber' : 'red',
    catalogFreshness: value >= 70 ? 'green' : value >= 40 ? 'amber' : 'red',
    responseTime: value <= 2 ? 'green' : value <= 4 ? 'amber' : 'red',
    repeatBuyers: value >= 25 ? 'green' : value >= 15 ? 'amber' : 'amber',
    rating: value >= 4.3 ? 'green' : value >= 3.5 ? 'amber' : 'red',
  };
  return rules[key] || 'amber';
}

const DOT_COLOR = {
  red: 'var(--pink)',
  amber: 'var(--gold)',
  green: 'var(--green)',
};

export default function MetricGrid({ seller }) {
  const metrics = [
    { key: 'returnRate', label: 'Return Rate', value: seller.returnRate, format: (v) => `${v}%`, sub: 'vs 18% avg' },
    { key: 'fulfillmentRate', label: 'Order Fulfillment', value: seller.fulfillmentRate, format: (v) => `${v}%` },
    { key: 'catalogFreshness', label: 'Catalog Freshness', value: seller.catalogFreshness, format: (v) => `${v}%` },
    { key: 'responseTime', label: 'Response Time', value: seller.responseTime, format: (v) => `${v}h` },
    { key: 'repeatBuyers', label: 'Repeat Buyers', value: seller.repeatBuyers, format: (v) => `${v}%` },
    { key: 'rating', label: 'Rating', value: seller.rating, format: (v) => `${v} / 5.0` },
  ];

  return (
    <div className="metric-grid">
      {metrics.map((m) => {
        const hasValue = m.value !== null && m.value !== undefined;
        const status = hasValue ? metricStatus(m.key, m.value) : null;
        return (
          <div className="metric-card card" key={m.key}>
            {status && <span className="metric-dot" style={{ background: DOT_COLOR[status] }} />}
            <span className="metric-label">{m.label}</span>
            <span className={`metric-value ${!hasValue ? 'metric-value-pending' : ''}`}>
              {hasValue ? m.format(m.value) : 'pending'}
            </span>
            {m.sub && hasValue && <span className="metric-sub">{m.sub}</span>}
          </div>
        );
      })}
    </div>
  );
}
