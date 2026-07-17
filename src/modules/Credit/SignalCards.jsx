import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

function useCountdown(days) {
  const [remaining, setRemaining] = useState(days * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const target = Date.now() + days * 24 * 60 * 60 * 1000;
    setRemaining(target - Date.now());
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [days]);

  const clamped = Math.max(0, remaining);
  const d = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const h = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const m = Math.floor((clamped / (1000 * 60)) % 60);
  const s = Math.floor((clamped / 1000) % 60);
  return { d, h, m, s };
}

// A small illustrative sparkline shaped by the real demand-change signal —
// not the data itself (we don't have day-by-day order counts to chart
// cleanly at this scale), just a visual that tracks the same direction and
// magnitude as the computed changePct so the chart doesn't contradict the
// number next to it.
function buildDemandSpark(changePct) {
  const slope = Math.max(-2, Math.min(2, changePct / 20));
  return Array.from({ length: 30 }, (_, i) => ({
    day: i,
    value: Math.round(50 + i * slope + Math.sin(i / 3) * 4),
  }));
}

export default function SignalCards({ phase, onConverge, signals }) {
  const { t } = useLanguage();
  const festivalDays = signals?.festival.daysToFestival ?? 0;
  const countdown = useCountdown(festivalDays);
  const converging = phase === 'converging' || phase === 'analyzing' || phase === 'offer';

  if (!signals) {
    return (
      <div className="signal-row">
        <div className="signal-card card">Loading signals…</div>
      </div>
    );
  }

  const demandSpark = buildDemandSpark(signals.demand.changePct);

  return (
    <div className="signal-row">
      <div className={`signal-card card ${converging ? 'converging' : ''}`} style={{ borderTop: '3px solid var(--cyan)' }}>
        <div className="signal-card-title">Category Demand</div>
        <div className="signal-chart">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={demandSpark}>
              <Line type="monotone" dataKey="value" stroke="var(--cyan)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="signal-stat">
          {signals.demand.changePct >= 0 ? '+' : ''}
          {signals.demand.changePct}% order volume vs prior 15 days
        </div>
        <span className={`badge ${signals.demand.alert ? 'signal-alert' : ''}`}>
          {signals.demand.alert ? '🔴 ALERT — demand spike detected' : '⚪ steady demand'}
        </span>
      </div>

      <div className={`signal-card card ${converging ? 'converging' : ''}`} style={{ borderTop: '3px solid var(--violet)' }}>
        <div className="signal-card-title">Stock Forecast</div>
        <div className="signal-inventory-bar">
          <div
            className="signal-inventory-fill"
            style={{ width: `${Math.min(100, Math.round((signals.inventory.currentStockUnits / 100) * 100))}%` }}
          />
        </div>
        <div className="signal-stat">Current stock: {signals.inventory.currentStockUnits} units</div>
        <div className="signal-substat">
          Selling ~{signals.inventory.dailyVelocity}/day → runs out in {signals.inventory.daysToStockout} days
        </div>
        <span className={`badge ${signals.inventory.alert ? 'signal-alert' : ''}`}>
          {signals.inventory.alert ? '🔴 ALERT — stockout risk' : '⚪ stock healthy'}
        </span>
      </div>

      <div className={`signal-card card ${converging ? 'converging' : ''}`} style={{ borderTop: '3px solid var(--gold)' }}>
        <div className="signal-card-title">Festival Calendar</div>
        <div className="signal-countdown mono">
          {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
        </div>
        <div className="signal-substat">{signals.festival.name}</div>
        <div className="signal-substat">Order-to-restock lead time: {signals.festival.restockLeadDays} days</div>
        <div className="signal-substat">Action window: {signals.festival.actionWindowDays} days remaining</div>
        <span className={`badge ${signals.festival.alert ? 'signal-alert-critical' : ''}`}>
          {signals.festival.alert ? '🔴 CRITICAL — act now or miss window' : '⚪ window still open'}
        </span>
      </div>

      {phase === 'signals' && (
        <button className="btn-primary credit-run-btn" onClick={onConverge}>
          {t('credit.runButton')}
        </button>
      )}
    </div>
  );
}
