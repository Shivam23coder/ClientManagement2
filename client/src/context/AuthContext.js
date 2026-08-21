/**
 * AuthContext — global authentication state.
 *
 * On mount, calls GET /auth/me to restore session state from the server
 * (Passport re-hydrates the session from MongoDB so the user stays logged
 * in across page reloads without needing to re-authenticate).
 *
 * Exposes: user, loading, login, logout, register
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser, loginWithGoogleApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True while we check the session

  // Restore session on app boot
  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null)) // 401 = no session, that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Google OAuth Login
  const loginWithGoogle = useCallback(async (googleCredentialData) => {
    const res = await loginWithGoogleApi(googleCredentialData);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
