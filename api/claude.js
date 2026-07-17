// Vercel serverless function — proxies requests to the Anthropic API.
//
// The API key lives ONLY here, as a server-side environment variable
// (ANTHROPIC_API_KEY, set in the Vercel dashboard). It is never sent to
// or readable from the browser. The frontend calls /api/claude instead
// of api.anthropic.com directly.

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY not set' });
  }

  const { system, messages, maxTokens } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: 'Missing "messages" in request body' });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens ?? 1500,
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
}
