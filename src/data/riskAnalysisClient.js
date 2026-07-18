// ─────────────────────────────────────────────────────────────────────────
// RISK ANALYSIS CLIENT
//
// Calls /api/risk-analysis, which runs a real MongoDB aggregation query
// (see api/risk-analysis.js) and applies the hard-gate rule engine
// server-side. If that call fails for any reason — Mongo not seeded yet,
// no MONGODB_URI configured, network hiccup during a live demo — this
// falls back to running the exact same rule engine (src/data/riskGates.js)
// against the seller's locally-computed metrics, so Orbit Credit's gate
// check never hard-fails the whole flow. The UI is told which path was
// used via `source`, so this is visible rather than silently masked.
// ─────────────────────────────────────────────────────────────────────────

import { evaluateHardGates } from './riskGates';

export async function getRiskGateResult(seller) {
  try {
    const res = await fetch(`/api/risk-analysis?sellerId=${encodeURIComponent(seller.id)}`);
    if (!res.ok) throw new Error(`risk-analysis endpoint returned ${res.status}`);
    const data = await res.json();
    return { source: 'mongodb', gates: data.gates, metrics: data.metrics };
  } catch (err) {
    // Local fallback — same rule engine, same thresholds, run against the
    // metrics already computed client-side for this seller.
    const gateResult = evaluateHardGates(seller, seller.rawData);
    return { source: 'local-fallback', gates: gateResult, metrics: null, fallbackReason: err.message };
  }
}
