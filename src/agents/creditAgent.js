import { callClaude } from './claudeClient';
import { computeCreditSignals } from '../data/creditSignals';

// ─────────────────────────────────────────────────────────────────────────
// ORBIT CREDIT — now a genuine 2-agent chain, not one LLM call:
//
//   computeCreditSignals()  (deterministic, not an LLM — real numbers
//                            derived from the seller's own order/stock data)
//        │
//        ▼
//   Credit Recommendation Agent   → produces an initial offer
//        │
//        ▼
//   Credit Risk Reflection Agent  → critiques the offer against the
//                                    seller's actual repayment signal
//                                    (Orbit Score, return rate, GMV)
//        │
//   if NOT approved ──▶ Recommendation Agent re-runs once, told exactly
//                        what the reflection flagged, and adjusts terms
//        │
//        ▼
//   final offer + the risk assessment that approved it
//
// This mirrors the Diagnose→Reflect and Plan→Reflect pattern used in Orbit
// Score: an agent's output is checked by a second agent before it reaches
// the seller, and gets revised if that check fails.
// ─────────────────────────────────────────────────────────────────────────

function cleanJson(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export function buildCreditRecommendationPrompt(seller, signals, adjustmentNote) {
  return `You are ORBIT's Credit Recommendation Agent. You analyze converging demand,
inventory, and timing signals to generate a proactive, personalized financing
recommendation for a Meesho seller.

Seller profile:
- Category: ${seller.category}
- Monthly GMV: ~₹${seller.monthlyGMV.toLocaleString('en-IN')}
- Fulfillment rate: ${seller.fulfillmentRate}%
- Return rate: ${seller.returnRate}%
- Account age: ${seller.accountAge} months
- Current Orbit Score: ${seller.orbitScore}/100

Signals detected (computed from this seller's actual order and stock data —
not assumed):
- Demand: ${signals.demand.changePct >= 0 ? '+' : ''}${signals.demand.changePct}% change in order volume over the last 30 days${signals.demand.alert ? ' (ALERT — meaningful spike)' : ' (no significant spike)'}
- Inventory: current stock of ${signals.inventory.currentStockUnits} units, selling at ~${signals.inventory.dailyVelocity}/day → runs out in ${signals.inventory.daysToStockout} days${signals.inventory.alert ? ' (ALERT — stockout risk)' : ''}
- Timing: ${signals.festival.name} is ${signals.festival.daysToFestival} days away, restock lead time is ${signals.festival.restockLeadDays} days → ${signals.festival.actionWindowDays} day action window${signals.festival.alert ? ' (ALERT — window closing)' : ''}

${adjustmentNote ? `IMPORTANT — a Risk Reflection Agent reviewed your previous offer and flagged this: "${adjustmentNote}". Revise the offer to address it directly.\n` : ''}
Generate a financing recommendation with:
1. Recommended loan amount (base it on GMV and how strong the alert signals actually are — do not recommend a large loan if the signals are weak or the seller's return rate is high)
2. Why NOW is the right moment (urgency reasoning grounded in the actual signal numbers above)
3. What the seller gains if she acts vs loses if she doesn't
4. Repayment viability assessment based on her GMV, Orbit Score, and return rate
5. One risk the seller should know about

Keep it warm, specific, and in the seller's interest — not salesy. If the
signals are weak, it's fine to recommend a smaller amount or advise caution.

Respond with ONLY raw JSON, no markdown fences, no preamble:

{
  "loan_amount": "₹X",
  "rate": "18%",
  "tenure": "6 months",
  "emi": "₹X",
  "partner": "Kinara Capital",
  "why_now": "2-3 sentences",
  "gain_if_act": "1 sentence",
  "loss_if_wait": "1 sentence",
  "repayment_viability": "brief assessment",
  "risk_note": "1 honest sentence"
}`;
}

export const CREDIT_RISK_REFLECTION_PROMPT = `You are ORBIT's Credit Risk Reflection Agent.
You review a financing offer produced by the Credit Recommendation Agent
before it's shown to the seller — you are the safety check.

CHECK FOR:
1. Is the loan amount proportional to the seller's monthly GMV? (a loan
   larger than ~1x monthly GMV for a mid-score seller is a red flag)
2. Does the seller's return rate or Orbit Score suggest repayment risk that
   the offer doesn't account for?
3. Is "why_now" actually grounded in the signal numbers given, or generic?
4. Is the risk_note honest, or does it downplay a real concern?
5. Would a responsible lender actually approve this, given the data?

Respond with ONLY raw JSON, no markdown fences, no preamble:

{
  "approved": true or false,
  "risk_level": "low" or "medium" or "high",
  "assessment": "2-3 sentences on whether this offer is sound, referencing the actual numbers",
  "adjustment_needed": "if not approved, one specific instruction for what to change — otherwise null"
}`;

export async function runCreditPipeline(seller, onLog) {
  onLog('CREDIT AGENT', 'Computing demand, inventory, and timing signals from order data...');
  const signals = computeCreditSignals(seller.rawData);
  onLog(
    'CREDIT AGENT',
    `Signals: demand ${signals.demand.changePct >= 0 ? '+' : ''}${signals.demand.changePct}%, ` +
      `stockout in ${signals.inventory.daysToStockout}d, ${signals.festival.actionWindowDays}d action window`
  );

  onLog('CREDIT AGENT', 'Generating financing recommendation...');
  const firstRaw = await callClaude(
    buildCreditRecommendationPrompt(seller, signals, null),
    [{ role: 'user', content: 'Generate the financing recommendation now.' }],
    { maxTokens: 800 }
  );

  let offer;
  try {
    offer = JSON.parse(cleanJson(firstRaw));
  } catch (e) {
    onLog('SYSTEM', 'Credit Agent returned malformed JSON');
    return { offer: null, signals, risk: null };
  }
  onLog('CREDIT AGENT', `Initial offer: ${offer.loan_amount} at ${offer.rate}`);

  onLog('RISK REFLECTION', 'Checking offer against repayment signal...');
  const reflectionRaw = await callClaude(
    CREDIT_RISK_REFLECTION_PROMPT,
    [
      {
        role: 'user',
        content: `SELLER: Orbit Score ${seller.orbitScore}/100, return rate ${seller.returnRate}%, monthly GMV ₹${seller.monthlyGMV}\n\nOFFER TO REVIEW:\n${JSON.stringify(offer, null, 2)}`,
      },
    ],
    { maxTokens: 500 }
  );

  let risk;
  try {
    risk = JSON.parse(cleanJson(reflectionRaw));
  } catch (e) {
    onLog('SYSTEM', 'Risk Reflection Agent returned malformed JSON — proceeding with unreviewed offer');
    risk = { approved: true, risk_level: 'unknown', assessment: 'Reflection unavailable.', adjustment_needed: null };
  }
  onLog('RISK REFLECTION', `${risk.approved ? '✓ Approved' : '✗ Flagged'} — risk level: ${risk.risk_level}`);

  if (!risk.approved && risk.adjustment_needed) {
    onLog('CREDIT AGENT', `Revising offer: ${risk.adjustment_needed}`);
    const revisedRaw = await callClaude(
      buildCreditRecommendationPrompt(seller, signals, risk.adjustment_needed),
      [{ role: 'user', content: 'Generate the revised financing recommendation now.' }],
      { maxTokens: 800 }
    );
    try {
      offer = JSON.parse(cleanJson(revisedRaw));
      onLog('CREDIT AGENT', `Revised offer: ${offer.loan_amount} at ${offer.rate}`);
    } catch (e) {
      onLog('SYSTEM', 'Revised offer was malformed JSON — keeping original offer with risk warning attached');
    }
  }

  return { offer, signals, risk };
}
