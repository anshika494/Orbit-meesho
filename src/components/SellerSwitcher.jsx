import React from 'react';
import { SELLERS } from '../context/SellerContext';
import { useSeller } from '../context/SellerContext';

export default function SellerSwitcher() {
  const { seller, switchSeller } = useSeller();

  return (
    <div className="seller-switcher">
      <span className="seller-switcher-label">Demo seller</span>
      <div className="seller-switcher-options">
        {Object.values(SELLERS).map((s) => (
          <button
            key={s.id}
            className={`seller-switcher-chip ${seller.id === s.id ? 'active' : ''}`}
            onClick={() => switchSeller(s.id)}
          >
            {s.id === 'established' ? '🟢' : '🆕'} {s.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
