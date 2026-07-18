// ─────────────────────────────────────────────────────────────────────────
// RISK GATES — the hard pass/fail layer that sits in front of Orbit Credit.
//
// This is deliberately NOT part of scoreCalculator.js's weighted Orbit
// Score, and deliberately NOT an LLM call. Credit risk cutoffs need to be
// predictable and auditable — "why was she denied" has to have a one-line
// answer a human can check by hand, not "the model decided." So:
//
//   Tier 1 — THESE GATES (below): deterministic, rule-based, must ALL pass.
//            One failure = deny or send-back, no AI judgment involved.
//   Tier 2 — the weighted Orbit Score + the Credit/Risk-Reflection agents:
//            once a seller clears the gates, THIS is where nuance and
//            LLM reasoning decide the actual loan amount and terms.
//
// evaluateHardGates() takes the seller's computed metrics (from
// scoreCalculator.computeSellerMetrics) plus their raw order data, and
// returns a pass/fail verdict per gate. It has no dependency on where that
// data came from — it works identically whether metrics were computed from
// the local synthetic generator or fetched from the MongoDB risk-analysis
// endpoint (see api/risk-analysis.js), which is what lets the UI/agent
// pipeline fail over gracefully if the DB call doesn't succeed.
// ─────────────────────────────────────────────────────────────────────────

export const HARD_GATE_THRESHOLDS = {
  minAccountAgeDays: 30,
  minFulfillmentRate: 85, // %
  // Anchored to the platform average return rate scoreCalculator.js already
  // tracks (18%) plus a margin — a seller has to be meaningfully worse than
  // the platform, not just marginally above average, to hard-fail here.
  maxReturnRate: 20, // %
  maxAvgResponseHours: 24,
  minSalesPerDay: 0.5, // matches the floor already used by the data generator
};

/**
 * @param {object} metrics - output of computeSellerMetrics() — needs
 *   fulfillmentRate, returnRate, responseTime, orderCount
 * @param {object} raw - output of getSellerRawData() — needs
 *   accountAgeDays, dailyVelocity
 * @returns {{ passed: boolean, gates: Array, failedGates: Array }}
 */
export function evaluateHardGates(metrics, raw) {
  const t = HARD_GATE_THRESHOLDS;

  const gates = [
    {
      key: 'accountAge',
      label: 'Account age',
      value: raw.accountAgeDays,
      threshold: t.minAccountAgeDays,
      passed: raw.accountAgeDays >= t.minAccountAgeDays,
      detail: `${raw.accountAgeDays} days on platform (needs ≥ ${t.minAccountAgeDays})`,
    },
    {
      key: 'fulfillmentRate',
      label: 'Order fulfillment',
      value: metrics.fulfillmentRate,
      threshold: t.minFulfillmentRate,
      passed: (metrics.fulfillmentRate ?? 0) >= t.minFulfillmentRate,
      detail: `${metrics.fulfillmentRate ?? 0}% fulfilled (needs ≥ ${t.minFulfillmentRate}%)`,
    },
    {
      key: 'returnRate',
      label: 'Return rate',
      value: metrics.returnRate,
      threshold: t.maxReturnRate,
      passed: (metrics.returnRate ?? 100) <= t.maxReturnRate,
      detail: `${metrics.returnRate ?? 0}% returned (needs ≤ ${t.maxReturnRate}%)`,
    },
    {
      key: 'responseTime',
      label: 'Avg response time',
      value: metrics.responseTime,
      threshold: t.maxAvgResponseHours,
      passed: (metrics.responseTime ?? Infinity) <= t.maxAvgResponseHours,
      detail: `${metrics.responseTime ?? '—'}h avg (needs ≤ ${t.maxAvgResponseHours}h)`,
    },
    {
      key: 'salesVelocity',
      label: 'Sales activity',
      value: round1(raw.dailyVelocity),
      threshold: t.minSalesPerDay,
      passed: raw.dailyVelocity >= t.minSalesPerDay,
      detail: `${round1(raw.dailyVelocity)} sales/day (needs ≥ ${t.minSalesPerDay}/day)`,
    },
  ];

  const failedGates = gates.filter((g) => !g.passed);

  return {
    passed: failedGates.length === 0,
    gates,
    failedGates,
  };
}

function round1(n) {
  return Math.round((n ?? 0) * 10) / 10;
}
