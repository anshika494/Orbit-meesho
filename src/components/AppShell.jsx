import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingBag, Wallet, Sparkles } from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { useLanguage } from '../context/LanguageContext';
import AgentLog from './AgentLog';
import SellerSwitcher from './SellerSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const PLACEHOLDER_MSG = 'Existing Meesho screen — not part of this prototype';

export default function AppShell({ children }) {
  const { seller } = useSeller();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [toastKey, setToastKey] = useState(0);

  function showToast() {
    setToastKey(k => k + 1);
  }

  const NAV_ITEMS = [
    { label: t('nav.home'), icon: Home },
    { label: t('nav.orders'), icon: ShoppingBag },
    { label: t('nav.catalog'), icon: Package },
  ];

  return (
    <div className="app-shell">
      <nav className="sidebar desktop-only">
        <div className="sidebar-brand" onClick={() => navigate('/')}>
          <div className="sidebar-avatar">{seller.name.charAt(0)}</div>
          <div>
            <div className="sidebar-seller-name">{seller.name}</div>
            <div className="sidebar-seller-score">
              {seller.orbitScore === null
                ? t('sidebar.scoreBuilding')
                : `${t('sidebar.scorePrefix')}: ${seller.orbitScore}`}
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <div
              className="sidebar-nav-item disabled"
              key={item.label}
              onClick={showToast}
              style={{ cursor: 'pointer' }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="sidebar-nav-group">
            <div className="sidebar-nav-group-label">
              <Sparkles size={13} /> {t('nav.orbitGroup')}
            </div>
            <NavLink to="/onboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-dot" /> {t('nav.onboard')}
            </NavLink>
            <NavLink to="/score" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-dot" /> {t('nav.score')}
            </NavLink>
            <NavLink to="/credit" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-dot" /> {t('nav.credit')}
            </NavLink>
          </div>
          <div
            className="sidebar-nav-item disabled"
            onClick={showToast}
            style={{ cursor: 'pointer' }}
          >
            <Wallet size={18} />
            <span>{t('nav.earnings')}</span>
          </div>
        </div>

        <SellerSwitcher />
        <LanguageSwitcher />

        <NavLink to="/credits" className="sidebar-footer-link">
          {t('nav.openSource')}
        </NavLink>
      </nav>

      <main className="app-main">{children}</main>

      <AgentLog />

      <nav className="bottom-nav mobile-only">
        <NavLink to="/onboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          🎤 {t('nav.onboard').replace('Orbit ', '').replace('ऑर्बिट ', '')}
        </NavLink>
        <NavLink to="/score" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          📊 {t('nav.score').replace('Orbit ', '').replace('ऑर्बिट ', '')}
        </NavLink>
        <NavLink to="/credit" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          💰 {t('nav.credit').replace('Orbit ', '').replace('ऑर्बिट ', '')}
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          🏠 {t('nav.home')}
        </NavLink>
      </nav>

      {/* Placeholder toast — key changes on every click, remounting the element so the animation restarts */}
      {toastKey > 0 && (
        <div key={toastKey} className="placeholder-toast placeholder-toast--visible" role="status" aria-live="polite">
          <span className="placeholder-toast__icon">ℹ️</span>
          {PLACEHOLDER_MSG}
        </div>
      )}
    </div>
  );
}
