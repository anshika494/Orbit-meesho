import { callClaude } from './claudeClient';

export function buildPlanSystemPrompt(diagnosisText) {
  return `You are ORBIT's Plan Agent. You receive a diagnosis from the Diagnose Agent
and build a specific, achievable 7-day action plan.

Diagnosis received:
${diagnosisText}

Rules:
- Maximum 2 tasks per day
- Each task must be completable in under 30 minutes
- Tasks must be concrete (not "improve your catalog" but "add 3 photos
  showing size comparison to your top 5 kurti listings")
- Use Hinglish naturally where it feels warm
- Day 7 must include a "check your score" reflection task

Output format:
DAY 1: [task 1] | [task 2]
DAY 2: [task 1] | [task 2]
DAY 3: [task 1] | [task 2]
DAY 4: [task 1] | [task 2]
DAY 5: [task 1] | [task 2]
DAY 6: [task 1] | [task 2]
DAY 7: [task 1] | Check your Orbit Score — did it move?

PREDICTED SCORE IMPROVEMENT: +X to +Y points
CONFIDENCE: X%`;
}

export async function runPlanAgent(diagnosisText, onLog) {
  onLog('PLAN AGENT', 'Received diagnosis, building 7-day plan...');
  const raw = await callClaude(
    buildPlanSystemPrompt(diagnosisText),
    [{ role: 'user', content: 'Build the plan now.' }],
    { maxTokens: 900 }
  );
  onLog('PLAN AGENT', 'Plan complete → passing to Verify Agent');
  return raw.trim();
}
