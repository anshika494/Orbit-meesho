# ORBIT — Agentic Growth for Meesho Sellers

A multi-agent AI system, native to the Meesho Seller App, that fixes the three biggest leaks in the women-seller funnel: activation, retention, and scale.

Built for **ScriptedBy{Her} 2.0** (Meesho / Bharat theme).

---

## The Problem — 3 Funnel Leaks

1. **Activation** — Women sellers can't complete app-based onboarding. Text-heavy forms are a barrier for sellers who are more comfortable speaking than typing.
2. **Retention** — Sellers don't know *why* they're underperforming. Dashboards show numbers, not root causes or next steps.
3. **Scale Ceiling** — Sellers can't fund restocking when demand spikes, so they miss festival-season windows entirely.

## The Solution — 3 Modules

| Module | What it does |
|---|---|
| **Orbit Onboard** | Conversational onboarding (typed or spoken, via the browser's native voice input) that extracts a structured seller profile, then hands off to a Catalog Vision Agent that generates the listing from the seller's own uploaded product photos. |
| **Orbit Score** | An Orchestrator Agent routes each seller autonomously, then a chained Diagnose → Plan → Verify loop turns a formula-computed performance score into a specific 7-day action plan. |
| **Orbit Credit** | Proactive inventory financing. Demand, stock, and festival-timing signals — computed from the seller's own order and stock data — feed a Credit Recommendation Agent, whose offer is then checked (and revised if needed) by a Risk Reflection Agent before the seller ever sees it. |

The dashboard UI (nav, headers, primary actions) supports English and Hindi via a language switcher in the sidebar — separate from Onboard's own conversational language detection, which already adapts to whatever language the seller types or speaks.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env
# then edit .env and set:
# VITE_ANTHROPIC_API_KEY=your_key_here

# 3. Run the dev server
npm run dev

# 4. Open the app
# http://localhost:5173
```

> All AI output is generated live by `claude-sonnet-4-6` via the Anthropic Messages API — nothing in the agent responses is hardcoded. Seller performance metrics (Orbit Score, return rate, fulfillment rate, etc.) are computed by a plain weighted formula (`src/agents/scoreCalculator.js`) from synthetic order-level records (`src/data/sellerDataAdapter.js`) — not typed in directly. There's no real Meesho API connection yet, so that adapter is the one function that would be swapped for a live data pull; everything downstream (the formula, the agents, the UI) is already written against that same data shape and wouldn't need to change.

---

## Demo Walkthrough (under 4 minutes)

1. Land on the home screen — watch the orbit rings animate.
2. Click **Orbit Onboard**.
3. Click the starter chip *"Mujhe saree bechna hai Meesho pe"* — or tap the mic and say it instead (real browser speech recognition, not simulated).
4. Watch the conversation unfold and the Extraction Panel populate live.
5. Once confidence crosses 80%, upload a few product photos when prompted, then click **Generate professional listing** — the Catalog Vision Agent looks at the actual photos before writing the listing.
6. Click **Orbit Score** in the left nav.
7. Click **Run Orbit Analysis**.
8. Watch Diagnose → Plan → Verify run sequentially, with the Agent Log scrolling on the right. Expand **"How is this score calculated?"** to show the point-by-point formula.
9. Click **Orbit Credit** in the left nav — the three signal cards show real numbers computed from this seller's own order/stock data (switch sellers to see them change).
10. Click **Run Credit Analysis** — watch the Recommendation Agent produce an offer, then the Risk Reflection Agent approve or send it back for revision.
11. Drag the **ROI Calculator** slider and watch the numbers update live.
12. Try the language switcher in the sidebar to flip the dashboard chrome between English and Hindi.

---

## Architecture

- Single React (Vite) SPA, no backend — API calls go straight from the browser to `api.anthropic.com`.
- `SellerContext` holds all shared state (seller profile, extracted onboarding data, diagnosis/plan/verify outputs, credit offer, and the global agent log) so all three modules and the log panel stay in sync.
- **8 agents**, each in its own file under `src/agents/`, each with its system prompt colocated with its parsing logic:
  - `onboardAgent.js` — conversational profile extraction (no longer generates the catalog itself — see below)
  - `catalogVisionAgent.js` — generates the final listing from the seller's own uploaded product photos plus her extracted profile; this is a real multimodal vision call, not filename guessing
  - `orchestratorAgent.js` — autonomously routes each seller to the right coaching path (see below)
  - `diagnoseAgent.js` — root-cause analysis on seller metrics
  - `planAgent.js` — turns a diagnosis into a 7-day task plan
  - `verifyAgent.js` — turns a plan into checkpoints + score predictions
  - `coldStartAgent.js` — category-benchmark guidance for sellers without enough order history for a real score
  - `creditAgent.js` — a Credit Recommendation Agent produces a financing offer, then a Risk Reflection Agent checks it against the seller's GMV/return rate/Orbit Score and can send it back for one revision before it's shown
- **Catalog generation requires real photos**: Onboard no longer fabricates a listing from conversation text alone. Once profile confidence crosses 80%, the UI prompts for product photos; `catalogVisionAgent.js` sends them to Claude as actual image content blocks (`type: 'image'`, base64) alongside the profile, and the resulting title/description/highlights are grounded in what's visibly in the photos — plus it picks which uploaded photo to use as the cover image.
- **Real voice input**: the mic button uses the browser's native `SpeechRecognition` API (Chrome/Edge; not simulated) — interim results stream into the text box live, and the final utterance auto-sends as a message. Browsers without support (e.g. Firefox) show the mic as disabled with an explanation, rather than pretending to listen.
- **Dashboard language switcher**: `LanguageContext` + a small translation dictionary cover the app's nav, headers, and primary actions in English and Hindi, with a selector in the sidebar. This is separate from Onboard's own per-message language detection in the chat itself.
- **True agent chaining** in Orbit Score: the Diagnose Agent's raw output text is passed directly into the Plan Agent's system prompt, and the Plan Agent's output is passed into the Verify Agent's — this is not simulated, each call depends on the previous agent's actual response.
- **Autonomous routing, not a hardcoded `if`**: before the coaching loop runs, the Orchestrator Agent looks at the seller's order count and account age and *decides* — with visible reasoning and a confidence score — whether to route to the full Diagnose→Plan→Verify loop or to the Cold-Start Coach. No component branches on `seller.orderCount` directly; the agent makes that call itself, and the UI just renders whichever path it picked. This is the cold-start answer: a brand-new seller has no order history to score, so instead of fabricating a number, the Orchestrator routes her to category-level benchmarks and a clear milestone for when her real score unlocks.
- A **seller switcher** in the sidebar toggles between two seed profiles — an established seller (`Priya`, 214 orders, real metrics) and a day-one seller (`Anjali`, 2 orders) — so you can demo both routing decisions live without needing a real Meesho data connection.
- A persistent **Agent Log** (`src/components/AgentLog.jsx`) subscribes to a `pushLog` callback threaded through every agent call, so every module shows real-time reasoning steps as they happen.

## Open Source Credits

See [`OPEN_SOURCE_CREDITS.md`](./OPEN_SOURCE_CREDITS.md) for the full attributions table, or open the **Open Source** link in the app's left sidebar (`/credits` route).

---

## Submission
*Submission track: ScriptedBy{Her} 2.0, Meesho*
