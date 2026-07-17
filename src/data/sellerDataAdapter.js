// ─────────────────────────────────────────────────────────────────────────
// SELLER DATA ADAPTER
//
// This is the one function the rest of the app is allowed to ask "what
// happened in this seller's account?" — nothing else reads seller history
// directly. Today getSellerRawData() returns synthetic-but-realistic
// order-level records, generated deterministically from a seed so every
// demo run looks the same. The day real Meesho API access exists, this is
// the only function that needs to change — swap the body for a real call
// to the seller's order-history / returns / catalog endpoints, keep the
// same return shape, and every consumer (scoreCalculator, the agents,
// the UI) keeps working untouched.
//
// Return shape (this is the "contract" a real API integration must match):
//   {
//     orders:        [{ id, placedAt, buyerId, fulfilled, returned }],
//     catalogItems:  [{ id, lastUpdatedDaysAgo }],
//     responseLogs:  [{ hours }],
//     reviews:       [{ stars }],
//     currentStockUnits, dailyVelocity, accountAgeDays
//   }
// ─────────────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// Deterministic PRNG (mulberry32) so the same seller always generates the
// same synthetic history — a demo re-run doesn't shuffle the numbers.
function mulberry32(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * @param {string} sellerId - stable id, used to seed the generator
 * @param {object} meta - calibration knobs from the seller's profile:
 *    accountAge (months), orderCount, baseFulfillmentMiss (0-1),
 *    baseReturnRate (0-1), baseResponseHours, baseRating (1-5),
 *    catalogStalenessSpread (days), currentStockUnits
 */
export function getSellerRawData(sellerId, meta = {}) {
  const rand = mulberry32(seedFromString(sellerId));
  const now = Date.now();

  const accountAgeDays = Math.max(1, Math.round((meta.accountAge || 0) * 30));
  const orderCount = meta.orderCount || 0;

  // Orders spread across the account's lifetime. Each buyer is drawn from a
  // pool smaller than the order count, so some buyers naturally reorder —
  // that's what repeat-buyer rate is computed from downstream.
  const buyerPoolSize = Math.max(1, Math.round(orderCount * 0.72));
  const orders = [];
  for (let i = 0; i < orderCount; i += 1) {
    const daysAgo = Math.round(rand() * accountAgeDays);
    const buyerId = `buyer_${Math.floor(rand() * buyerPoolSize)}`;
    const fulfilled = rand() > (meta.baseFulfillmentMiss ?? 0.06);
    const returned = fulfilled && rand() < (meta.baseReturnRate ?? 0.2);
    orders.push({
      id: `order_${i}`,
      placedAt: now - daysAgo * DAY_MS,
      buyerId,
      fulfilled,
      returned,
    });
  }

  // Catalog listings, each with a "days since last edited" value — this is
  // what catalog freshness is computed from, instead of a flat percentage.
  const catalogCount = Math.max(1, Math.round(orderCount / 12) || 1);
  const catalogItems = Array.from({ length: catalogCount }, (_, i) => ({
    id: `item_${i}`,
    lastUpdatedDaysAgo: Math.round(rand() * (meta.catalogStalenessSpread ?? 45)),
  }));

  // First-response time per order, in hours.
  const responseLogs = orders.map(() => ({
    hours: Math.max(0.2, (meta.baseResponseHours ?? 3) + (rand() - 0.5) * 2),
  }));

  // Buyer reviews, roughly one per three orders.
  const reviewCount = Math.max(0, Math.round(orderCount / 3));
  const reviews = Array.from({ length: reviewCount }, () => ({
    stars: Math.min(5, Math.max(1, Math.round((meta.baseRating ?? 4.0) + (rand() - 0.5) * 1.6))),
  }));

  // Live inventory snapshot, used by the Credit signal calculations.
  const currentStockUnits = meta.currentStockUnits ?? Math.round(20 + rand() * 60);
  const dailyVelocity = orderCount > 0 ? Math.max(0.5, orderCount / accountAgeDays) : 0.5;

  return {
    orders,
    catalogItems,
    responseLogs,
    reviews,
    currentStockUnits,
    dailyVelocity,
    accountAgeDays,
  };
}
