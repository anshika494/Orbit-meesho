import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <div className="language-switcher">
      <span className="language-switcher-label">
        <Globe size={13} /> {t('sidebar.language')}
      </span>
      <select
        className="language-switcher-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label={t('sidebar.language')}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
