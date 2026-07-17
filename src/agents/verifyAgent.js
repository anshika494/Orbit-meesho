import { callClaude } from './claudeClient';

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

export async function runVerifyAgent(planText, seller, onLog) {
  onLog('VERIFY AGENT', 'Reviewing plan, defining checkpoints...');
  const raw = await callClaude(
    buildVerifySystemPrompt(planText, seller),
    [{ role: 'user', content: 'Verify the plan now.' }],
    { maxTokens: 700 }
  );
  onLog('VERIFY AGENT', 'Verification complete. Cycle ready.');
  return raw.trim();
}
