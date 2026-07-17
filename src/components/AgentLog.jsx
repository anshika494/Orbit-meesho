import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSeller } from '../context/SellerContext';

const AGENT_COLORS = {
  'ONBOARD AGENT': 'var(--pink)',
  ORCHESTRATOR: 'var(--pink)',
  'DIAGNOSE AGENT': 'var(--cyan)',
  'PLAN AGENT': 'var(--violet)',
  'VERIFY AGENT': 'var(--green)',
  'CREDIT AGENT': 'var(--gold)',
  'COLD-START COACH': 'var(--gold)',
  SYSTEM: 'var(--muted)',
};

function LogList({ agentLog }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [agentLog.length]);

  if (agentLog.length === 0) {
    return <p className="agent-log-empty mono">Waiting for agent activity…</p>;
  }

  return (
    <div className="agent-log-list mono">
      {agentLog.map((entry) => (
        <div className="agent-log-entry" key={entry.id}>
          <span className="agent-log-time">[{entry.time}]</span>{' '}
          <span className="agent-log-agent" style={{ color: AGENT_COLORS[entry.agent] || 'var(--muted)' }}>
            [{entry.agent}]
          </span>{' '}
          <span className="agent-log-msg">{entry.message}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

export default function AgentLog() {
  const { agentLog } = useSeller();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <aside className="agent-log-panel desktop-only">
        <div className="agent-log-header">
          <span>🔍 Agent Log</span>
          <span className="agent-log-count">{agentLog.length}</span>
        </div>
        <LogList agentLog={agentLog} />
      </aside>

      <button className="agent-log-fab mobile-only" onClick={() => setDrawerOpen(true)} aria-label="Open agent log">
        <Search size={18} />
      </button>

      {drawerOpen && (
        <div className="agent-log-drawer-backdrop mobile-only" onClick={() => setDrawerOpen(false)}>
          <div className="agent-log-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="agent-log-header">
              <span>🔍 Agent Log</span>
              <button className="agent-log-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <LogList agentLog={agentLog} />
          </div>
        </div>
      )}
    </>
  );
}
