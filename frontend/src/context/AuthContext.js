import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, tokenStorage } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if tokens exist, rehydrate user from profile endpoint
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (token) {
      authAPI.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token expired and refresh also failed (interceptor already redirected)
          // Just clear state here so the component tree renders the login route
          tokenStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    tokenStorage.setTokens(res.data.access, res.data.refresh);
    // Login response now always includes user data from CustomTokenObtainPairSerializer
    const userData = res.data.user || (await authAPI.getProfile()).data;
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    tokenStorage.setTokens(res.data.tokens.access, res.data.tokens.refresh);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authAPI.logout(refresh);
    } catch (_) {
      // Ignore — tokens may already be invalid
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((data) => setUser((u) => ({ ...u, ...data })), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
