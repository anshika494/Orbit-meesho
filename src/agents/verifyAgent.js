import { callClaude } from './claudeClient';

// ─── Phase 1: Verify Agent (checkpoint text after Plan Agent) ────────────────
// Called immediately after the Plan Agent, same as before. Now returns both
// the checkpoint text AND the parsed targets so the Score module can persist
// them for outcome comparison after one week.

export function buildVerifySystemPrompt(planText, seller) {
  return `You are ORBIT's Verify Agent. You review the 7-day plan and define exactly
what success looks like and how it will be measured.

Current Orbit Score: ${seller.orbitScore}/100

Plan received:
${planText}

Output:
VERIFICATION CHECKPOINTS: [list of 5 specific, binary yes/no things to check]
SCORE PREDICTION: If all tasks complete → Score moves from ${seller.orbitScore} to [X]
                  If 50% complete → Score moves from ${seller.orbitScore} to [Y]
NEXT CYCLE: What the next week's Diagnose Agent should look for
EARLY WIN: The one task most likely to show results within 48 hours`;
}

export async function runVerifyAgent(planData, seller, onLog) {
  // planData is now { text, targets } from runPlanAgent
  const planText = typeof planData === 'string' ? planData : planData.text;
  const targets = typeof planData === 'string' ? null : planData.targets;

  onLog('VERIFY AGENT', 'Reviewing plan, defining checkpoints...');
  const raw = await callClaude(
    buildVerifySystemPrompt(planText, seller),
    [{ role: 'user', content: 'Verify the plan now.' }],
    { maxTokens: 700 }
  );
  onLog('VERIFY AGENT', 'Verification complete. Cycle ready.');
  return { text: raw.trim(), targets };
}

// ─── Phase 2: Outcome Verify Agent (called after "Simulate One Week Later") ──
// Receives the original plan targets and the seller's updated metrics,
// then evaluates which targets were hit, missed, partially achieved, and
// what to do differently next week.

export function buildOutcomeSystemPrompt(targets, baselineSeller, weekOneMetrics) {
  const rows = Object.entries(targets).map(([key, target]) => {
    const actual = weekOneMetrics[key];
    const isLowerBetter = key === 'returnRate' || key === 'responseTime';
    let pct;
    if (isLowerBetter) {
      // For "lower is better", progress = how much we reduced from baseline toward target
      const baseline = baselineSeller[key] ?? target * 1.3;
      const improvement = baseline - actual;
      const needed = baseline - target;
      pct = needed <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, (improvement / needed) * 100)));
    } else {
      const baseline = baselineSeller[key] ?? target * 0.8;
      const improvement = actual - baseline;
      const needed = target - baseline;
      pct = needed <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, (improvement / needed) * 100)));
    }
    const hit = isLowerBetter ? actual <= target : actual >= target;
    return `- ${key}: target=${target}, actual=${actual}, progress=${pct}%, ${hit ? 'HIT ✓' : 'MISSED ✗'}`;
  }).join('\n');

  return `You are ORBIT's Outcome Verify Agent. A seller followed a 7-day plan and
you are now evaluating their actual results against the plan targets.

BASELINE METRICS (week start):
${Object.entries(baselineSeller)
  .filter(([k]) => k in targets)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

PLAN TARGETS vs ACTUAL RESULTS:
${rows}

Your job:
1. Evaluate each metric: did the seller hit, partially achieve, or miss the target?
2. For each miss, give a specific, likely root cause (1 sentence max).
3. State the overall outcome in one line: "X of 6 targets achieved".
4. Recommend 1-2 concrete adjustments for next week's plan.
5. Predict how the seller's Orbit Score likely moved based on these outcomes.

Keep tone warm, factual, and motivating — not judgmental. Use Hinglish naturally.

Output format:
OUTCOME SUMMARY: [X of 6 targets achieved — one sentence on overall direction]

TARGET BREAKDOWN:
[for each metric: HIT/PARTIAL/MISSED — reason if missed — what to do next]

SCORE MOVEMENT: [predicted score delta based on actual results]

NEXT WEEK FOCUS: [1-2 specific adjustments for the next plan cycle]

MOTIVATION: [one encouraging line]`;
}

export async function runOutcomeVerifyAgent(targets, baselineSeller, weekOneMetrics, onLog) {
  onLog('OUTCOME VERIFY AGENT', 'Comparing week-1 actuals against plan targets...');

  const rows = Object.entries(targets).map(([key, target]) => {
    const actual = weekOneMetrics[key];
    return `${key}: target ${target}, actual ${actual}`;
  }).join(' | ');
  onLog('OUTCOME VERIFY AGENT', rows);

  const raw = await callClaude(
    buildOutcomeSystemPrompt(targets, baselineSeller, weekOneMetrics),
    [{ role: 'user', content: 'Evaluate outcomes now.' }],
    { maxTokens: 900 }
  );
  onLog('OUTCOME VERIFY AGENT', 'Outcome evaluation complete.');
  return raw.trim();
}
