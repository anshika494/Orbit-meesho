// Thin wrapper that calls our own /api/claude serverless proxy (see
// /api/claude.js) instead of hitting api.anthropic.com directly from the
// browser. This keeps the Anthropic API key server-side only — it is set
// as an environment variable on the hosting platform (e.g. Vercel) and is
// never bundled into or readable from client code.
//
// Locally, `vercel dev` serves /api routes alongside Vite so this works
// the same way in development and production. See README for setup.

const API_URL = '/api/claude';
export const MODEL = 'claude-sonnet-4-6';

/**
 * Send a single-turn (or multi-turn) message to Claude.
 * @param {string} systemPrompt
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @param {object} opts - { maxTokens }
 * @returns {Promise<string>} the text content of the response
 */
export async function callClaude(systemPrompt, messages, opts = {}) {
  const maxRetries = opts.maxRetries ?? 2;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages,
          maxTokens: opts.maxTokens ?? 1500,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = (data.content || [])
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
      return text;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Extract a labelled block of the form:
 * <<<LABEL>>>
 * { ...json... }
 * <<<END>>>
 * from raw agent text. Returns parsed JSON or null.
 */
export function extractBlock(rawText, label) {
  const pattern = new RegExp(`<<<${label}>>>([\\s\\S]*?)<<<END>>>`, 'i');
  const match = rawText.match(pattern);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (e) {
    return null;
  }
}

/** Strip labelled blocks out of the text so the chat bubble shows clean copy. */
export function stripBlocks(rawText) {
  return rawText.replace(/<<<[A-Z]+>>>[\s\S]*?<<<END>>>/gi, '').trim();
}


