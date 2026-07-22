import { callClaude, extractBlock, stripBlocks } from './claudeClient';

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
CONFIDENCE: X%

Then emit the following block EXACTLY — it must be valid JSON, all six keys present,
values are numbers representing realistic week-1 targets given the diagnosis:

<<<TARGETS>>>
{
  "returnRate": <target % — lower is better, aim for <= platform avg of 18>,
  "fulfillmentRate": <target % — aim for >= 90>,
  "responseTime": <target hours — aim for <= 2>,
  "catalogFreshness": <target % — aim for >= 70>,
  "repeatBuyers": <target % — realistic +2 to +5 pts gain>,
  "rating": <target out of 5 — realistic +0.1 to +0.3 gain>
}
<<<END>>>`;
}

export async function runPlanAgent(diagnosisText, onLog) {
  onLog('PLAN AGENT', 'Received diagnosis, building 7-day plan...');
  const raw = await callClaude(
    buildPlanSystemPrompt(diagnosisText),
    [{ role: 'user', content: 'Build the plan now.' }],
    { maxTokens: 1100 }
  );
  const targets = extractBlock(raw, 'TARGETS');
  const cleanText = stripBlocks(raw).trim();
  onLog('PLAN AGENT', `Plan complete → targets set (${targets ? 'parsed ✓' : 'parse failed'})`);
  onLog('PLAN AGENT', 'Passing to Verify Agent');
  return { text: cleanText, targets };
}
