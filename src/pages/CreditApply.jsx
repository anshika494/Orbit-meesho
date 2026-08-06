import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, User, Building2, Phone, FileText, ChevronRight, Loader2, Lock, Sparkles } from 'lucide-react';

const STEPS = ['KYC Verification', 'Loan Details', 'Confirm & Submit'];

const MOCK_KYC = {
  name: 'Priya Sharma',
  pan: 'ABCPS1234D',
  aadhaar: '•••• •••• 4521',
  bank: 'State Bank of India — ••••3782',
  gstin: '27ABCDE1234F1Z5',
  phone: '+91 98765 43210',
};

function StepIndicator({ current }) {
  return (
    <div className="apply-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`apply-step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            <div className="apply-step-circle">
              {i < current ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
            </div>
            <span className="apply-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`apply-step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function KYCStep({ onNext }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="apply-card card">
      <div className="apply-card-header">
        <ShieldCheck size={20} color="var(--green)" />
        <h3>KYC Verification</h3>
      </div>
      <p className="apply-card-subtitle">
        Your details are pre-filled from Meesho seller data. No paperwork needed.
      </p>

      {loading ? (
        <div className="apply-loading">
          <Loader2 size={28} className="apply-spinner" />
          <p>Fetching your verified details from DigiLocker…</p>
        </div>
      ) : (
        <>
          <div className="apply-kyc-grid">
            <div className="apply-kyc-item">
              <User size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">Full Name</span>
                <strong>{MOCK_KYC.name}</strong>
              </div>
            </div>
            <div className="apply-kyc-item">
              <FileText size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">PAN</span>
                <strong>{MOCK_KYC.pan}</strong>
              </div>
            </div>
            <div className="apply-kyc-item">
              <Lock size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">Aadhaar</span>
                <strong>{MOCK_KYC.aadhaar}</strong>
              </div>
            </div>
            <div className="apply-kyc-item">
              <Building2 size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">Bank Account</span>
                <strong>{MOCK_KYC.bank}</strong>
              </div>
            </div>
            <div className="apply-kyc-item">
              <FileText size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">GSTIN</span>
                <strong>{MOCK_KYC.gstin}</strong>
              </div>
            </div>
            <div className="apply-kyc-item">
              <Phone size={14} color="var(--muted)" />
              <div>
                <span className="apply-kyc-label">Mobile</span>
                <strong>{MOCK_KYC.phone}</strong>
              </div>
            </div>
          </div>

          <div className="apply-verified-badge">
            <CheckCircle size={13} color="var(--green)" />
            KYC Verified via DigiLocker &amp; CKYC Registry
          </div>

          <button className="btn-primary apply-next-btn" onClick={onNext}>
            Confirm KYC &amp; Continue <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

function LoanDetailsStep({ offer, onNext }) {
  const principal = offer?.rawAmount || 200000;
  const rateAnnual = offer?.rawRate || 18;
  const [tenure, setTenure] = useState(offer?.rawTenureMonths || 12);
  const rateMonthly = rateAnnual / 12 / 100;
  const emi = tenure > 0
    ? Math.round(principal * rateMonthly * Math.pow(1 + rateMonthly, tenure) / (Math.pow(1 + rateMonthly, tenure) - 1))
    : principal;

  const tenureOptions = [3, 6, 9, 12, 18, 24];

  return (
    <div className="apply-card card">
      <div className="apply-card-header">
        <Sparkles size={20} color="var(--gold)" />
        <h3>Loan Details</h3>
      </div>
      <p className="apply-card-subtitle">Review and customize your loan before submitting.</p>

      <div className="apply-loan-summary">
        <div className="apply-loan-row">
          <span>Loan Amount</span>
          <strong className="apply-loan-amount">₹{(principal / 100000).toFixed(1)}L</strong>
        </div>
        <div className="apply-loan-row">
          <span>Interest Rate</span>
          <strong>{rateAnnual}% p.a.</strong>
        </div>
        <div className="apply-loan-row">
          <span>Lending Partner</span>
          <strong>{offer?.partner || 'LendingKart Finance Ltd.'}</strong>
        </div>
      </div>

      <div className="apply-tenure-selector">
        <label className="apply-tenure-label">Choose Repayment Tenure</label>
        <div className="apply-tenure-chips">
          {tenureOptions.map(m => (
            <button
              key={m}
              className={`apply-tenure-chip ${tenure === m ? 'active' : ''}`}
              onClick={() => setTenure(m)}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      <div className="apply-emi-callout">
        <div className="apply-emi-label">Monthly EMI</div>
        <div className="apply-emi-value">₹{emi.toLocaleString('en-IN')}</div>
        <div className="apply-emi-note">for {tenure} months · total repayment ₹{(emi * tenure).toLocaleString('en-IN')}</div>
      </div>

      <button className="btn-primary apply-next-btn" onClick={onNext}>
        Proceed to Confirm <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ConfirmStep({ offer, onSubmit, submitting }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="apply-card card">
      <div className="apply-card-header">
        <FileText size={20} color="var(--violet)" />
        <h3>Review &amp; Submit</h3>
      </div>
      <p className="apply-card-subtitle">
        One last look before we send your application to the lending partner.
      </p>

      <div className="apply-confirm-list">
        {[
          { label: 'Applicant', value: MOCK_KYC.name },
          { label: 'Loan Amount', value: offer?.loan_amount || '₹2,00,000' },
          { label: 'Interest Rate', value: offer?.rate || '18% p.a.' },
          { label: 'Tenure', value: offer?.tenure || '12 months' },
          { label: 'EMI', value: offer?.emi ? `${offer.emi} / month` : '₹18,340 / month' },
          { label: 'Partner', value: offer?.partner || 'LendingKart Finance Ltd.' },
          { label: 'Disbursal To', value: MOCK_KYC.bank },
        ].map(({ label, value }) => (
          <div className="apply-confirm-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <label className="apply-consent-label">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="apply-consent-checkbox"
        />
        <span>
          I authorise ORBIT &amp; {offer?.partner || 'LendingKart Finance Ltd.'} to pull my credit bureau report and process this application. I confirm all pre-filled details are correct.
        </span>
      </label>

      <button
        className="btn-primary apply-next-btn"
        disabled={!agreed || submitting}
        onClick={onSubmit}
        id="apply-submit-btn"
      >
        {submitting ? (
          <><Loader2 size={16} className="apply-spinner-inline" /> Submitting…</>
        ) : (
          <>Submit Application →</>
        )}
      </button>
    </div>
  );
}

function SuccessScreen({ offer, onDone }) {
  // Generate a stable ref id for the session
  const [refId] = useState(() =>
    'ORB-' + Math.random().toString(36).slice(2, 10).toUpperCase()
  );

  return (
    <div className="apply-success">
      <div className="apply-success-icon">
        <CheckCircle size={56} color="var(--green)" />
      </div>
      <h2>Application Submitted! 🎉</h2>
      <p className="apply-success-subtitle">
        Your loan application for <strong>{offer?.loan_amount || '₹2,00,000'}</strong> has been forwarded to{' '}
        <strong>{offer?.partner || 'LendingKart Finance Ltd.'}</strong>.
      </p>

      <div className="apply-success-timeline">
        <div className="apply-timeline-item">
          <div className="apply-timeline-dot done" />
          <div>
            <strong>Application Received</strong>
            <span>Just now</span>
          </div>
        </div>
        <div className="apply-timeline-connector" />
        <div className="apply-timeline-item">
          <div className="apply-timeline-dot pending" />
          <div>
            <strong>Credit Bureau Check</strong>
            <span>Within 2 hours</span>
          </div>
        </div>
        <div className="apply-timeline-connector" />
        <div className="apply-timeline-item">
          <div className="apply-timeline-dot pending" />
          <div>
            <strong>Final Approval</strong>
            <span>24–48 hours</span>
          </div>
        </div>
        <div className="apply-timeline-connector" />
        <div className="apply-timeline-item">
          <div className="apply-timeline-dot pending" />
          <div>
            <strong>Disbursal to Bank</strong>
            <span>Within 3 business days</span>
          </div>
        </div>
      </div>

      <div className="apply-success-ref">
        Application ID: <span className="mono">{refId}</span>
      </div>

      <button className="btn-primary apply-next-btn" onClick={onDone}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default function CreditApply() {
  const navigate = useNavigate();
  const location = useLocation();
  const offer = location.state?.offer || null;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 2200);
  }

  if (done) {
    return (
      <div className="apply-page">
        <SuccessScreen offer={offer} onDone={() => navigate('/credit')} />
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-top-bar">
        <button className="btn-secondary apply-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="apply-top-title">
          <Lock size={14} color="var(--muted)" />
          <span>Secured by 256-bit encryption</span>
        </div>
      </div>

      <div className="apply-header">
        <h2>Apply for Orbit Credit</h2>
        <p>Powered by ORBIT AI — zero paperwork, instant decision</p>
      </div>

      <StepIndicator current={step} />

      {step === 0 && <KYCStep onNext={() => setStep(1)} />}
      {step === 1 && <LoanDetailsStep offer={offer} onNext={() => setStep(2)} />}
      {step === 2 && (
        <ConfirmStep offer={offer} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </div>
  );
}
