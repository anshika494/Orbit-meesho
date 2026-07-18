import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SellerProvider } from './context/SellerContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Home from './modules/Home';
import Onboard from './modules/Onboard';
import Score from './modules/Score';
import Credit from './modules/Credit';
import Credits from './pages/Credits';
import Login from './pages/Login';
import MeeshoListing from './pages/MeeshoListing';

// Redirects to /login if the user is not authenticated.
function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SellerProvider>
          <Routes>
            {/* Public route — no AppShell */}
            <Route path="/login" element={<Login />} />

            {/* All protected routes wrapped in AppShell */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/onboard" element={<Onboard />} />
                      <Route path="/score" element={<Score />} />
                      <Route path="/credit" element={<Credit />} />
                      <Route path="/credits" element={<Credits />} />
                      <Route path="/meesho-listing" element={<MeeshoListing />} />
                    </Routes>
                  </AppShell>
                </PrivateRoute>
              }
            />
          </Routes>
        </SellerProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
