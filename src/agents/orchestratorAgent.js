import { callClaude } from './claudeClient';
import { COLD_START_ORDER_THRESHOLD } from '../context/SellerContext';

// This is the piece that makes ORBIT genuinely agentic rather than a fixed
// UI-scripted pipeline: no `if` statement in React decides the seller's path.
// The Orchestrator Agent is handed the seller's raw signal and DECIDES —
// with visible reasoning — whether there's enough order history for a real
// coaching loop, or whether this is a cold-start seller who needs a
// different kind of guidance entirely. The frontend just renders whichever
// route the agent picks.

export function buildOrchestratorSystemPrompt(seller) {
  return `You are ORBIT's Orchestrator Agent. You sit in front of ORBIT's other
agents (Diagnose, Plan, Verify, Cold-Start Coach) and decide which path a
seller should be routed down. You do not coach the seller yourself — you
route.

Seller signal available to you:
- Account age: ${seller.accountAge} months
- Completed orders: ${seller.orderCount}
- Orbit Score on file: ${seller.orbitScore === null ? 'none — insufficient history' : seller.orbitScore}
- Return rate on file: ${seller.returnRate === null ? 'none' : seller.returnRate + '%'}
- Category: ${seller.category}

Routing rule of thumb: a seller needs roughly ${COLD_START_ORDER_THRESHOLD}+
completed orders before return rate, fulfillment rate, and repeat-buyer
metrics are statistically meaningful rather than noise. Below that, running
a full Diagnose→Plan→Verify loop on thin data would produce a misleading,
overconfident diagnosis — worse than no score at all.

Decide between exactly two routes:
- "SCORE_LOOP" — seller has enough order history for a real Diagnose → Plan →
  Verify coaching loop
- "COLD_START" — seller has too little history; route to category-benchmark
  guidance instead of a fabricated personal score

Respond with ONLY raw JSON, no markdown fences, no preamble:

{
  "route": "SCORE_LOOP" or "COLD_START",
  "reasoning": "2-3 sentences explaining the decision using the seller's actual numbers",
  "confidence": 0-100
}`;
}

function cleanJson(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function runOrchestratorAgent(seller, onLog) {
  onLog('ORCHESTRATOR', `Evaluating seller signal — ${seller.orderCount} orders on file`);
  const raw = await callClaude(
    buildOrchestratorSystemPrompt(seller),
    [{ role: 'user', content: 'Decide the route now.' }],
    { maxTokens: 400 }
  );
  try {
    const decision = JSON.parse(cleanJson(raw));
    onLog('ORCHESTRATOR', `Decision: ${decision.route} (${decision.confidence}% confidence)`);
    return decision;
  } catch (e) {
    onLog('SYSTEM', 'Orchestrator returned malformed JSON — defaulting to COLD_START (safe fallback)');
    return {
      route: 'COLD_START',
      reasoning: 'Fallback: could not parse routing decision, defaulting to the conservative path.',
      confidence: 0,
    };
  }
}
