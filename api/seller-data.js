// ─────────────────────────────────────────────────────────────────────────
// SELLER DATA — GET /api/seller-data?sellerId=established
//
// Returns the same raw-data shape src/data/sellerDataAdapter.js's
// getSellerRawData() produces, except pulled from real MongoDB documents
// (seeded by scripts/seed-mongo.mjs) instead of generated in the browser.
//
// This is the "swap in real data" moment for Orbit Score: computeSellerMetrics()
// in src/agents/scoreCalculator.js doesn't change at all — it only cares
// about this shape, not where it came from. The frontend client
// (src/data/sellerDataClient.js) calls this endpoint first and falls back
// to the local generator only if this call fails.
//
// Response shape (identical contract to getSellerRawData()):
//   {
//     orders:        [{ id, placedAt, buyerId, fulfilled, returned }],
//     catalogItems:  [{ id, lastUpdatedDaysAgo }],
//     responseLogs:  [{ hours }],
//     reviews:       [{ stars }],
//     currentStockUnits, dailyVelocity, accountAgeDays
//   }
// ─────────────────────────────────────────────────────────────────────────

import { getDb } from './lib/mongo.js';

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

    const [orderDocs, catalogDocs, reviewDocs] = await Promise.all([
      db.collection('orders').find({ sellerId }).sort({ placedAt: 1 }).toArray(),
      db.collection('catalogItems').find({ sellerId }).toArray(),
      db.collection('reviews').find({ sellerId }).toArray(),
    ]);

    // Reshape Mongo documents into the exact contract getSellerRawData()
    // returns — same field names, same nesting — so computeSellerMetrics()
    // and every agent downstream work unmodified.
    const orders = orderDocs.map((o) => ({
      id: o.orderId,
      placedAt: new Date(o.placedAt).getTime(),
      buyerId: o.buyerId,
      fulfilled: o.fulfilled,
      returned: o.returned,
    }));

    const responseLogs = orderDocs.map((o) => ({ hours: o.responseHours }));

    const catalogItems = catalogDocs.map((c) => ({
      id: c.itemId,
      lastUpdatedDaysAgo: c.lastUpdatedDaysAgo,
    }));

    const reviews = reviewDocs.map((r) => ({ stars: r.stars }));

    return res.status(200).json({
      orders,
      catalogItems,
      responseLogs,
      reviews,
      currentStockUnits: sellerDoc.currentStockUnits,
      dailyVelocity: sellerDoc.dailyVelocity,
      accountAgeDays: sellerDoc.accountAgeDays,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Seller data query failed' });
  }
}
