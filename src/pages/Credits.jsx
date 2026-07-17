import React from 'react';
import { useNavigate } from 'react-router-dom';

const LIBRARIES = [
  { name: 'React', version: '18.3.1', license: 'MIT', role: 'Core UI framework', source: 'github.com/facebook/react' },
  { name: 'React DOM', version: '18.3.1', license: 'MIT', role: 'DOM renderer for React', source: 'github.com/facebook/react' },
  { name: 'React Router', version: '6.26.0', license: 'MIT', role: 'Client-side routing between modules', source: 'github.com/remix-run/react-router' },
  { name: 'Vite', version: '5.4.0', license: 'MIT', role: 'Build tool & dev server', source: 'github.com/vitejs/vite' },
  { name: '@vitejs/plugin-react', version: '4.3.1', license: 'MIT', role: 'React fast-refresh support in Vite', source: 'github.com/vitejs/vite-plugin-react' },
  { name: 'Anthropic JS SDK', version: '0.27.0', license: 'MIT', role: 'Reference for Claude API integration (calls made via fetch)', source: 'github.com/anthropics/anthropic-sdk-typescript' },
  { name: 'Recharts', version: '2.12.7', license: 'MIT', role: 'Demand signal line chart', source: 'github.com/recharts/recharts' },
  { name: 'Lucide React', version: '0.427.0', license: 'ISC', role: 'UI icons throughout the app', source: 'github.com/lucide-icons/lucide' },
  { name: 'Playfair Display', version: 'Google Fonts', license: 'OFL-1.1', role: 'Heading typeface', source: 'fonts.google.com/specimen/Playfair+Display' },
  { name: 'Inter', version: 'Google Fonts', license: 'OFL-1.1', role: 'Body typeface', source: 'fonts.google.com/specimen/Inter' },
  { name: 'JetBrains Mono', version: 'Google Fonts', license: 'OFL-1.1', role: 'Agent log monospace typeface', source: 'fonts.google.com/specimen/JetBrains+Mono' },
];

export default function Credits() {
  const navigate = useNavigate();
  return (
    <div className="credits-page">
      <button className="btn-secondary credits-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>Open Source Attributions</h2>
      <p className="credits-intro">
        ORBIT — ScriptedBy{'{Her}'} 2.0 Hackathon Submission. All third-party libraries used in this project are
        listed below in full compliance with their respective licenses. No library code has been modified without
        explicit documentation.
      </p>

      <div className="credits-table-wrap">
        <table className="credits-table">
          <thead>
            <tr>
              <th>Library / Tool</th>
              <th>Version</th>
              <th>License</th>
              <th>Role</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {LIBRARIES.map((lib) => (
              <tr key={lib.name}>
                <td>{lib.name}</td>
                <td>{lib.version}</td>
                <td>{lib.license}</td>
                <td>{lib.role}</td>
                <td>
                  <a href={`https://${lib.source}`} target="_blank" rel="noreferrer">
                    {lib.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
