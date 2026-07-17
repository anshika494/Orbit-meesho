ORBIT — Open Source Attributions
ScriptedBy{Her} 2.0 Hackathon Submission

All third-party libraries used in this project are listed below in full
compliance with their respective licenses. No library code has been modified
without explicit documentation below.

| Library / Tool | Version | License | Role | Integration Type | Source |
|---|---|---|---|---|---|
| React | 18.3.1 | MIT | Core UI framework | Direct integration | https://github.com/facebook/react |
| React DOM | 18.3.1 | MIT | DOM renderer for React | Direct integration | https://github.com/facebook/react |
| React Router | 6.26.0 | MIT | Client-side routing between Home / Onboard / Score / Credit / Credits | Direct integration | https://github.com/remix-run/react-router |
| Vite | 5.4.0 | MIT | Build tool & dev server | Direct integration | https://github.com/vitejs/vite |
| @vitejs/plugin-react | 4.3.1 | MIT | React fast-refresh support in Vite | Direct integration | https://github.com/vitejs/vite-plugin-react |
| Anthropic JS SDK | 0.27.0 | MIT | Referenced for request/response shape; actual calls made via native `fetch` to `api.anthropic.com` | Inspiration only | https://github.com/anthropics/anthropic-sdk-typescript |
| Recharts | 2.12.7 | MIT | Demand signal line chart in Orbit Credit | Direct integration | https://github.com/recharts/recharts |
| Lucide React | 0.427.0 | ISC | UI icons throughout the app | Direct integration | https://github.com/lucide-icons/lucide |
| Playfair Display | Google Fonts | OFL-1.1 | Heading / wordmark typeface | Direct integration (CDN) | https://fonts.google.com/specimen/Playfair+Display |
| Inter | Google Fonts | OFL-1.1 | Body typeface | Direct integration (CDN) | https://fonts.google.com/specimen/Inter |
| JetBrains Mono | Google Fonts | OFL-1.1 | Agent Log monospace typeface | Direct integration (CDN) | https://fonts.google.com/specimen/JetBrains+Mono |

No AI model weights, training data, or proprietary Meesho assets are included
in this repository. All AI-generated content (chat replies, diagnoses, plans,
verification checkpoints, and credit offers) is produced at runtime by
`claude-sonnet-4-6` via the Anthropic Messages API and is not stored or
redistributed as part of this codebase.
