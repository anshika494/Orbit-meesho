import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_OTP = '123456';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setOtpHint(true);
    setTimeout(() => otpInputRef.current?.focus(), 80);
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    if (otp !== DEMO_OTP) {
      setError('Incorrect OTP. Use the demo OTP shown above.');
      return;
    }
    setLoading(true);
    // Brief artificial delay so it feels like a real network round-trip.
    await new Promise((r) => setTimeout(r, 700));
    login(phone, name || 'Seller');
    navigate('/', { replace: true });
  }

  return (
    <div className="login-page">
      {/* Background rings — decorative only */}
      <div className="login-bg-ring login-bg-ring--1" />
      <div className="login-bg-ring login-bg-ring--2" />
      <div className="login-bg-ring login-bg-ring--3" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">O</div>
          <span className="login-wordmark">ORBIT</span>
        </div>
        <p className="login-tagline">Agentic Growth for Meesho Sellers</p>

        <h2 className="login-heading">Sign in to continue</h2>

        <form onSubmit={otpSent ? handleVerify : handleSendOtp} className="login-form">
          {/* Name — optional, shown upfront */}
          <div className="login-field">
            <label htmlFor="login-name" className="login-label">Your Name <span className="login-optional">(optional)</span></label>
            <input
              id="login-name"
              className="login-input"
              type="text"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={otpSent}
            />
          </div>

          {/* Phone */}
          <div className="login-field">
            <label htmlFor="login-phone" className="login-label">Mobile Number</label>
            <div className="login-phone-row">
              <span className="login-country-code">+91</span>
              <input
                id="login-phone"
                className="login-input"
                type="tel"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={otpSent}
                required
              />
            </div>
          </div>

          {/* OTP hint + field — visible after Send OTP */}
          {otpSent && (
            <>
              {otpHint && (
                <div className="login-otp-hint">
                  🔐 Demo OTP: <strong>{DEMO_OTP}</strong>
                </div>
              )}
              <div className="login-field">
                <label htmlFor="login-otp" className="login-label">Enter OTP</label>
                <input
                  id="login-otp"
                  ref={otpInputRef}
                  className="login-input login-input--otp"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          {!otpSent ? (
            <button type="submit" className="btn-primary login-btn">
              Send OTP →
            </button>
          ) : (
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign In →'}
            </button>
          )}

          {otpSent && (
            <button
              type="button"
              className="login-resend"
              onClick={() => { setOtpSent(false); setOtp(''); setOtpHint(false); setError(''); }}
            >
              ← Change number
            </button>
          )}
        </form>

        <p className="login-disclaimer">
          This is a prototype. No real SMS is sent — use the demo OTP.
        </p>
      </div>
    </div>
  );
}
