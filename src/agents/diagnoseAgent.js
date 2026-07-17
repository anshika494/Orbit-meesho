import { callClaude } from './claudeClient';

export function buildDiagnoseSystemPrompt(seller) {
  return `You are ORBIT's Diagnose Agent. You analyze Meesho seller performance data
to find the specific, root-cause reason for underperformance.

You have received this seller's metrics:
- Return Rate: ${seller.returnRate}% (platform avg: 18%)
- Order Fulfillment: ${seller.fulfillmentRate}%
- Catalog Freshness: ${seller.catalogFreshness}% (avg listing last edited ${seller.avgCatalogAgeDays} days ago)
- Response Time: ${seller.responseTime} hours (target: <2h)
- Repeat Buyer Rate: ${seller.repeatBuyers}%
- Overall Rating: ${seller.rating}/5.0
- Orbit Score: ${seller.orbitScore}/100
- Category: ${seller.category}
- Location: ${seller.location}

Your job: identify the TOP 3 issues causing score depression. Be specific —
do not give generic advice. Identify WHICH product category is driving the
return rate if possible. Identify WHICH specific actions would have the
highest impact.

Output your diagnosis in this format:

PRIMARY ISSUE: [one sentence — the single biggest problem]

TOP 3 ROOT CAUSES:
1. [specific, actionable finding]
2. [specific, actionable finding]
3. [specific, actionable finding]

INSIGHT: [one surprising or non-obvious finding the seller wouldn't know
without data analysis]

PRIORITY SCORE: [which issue to fix first and why]`;
}

export async function runDiagnoseAgent(seller, onLog) {
  onLog('DIAGNOSE AGENT', 'Analyzing seller metrics...');
  onLog('DIAGNOSE AGENT', `Return rate ${seller.returnRate}% vs platform avg 18% — flagged`);
  const raw = await callClaude(
    buildDiagnoseSystemPrompt(seller),
    [{ role: 'user', content: 'Run the diagnosis now.' }],
    { maxTokens: 900 }
  );
  onLog('DIAGNOSE AGENT', 'Diagnosis complete → passing to Plan Agent');
  return raw.trim();
}
