import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, BarChart3, Wallet2 } from 'lucide-react';
import OrbitRings from '../components/OrbitRings';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const FEATURES = [
    {
      to: '/onboard',
      icon: Mic,
      title: t('home.onboard.title'),
      desc: t('home.onboard.desc'),
      color: 'var(--pink)',
    },
    {
      to: '/score',
      icon: BarChart3,
      title: t('home.score.title'),
      desc: t('home.score.desc'),
      color: 'var(--violet)',
    },
    {
      to: '/credit',
      icon: Wallet2,
      title: t('home.credit.title'),
      desc: t('home.credit.desc'),
      color: 'var(--gold)',
    },
  ];

  return (
    <div className="home-screen">
      <header className="home-hero">
        <OrbitRings size={480} />
        <div className="home-hero-content" style={{ animation: 'fadeUp 0.8s ease both' }}>
          <span className="home-badge">{t('home.badge')}</span>
          <h1 className="home-wordmark">ORBIT</h1>
          <p className="home-tagline">{t('home.tagline')}</p>
          <p className="home-subtitle">{t('home.subtitle')}</p>
        </div>
      </header>

      <section className="home-features">
        {FEATURES.map((f, i) => (
          <button
            key={f.to}
            className="feature-card"
            style={{ animation: `fadeUp 0.6s ease ${0.15 * (i + 1)}s both`, '--accent': f.color }}
            onClick={() => navigate(f.to)}
          >
            <f.icon size={26} color={f.color} />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <span className="feature-card-cta">{t('home.openModule')}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
