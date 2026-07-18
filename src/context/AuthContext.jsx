import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'orbit-auth';

function getInitialAuth() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    /* localStorage unavailable */
  }
  return { isLoggedIn: false, user: null };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);

  const login = useCallback((phone, name) => {
    const user = { phone, name: name || 'Seller' };
    const next = { isLoggedIn: true, user };
    setAuth(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    const next = { isLoggedIn: false, user: null };
    setAuth(next);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn: auth.isLoggedIn, user: auth.user, login, logout }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
