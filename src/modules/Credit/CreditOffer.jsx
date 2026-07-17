import React from 'react';
import { CircleDollarSign, ShieldCheck } from 'lucide-react';

export default function CreditOffer({ offer, seller, risk }) {
  return (
    <div className="credit-offer-card card">
      <div className="credit-offer-header">
        <CircleDollarSign size={20} color="var(--gold)" />
        <h3>ORBIT CREDIT OFFER</h3>
      </div>

      <div className="credit-offer-terms">
        <div className="credit-offer-term">
          <span>Loan Amount</span>
          <strong>{offer.loan_amount}</strong>
        </div>
        <div className="credit-offer-term">
          <span>Interest Rate</span>
          <strong>{offer.rate}</strong>
        </div>
        <div className="credit-offer-term">
          <span>Tenure</span>
          <strong>{offer.tenure}</strong>
        </div>
        <div className="credit-offer-term">
          <span>EMI</span>
          <strong>{offer.emi} / month</strong>
        </div>
        <div className="credit-offer-term">
          <span>Partner</span>
          <strong>{offer.partner}</strong>
        </div>
      </div>

      <div className="credit-offer-section">
        <h4>WHY NOW</h4>
        <p>{offer.why_now}</p>
      </div>

      <div className="credit-offer-section">
        <h4>PRE-FILLED FROM YOUR MEESHO DATA</h4>
        <ul className="credit-offer-checklist">
          <li>✓ {seller.accountAge} months order history</li>
          <li>✓ {seller.fulfillmentRate}% fulfillment rate</li>
          <li>✓ ₹{((seller.monthlyGMV * 3) / 100000).toFixed(1)}L GMV last quarter</li>
        </ul>
      </div>

      <div className="credit-offer-section credit-offer-gainloss">
        <div>
          <span className="credit-offer-gain-label">If you act</span>
          <p>{offer.gain_if_act}</p>
        </div>
        <div>
          <span className="credit-offer-loss-label">If you wait</span>
          <p>{offer.loss_if_wait}</p>
        </div>
      </div>

      <div className="credit-offer-section">
        <h4>RISK TO KNOW</h4>
        <p className="credit-offer-risk">{offer.risk_note}</p>
      </div>

      {risk && (
        <div className="card credit-risk-card">
          <div className="credit-risk-header">
            <ShieldCheck size={15} color="var(--violet)" />
            Risk Reflection Agent — {risk.risk_level} risk, {risk.approved ? 'approved' : 'revised after review'}
          </div>
          <p className="credit-risk-note">{risk.assessment}</p>
          {!risk.approved && risk.adjustment_needed && (
            <p className="credit-risk-adjustment">Adjustment applied: {risk.adjustment_needed}</p>
          )}
        </div>
      )}

      <div className="credit-offer-actions">
        <button className="btn-primary">APPLY IN 1 TAP →</button>
        <button className="btn-secondary">Not now</button>
      </div>
    </div>
  );
}
