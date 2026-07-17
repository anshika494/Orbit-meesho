import { callClaude } from './claudeClient';

// ─────────────────────────────────────────────────────────────────────────
// CATALOG VISION AGENT
//
// The conversational Onboard Agent extracts WHO the seller is and WHAT
// category/price range she sells in — but it has never seen the product.
// A "professional, ready-to-use" listing needs to describe what's actually
// in the photos (color, fabric texture, pattern, finish) — details no
// amount of conversation can substitute for. This agent is the one that
// actually looks at the seller's uploaded photos (real multimodal vision,
// not filename guessing) and grounds the listing in them.
// ─────────────────────────────────────────────────────────────────────────

function cleanJson(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export function buildCatalogVisionPrompt(profile) {
  return `You are ORBIT's Catalog Vision Agent. You have been given product
photos uploaded by a Meesho seller, taken from different angles, plus a
profile extracted from a conversation with her.

SELLER PROFILE (from conversation, not from the photos):
${JSON.stringify(profile, null, 2)}

Your job:
1. Actually look at the attached photos. Note real visual details — color,
   fabric/material impression, pattern, stitching or finish quality,
   silhouette — whatever is genuinely visible. Do not invent details you
   can't see, and do not write generic filler that could describe any
   product in this category.
2. Combine those real visual observations with the seller's profile
   (price range, self-made vs reseller, location) to write a professional,
   ready-to-use Meesho listing.
3. Pick which uploaded photo (by its position, 0-indexed, in the order
   given) works best as the main/cover listing image — usually the
   clearest full-product shot.
4. Write one short caption per photo describing what that specific photo
   shows (useful for a "photo notes" section the seller can review).

Respond with ONLY raw JSON, no markdown fences, no preamble:

{
  "product_title": "4-8 words, specific to what you saw",
  "description": "3-4 sentences, grounded in the actual photos and profile",
  "price": "₹X",
  "category": "Meesho category path, e.g. Women's Clothing > Kurtas & Suits > Kurtis",
  "tags": ["6-10 searchable keywords a buyer would actually use"],
  "highlights": ["4 short, specific bullet points"],
  "cover_image_index": 0,
  "photo_notes": ["one short caption per photo, same order as provided"]
}`;
}

/**
 * @param {Array<{base64: string, mediaType: string}>} images
 * @param {object} profile - the extracted seller profile from Onboard Agent
 * @param {function} onLog
 */
export async function runCatalogVisionAgent(images, profile, onLog) {
  onLog('CATALOG VISION AGENT', `Analyzing ${images.length} product photo(s)...`);

  const imageBlocks = images.map((img) => ({
    type: 'image',
    source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
  }));

  const messages = [
    {
      role: 'user',
      content: [
        ...imageBlocks,
        {
          type: 'text',
          text: 'Analyze these product photos alongside the seller profile in your system prompt and generate the listing now.',
        },
      ],
    },
  ];

  const raw = await callClaude(buildCatalogVisionPrompt(profile), messages, { maxTokens: 1200 });

  let parsed;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Catalog Vision Agent returned invalid JSON');
    parsed = JSON.parse(match[0]);
  }

  onLog(
    'CATALOG VISION AGENT',
    `Listing generated — cover photo #${(parsed.cover_image_index ?? 0) + 1} of ${images.length}`
  );

  return parsed;
}
