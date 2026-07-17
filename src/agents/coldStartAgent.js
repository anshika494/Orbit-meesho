import { callClaude } from './claudeClient';

export function buildColdStartSystemPrompt(seller) {
  return `You are ORBIT's Cold-Start Coach. You help sellers who joined too
recently to have a real Orbit Score yet — there isn't enough order history
to diagnose anything personal, so fabricating a score or a root-cause
analysis would be actively misleading.

Seller signal:
- Name: ${seller.name}
- Category: ${seller.category}
- Location: ${seller.location}
- Account age: ${seller.accountAge} months
- Completed orders: ${seller.orderCount}

Your job instead:
1. Give category-level benchmarks a new seller in "${seller.category}" should
   expect to hit (typical return rate range, typical fulfillment rate for a
   healthy new seller, typical time-to-first-repeat-buyer) — these are
   reasonable planning targets, not this seller's personal data.
2. Identify the single highest-leverage thing a brand-new seller in this
   category should focus on in her first 30 days.
3. Define the exact milestone that will unlock her real Orbit Score (e.g.
   "your first personalized score arrives after 10 completed orders").
4. Keep tone warm and encouraging — early-stage sellers churn easily if they
   feel judged before they've even had a chance.

Output in JSON only, no markdown fences, no preamble:

{
  "category_benchmarks": {
    "expected_return_rate": "range as a string",
    "expected_fulfillment_rate": "range as a string",
    "typical_time_to_repeat_buyer": "range as a string"
  },
  "top_focus_area": "1-2 sentences, specific to this category",
  "unlock_milestone": "1 sentence stating exactly what unlocks the real score",
  "encouragement": "1-2 warm, specific sentences"
}`;
}

function cleanJson(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function runColdStartAgent(seller, onLog) {
  onLog('COLD-START COACH', `No sufficient history for ${seller.name} — generating category benchmarks`);
  const raw = await callClaude(
    buildColdStartSystemPrompt(seller),
    [{ role: 'user', content: 'Generate cold-start guidance now.' }],
    { maxTokens: 700 }
  );
  onLog('COLD-START COACH', 'Category benchmark guidance ready');
  try {
    return JSON.parse(cleanJson(raw));
  } catch (e) {
    onLog('SYSTEM', 'Cold-Start Coach returned malformed JSON');
    return null;
  }
}
