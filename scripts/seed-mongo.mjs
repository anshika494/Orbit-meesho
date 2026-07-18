// ─────────────────────────────────────────────────────────────────────────
// SEED MONGO
//
// Populates a MongoDB database with the same synthetic-but-realistic seller
// data the app already generates client-side (src/data/sellerDataAdapter.js)
// — except this time it's written into real collections, so the risk
// analysis endpoint (api/risk-analysis.js) can run genuine Mongo queries
// over it instead of filtering a JS array in memory.
//
// Run once (or whenever you want to reset the data):
//   MONGODB_URI="mongodb+srv://..." node scripts/seed-mongo.mjs
//
// Collections created in the `orbit` database:
//   sellers        — one document per seller (identity + account fields)
//   orders         — one document per order, each tagged with sellerId
//   catalogItems   — one document per listed product, tagged with sellerId
//   reviews        — one document per buyer review, tagged with sellerId
//
// The seller profiles and calibration knobs mirror SELLERS in
// src/context/SellerContext.jsx, so the numbers a judge sees in the app
// (client-generated) and the numbers the DB-backed risk gate check reads
// are the same seller, same story — just two different data paths to the
// same shape.
// ─────────────────────────────────────────────────────────────────────────

import { MongoClient } from 'mongodb';

const DAY_MS = 24 * 60 * 60 * 1000;

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

// Same two seed profiles as SellerContext.jsx — kept in sync manually since
// this script runs standalone (outside Vite, can't import a .jsx context).
const SELLERS = [
  {
    sellerId: 'established',
    name: 'Priya Sharma',
    category: 'Cotton Kurtis',
    location: 'Jaipur, Rajasthan',
    monthlyGMV: 76000,
    accountAgeMonths: 8,
    orderCount: 214,
    baseFulfillmentMiss: 0.06,
    baseReturnRate: 0.22,
    baseResponseHours: 3.2,
    baseRating: 4.1,
    catalogStalenessSpread: 34,
    currentStockUnits: 47,
  },
  {
    sellerId: 'newSeller',
    name: 'Anjali Devi',
    category: 'Handmade Jewellery',
    location: 'Lucknow, Uttar Pradesh',
    monthlyGMV: 0,
    accountAgeMonths: 0,
    orderCount: 2,
    baseFulfillmentMiss: 0.05,
    baseReturnRate: 0.15,
    baseResponseHours: 5,
    baseRating: 4.0,
    catalogStalenessSpread: 20,
    currentStockUnits: 18,
  },
];

function buildDocsForSeller(profile) {
  const rand = mulberry32(seedFromString(profile.sellerId));
  const now = Date.now();
  const accountAgeDays = Math.max(1, Math.round(profile.accountAgeMonths * 30));
  const orderCount = profile.orderCount;
  const buyerPoolSize = Math.max(1, Math.round(orderCount * 0.72));

  const orders = [];
  for (let i = 0; i < orderCount; i += 1) {
    const daysAgo = Math.round(rand() * accountAgeDays);
    const fulfilled = rand() > profile.baseFulfillmentMiss;
    const returned = fulfilled && rand() < profile.baseReturnRate;
    orders.push({
      sellerId: profile.sellerId,
      orderId: `order_${i}`,
      placedAt: new Date(now - daysAgo * DAY_MS),
      buyerId: `buyer_${Math.floor(rand() * buyerPoolSize)}`,
      fulfilled,
      returned,
      responseHours: Math.max(0.2, profile.baseResponseHours + (rand() - 0.5) * 2),
    });
  }

  const catalogCount = Math.max(1, Math.round(orderCount / 12) || 1);
  const catalogItems = Array.from({ length: catalogCount }, (_, i) => ({
    sellerId: profile.sellerId,
    itemId: `item_${i}`,
    lastUpdatedDaysAgo: Math.round(rand() * profile.catalogStalenessSpread),
  }));

  const reviewCount = Math.max(0, Math.round(orderCount / 3));
  const reviews = Array.from({ length: reviewCount }, () => ({
    sellerId: profile.sellerId,
    stars: Math.min(5, Math.max(1, Math.round(profile.baseRating + (rand() - 0.5) * 1.6))),
  }));

  const dailyVelocity = orderCount > 0 ? Math.max(0.5, orderCount / accountAgeDays) : 0.5;

  const sellerDoc = {
    sellerId: profile.sellerId,
    name: profile.name,
    category: profile.category,
    location: profile.location,
    monthlyGMV: profile.monthlyGMV,
    accountAgeDays,
    currentStockUnits: profile.currentStockUnits,
    dailyVelocity,
    updatedAt: new Date(),
  };

  return { sellerDoc, orders, catalogItems, reviews };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI before running this script.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('orbit');

  for (const profile of SELLERS) {
    const { sellerDoc, orders, catalogItems, reviews } = buildDocsForSeller(profile);

    await db.collection('sellers').deleteMany({ sellerId: profile.sellerId });
    await db.collection('orders').deleteMany({ sellerId: profile.sellerId });
    await db.collection('catalogItems').deleteMany({ sellerId: profile.sellerId });
    await db.collection('reviews').deleteMany({ sellerId: profile.sellerId });

    await db.collection('sellers').insertOne(sellerDoc);
    if (orders.length) await db.collection('orders').insertMany(orders);
    if (catalogItems.length) await db.collection('catalogItems').insertMany(catalogItems);
    if (reviews.length) await db.collection('reviews').insertMany(reviews);

    console.log(`Seeded ${profile.sellerId}: ${orders.length} orders, ${catalogItems.length} catalog items, ${reviews.length} reviews`);
  }

  await db.collection('orders').createIndex({ sellerId: 1 });
  await db.collection('catalogItems').createIndex({ sellerId: 1 });
  await db.collection('reviews').createIndex({ sellerId: 1 });

  console.log('Done. Indexes created on sellerId for all collections.');
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
