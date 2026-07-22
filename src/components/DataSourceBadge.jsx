import React from 'react';
import { DatabaseZap, Database } from 'lucide-react';

// Same "show your work" pattern as Orbit Credit's RiskGatePanel — makes it
// visible, not just true in the code, that this seller's numbers came from
// a real MongoDB query rather than the in-browser synthetic generator.
export default function DataSourceBadge({ source, note }) {
  const isMongo = source === 'mongodb';
  return (
    <div className="data-source-badge" title={note || undefined}>
      {isMongo ? <DatabaseZap size={13} color="var(--violet)" /> : <Database size={13} color="var(--muted)" />}
      <span>{isMongo ? 'Live MongoDB query' : 'Local fallback data'}</span>
    </div>
  );
}
