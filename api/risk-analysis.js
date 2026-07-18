// ─────────────────────────────────────────────────────────────────────────
// RISK ANALYSIS — GET /api/risk-analysis?sellerId=established
//
// This is the "real database" layer for Orbit Credit's risk gates. Instead
// of filtering a JS array that already sits in the browser's memory, this
// endpoint runs an actual MongoDB aggregation pipeline against the
// `orders` collection (seeded by scripts/seed-mongo.mjs) to compute the
// same aggregate figures — total sales, total returns, fulfillment count,
// average response time — as a genuine query, then layers the deterministic
// hard-gate rule engine (src/data/riskGates.js) on top of the result.
//
// Response shape:
//   {
//     source: "mongodb",
//     metrics: { orderCount, fulfillmentRate, returnRate, responseTime,
//                catalogFreshness, rating, dailyVelocity, accountAgeDays },
//     gates: { passed, gates: [...], failedGates: [...] }
//   }
// ─────────────────────────────────────────────────────────────────────────

import { getDb } from './lib/mongo.js';
import { evaluateHardGates } from '../src/data/riskGates.js';

function round1(n) {
  return Math.round((n ?? 0) * 10) / 10;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sellerId = req.query?.sellerId;
  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId query param' });
  }

  try {
    const db = await getDb();

    const sellerDoc = await db.collection('sellers').findOne({ sellerId });
    if (!sellerDoc) {
      return res.status(404).json({ error: `No seller found for sellerId "${sellerId}". Run scripts/seed-mongo.mjs first.` });
    }

    // Real Mongo aggregation — computes totals + rates in one query instead
    // of pulling every order document into JS and looping over it.
    const [orderAgg] = await db
      .collection('orders')
      .aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalFulfilled: { $sum: { $cond: ['$fulfilled', 1, 0] } },
            totalReturns: { $sum: { $cond: ['$returned', 1, 0] } },
            avgResponseHours: { $avg: '$responseHours' },
          },
        },
      ])
      .toArray();

    const [catalogAgg] = await db
      .collection('catalogItems')
      .aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            freshItems: { $sum: { $cond: [{ $lte: ['$lastUpdatedDaysAgo', 14] }, 1, 0] } },
          },
        },
      ])
      .toArray();

    const [reviewAgg] = await db
      .collection('reviews')
      .aggregate([{ $match: { sellerId } }, { $group: { _id: null, avgStars: { $avg: '$stars' } } }])
      .toArray();

    const orderCount = orderAgg?.totalSales ?? 0;
    const fulfillmentRate = orderCount ? round1((orderAgg.totalFulfilled / orderCount) * 100) : null;
    const returnRate = orderCount ? round1((orderAgg.totalReturns / orderCount) * 100) : null;
    const responseTime = orderAgg ? round1(orderAgg.avgResponseHours) : null;
    const catalogFreshness = catalogAgg?.totalItems
      ? round1((catalogAgg.freshItems / catalogAgg.totalItems) * 100)
      : 0;
    const rating = reviewAgg ? round1(reviewAgg.avgStars) : null;

    const metrics = {
      orderCount,
      fulfillmentRate,
      returnRate,
      responseTime,
      catalogFreshness,
      rating,
    };

    const raw = {
      accountAgeDays: sellerDoc.accountAgeDays,
      dailyVelocity: sellerDoc.dailyVelocity,
    };

    const gateResult = evaluateHardGates(metrics, raw);

    return res.status(200).json({
      source: 'mongodb',
      metrics: { ...metrics, dailyVelocity: round1(sellerDoc.dailyVelocity), accountAgeDays: sellerDoc.accountAgeDays },
      gates: gateResult,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Risk analysis query failed' });
  }
}
