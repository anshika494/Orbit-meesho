import React, { useState, useMemo } from 'react';

const COST_PER_UNIT = 180;
const SELL_PRICE = 450;
const EMI_COST = 7100;

export default function ROICalculator() {
  const [units, setUnits] = useState(150);

  const calc = useMemo(() => {
    const cost = units * COST_PER_UNIT;
    const revenue = units * SELL_PRICE;
    const grossProfit = revenue - cost;
    const netGain = grossProfit - EMI_COST;
    const sellThrough60Profit = revenue * 0.6 - cost - EMI_COST;
    return { cost, revenue, grossProfit, netGain, sellThrough60Profit };
  }, [units]);

  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="roi-calculator card">
      <h3>ROI Calculator</h3>
      <label className="roi-slider-label">
        How many units will you restock? <strong>{units}</strong>
      </label>
      <input
        type="range"
        min="50"
        max="400"
        step="10"
        value={units}
        onChange={(e) => setUnits(Number(e.target.value))}
        className="roi-slider"
      />

      <div className="roi-grid">
        <div className="roi-stat">
          <span>Cost to restock</span>
          <strong>{fmt(calc.cost)}</strong>
        </div>
        <div className="roi-stat">
          <span>Revenue if sold out</span>
          <strong>{fmt(calc.revenue)}</strong>
        </div>
        <div className="roi-stat">
          <span>Gross profit</span>
          <strong>{fmt(calc.grossProfit)}</strong>
        </div>
        <div className="roi-stat">
          <span>EMI cost</span>
          <strong>{fmt(EMI_COST)}</strong>
        </div>
        <div className="roi-stat highlight">
          <span>Net gain vs not restocking</span>
          <strong>{fmt(calc.netGain)}</strong>
        </div>
      </div>

      <p className="roi-footnote">
        Even at 60% sell-through, you profit <strong>{fmt(Math.max(0, calc.sellThrough60Profit))}</strong> above EMI
        cost.
      </p>
    </div>
  );
}
