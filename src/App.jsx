import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SellerProvider } from './context/SellerContext';
import { LanguageProvider } from './context/LanguageContext';
import AppShell from './components/AppShell';
import Home from './modules/Home';
import Onboard from './modules/Onboard';
import Score from './modules/Score';
import Credit from './modules/Credit';
import Credits from './pages/Credits';

export default function App() {
  return (
    <LanguageProvider>
      <SellerProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboard" element={<Onboard />} />
            <Route path="/score" element={<Score />} />
            <Route path="/credit" element={<Credit />} />
            <Route path="/credits" element={<Credits />} />
          </Routes>
        </AppShell>
      </SellerProvider>
    </LanguageProvider>
  );
}
