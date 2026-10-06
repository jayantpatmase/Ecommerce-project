import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Check auth session from backend
  const checkAuth = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        refreshCounts();
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCounts = async () => {
    try {
      const [cRes, wRes] = await Promise.allSettled([
        api.getCart(),
        api.getWishlist()
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.success) {
        setCartCount(cRes.value.data?.summary?.total_quantity || 0);
      }
      if (wRes.status === 'fulfilled' && wRes.value.success) {
        setWishlistCount(Array.isArray(wRes.value.data) ? wRes.value.data.length : 0);
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      await refreshCounts();
    }
    return res;
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      await refreshCounts();
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  const reloadUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      reloadUser,
      cartCount,
      wishlistCount,
      refreshCounts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
