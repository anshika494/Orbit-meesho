// ─────────────────────────────────────────────────────────────────────────
// MONGO CONNECTION HELPER
//
// Serverless functions can get invoked many times, so we cache the client
// across invocations (on `global`) instead of reconnecting on every
// request — the standard pattern for Mongo + serverless.
//
// Requires MONGODB_URI as a server-side environment variable (set it in
// the Vercel dashboard, same place as ANTHROPIC_API_KEY). It is never
// read from the frontend.
// ─────────────────────────────────────────────────────────────────────────

import { MongoClient } from 'mongodb';

const DB_NAME = 'orbit';

let cachedClientPromise = global._orbitMongoClientPromise;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!cachedClientPromise) {
    const client = new MongoClient(uri);
    cachedClientPromise = client.connect();
    global._orbitMongoClientPromise = cachedClientPromise;
  }
  return cachedClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
