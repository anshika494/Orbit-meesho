// ─────────────────────────────────────────────────────────────────────────
// SELLER DATA CLIENT
//
// Calls /api/seller-data, which reads real documents from MongoDB (see
// api/seller-data.js) and reshapes them into the exact contract
// getSellerRawData() defines. If that call fails — Mongo not seeded,
// MONGODB_URI not set, a flaky connection mid-demo — this falls back to
// the local synthetic generator, so Orbit Score never breaks the app.
// The caller is told which source was used via the returned `source` field,
// the same pattern already used for Orbit Credit's risk gates.
// ─────────────────────────────────────────────────────────────────────────

import { getSellerRawData } from './sellerDataAdapter';

export async function getSellerData(sellerId, meta) {
  try {
    const res = await fetch(`/api/seller-data?sellerId=${encodeURIComponent(sellerId)}`);
    if (!res.ok) throw new Error(`seller-data endpoint returned ${res.status}`);
    const raw = await res.json();
    return { source: 'mongodb', raw };
  } catch (err) {
    return { source: 'local-fallback', raw: getSellerRawData(sellerId, meta), fallbackReason: err.message };
  }
}
