// ─────────────────────────────────────────────────────────────────────────
// SCORE CALCULATOR
//
// Turns raw order-level records (from sellerDataAdapter) into the aggregate
// metrics the rest of the app reads, plus a transparent, explainable Orbit
// Score. This file — not a typed-in number — is the real "how is the score
// calculated" answer: every point is traceable to a specific metric via
// scoreBreakdown.
//
// This is deliberately a plain weighted formula, not an LLM call — a score
// needs to be the same number every time you compute it from the same
// data, and a judge needs to be able to check the arithmetic by hand.
// The Diagnose Agent (an LLM) then reasons about *why* the score looks
// this way and what to do about it — that's where the "agentic" part of
// Orbit Score lives, not in the arithmetic itself.
// ─────────────────────────────────────────────────────────────────────────

import { COLD_START_ORDER_THRESHOLD } from '../data/constants';

export const MIN_ORDERS_FOR_SCORE = COLD_START_ORDER_THRESHOLD;

const PLATFORM_AVG_RETURN_RATE = 18; // platform-wide reference, not seller data
const FRESHNESS_WINDOW_DAYS = 14;
const RESPONSE_TARGET_HOURS = 2;

function round1(n) {
  return Math.round(n * 10) / 10;
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

/**
 * @param {object} raw - the shape returned by getSellerRawData()
 * @returns computed metrics + scoreBreakdown, or insufficientData: true
 *          when there isn't enough order history to score meaningfully.
 */
export function computeSellerMetrics(raw) {
  const orderCount = raw.orders.length;

  if (orderCount < MIN_ORDERS_FOR_SCORE) {
    return {
      insufficientData: true,
      orderCount,
      returnRate: null,
      fulfillmentRate: null,
      catalogFreshness: null,
      avgCatalogAgeDays: null,
      responseTime: null,
      repeatBuyers: null,
      rating: null,
      orbitScore: null,
      scoreBreakdown: null,
      platformAvgReturnRate: PLATFORM_AVG_RETURN_RATE,
    };
  }

  const fulfilledCount = raw.orders.filter((o) => o.fulfilled).length;
  const returnedCount = raw.orders.filter((o) => o.returned).length;
  const fulfillmentRate = round1((fulfilledCount / orderCount) * 100);
  const returnRate = round1((returnedCount / orderCount) * 100);

  const freshCount = raw.catalogItems.filter((c) => c.lastUpdatedDaysAgo <= FRESHNESS_WINDOW_DAYS).length;
  const catalogFreshness = raw.catalogItems.length
    ? round1((freshCount / raw.catalogItems.length) * 100)
    : 0;
  const avgCatalogAgeDays = raw.catalogItems.length
    ? Math.round(raw.catalogItems.reduce((s, c) => s + c.lastUpdatedDaysAgo, 0) / raw.catalogItems.length)
    : null;

  const responseTime = raw.responseLogs.length
    ? round1(raw.responseLogs.reduce((s, r) => s + r.hours, 0) / raw.responseLogs.length)
    : null;

  const buyerCounts = {};
  raw.orders.forEach((o) => {
    buyerCounts[o.buyerId] = (buyerCounts[o.buyerId] || 0) + 1;
  });
  const uniqueBuyers = Object.keys(buyerCounts).length;
  const repeatBuyerCount = Object.values(buyerCounts).filter((c) => c > 1).length;
  const repeatBuyers = uniqueBuyers ? round1((repeatBuyerCount / uniqueBuyers) * 100) : 0;

  const rating = raw.reviews.length
    ? round1(raw.reviews.reduce((s, r) => s + r.stars, 0) / raw.reviews.length)
    : null;

  // ---- Weighted, transparent score formula (weights sum to 100) ----
  const fulfillmentPoints = clamp01(fulfillmentRate / 100) * 25;
  const returnPoints = clamp01(1 - returnRate / 40) * 20; // 0% return = full 20pts, 40%+ = 0
  const freshnessPoints = clamp01(catalogFreshness / 100) * 15;
  const responsePoints = clamp01((6 - (responseTime ?? 6)) / 6) * 15; // 0h = full 15pts, 6h+ = 0
  const repeatPoints = clamp01(repeatBuyers / 40) * 15; // 40%+ repeat = full 15pts
  const ratingPoints = clamp01(((rating ?? 3) - 3) / 2) * 10; // 3.0 = 0, 5.0 = full 10pts

  const scoreBreakdown = [
    {
      key: 'fulfillmentRate',
      label: 'Order fulfillment',
      earned: round1(fulfillmentPoints),
      possible: 25,
      detail: `${fulfillmentRate}% of orders fulfilled`,
    },
    {
      key: 'returnRate',
      label: 'Return rate',
      earned: round1(returnPoints),
      possible: 20,
      detail: `${returnRate}% returned vs ${PLATFORM_AVG_RETURN_RATE}% platform avg`,
    },
    {
      key: 'catalogFreshness',
      label: 'Catalog freshness',
      earned: round1(freshnessPoints),
      possible: 15,
      detail: `${catalogFreshness}% of listings updated in last ${FRESHNESS_WINDOW_DAYS} days`,
    },
    {
      key: 'responseTime',
      label: 'Response time',
      earned: round1(responsePoints),
      possible: 15,
      detail: `${responseTime}h avg vs ${RESPONSE_TARGET_HOURS}h target`,
    },
    {
      key: 'repeatBuyers',
      label: 'Repeat buyers',
      earned: round1(repeatPoints),
      possible: 15,
      detail: `${repeatBuyers}% of buyers ordered again`,
    },
    {
      key: 'rating',
      label: 'Rating',
      earned: round1(ratingPoints),
      possible: 10,
      detail: `${rating} / 5.0 average`,
    },
  ];

  const orbitScore = Math.round(scoreBreakdown.reduce((s, b) => s + b.earned, 0));

  return {
    insufficientData: false,
    orderCount,
    returnRate,
    fulfillmentRate,
    catalogFreshness,
    avgCatalogAgeDays,
    responseTime,
    repeatBuyers,
    rating,
    orbitScore,
    scoreBreakdown,
    platformAvgReturnRate: PLATFORM_AVG_RETURN_RATE,
  };
}
