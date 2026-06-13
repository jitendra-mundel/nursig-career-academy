import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */
const AuthContext = createContext();

const parseJsonSafe = async (response) => {
  const raw = await response.text();

  if (!raw || raw.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    id: rawUser.id || rawUser._id,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  /**
   * Get current user from localStorage
   */
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const syncCurrentUser = async () => {
      try {
        // If there's no token set, do not auto-restore a saved user — clear stale state.
        if (!token) {
          setUser(null);
          localStorage.removeItem('user');
          setInitializing(false);
          return;
        }

        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseJsonSafe(response);

        if (response.ok && data?.user) {
          const normalizedUser = normalizeUser(data.user);
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } else {
          // token invalid or server returned no user — clear stored auth
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        // Network or server error: do not restore a saved user when offline.
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    syncCurrentUser();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setInitializing(false);
    }
  }, [token]);

  /**
   * Login function
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.message || 'Login request failed');
      }

      if (!data?.success) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      const normalizedUser = normalizeUser(data.user);
      setUser(normalizedUser);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   */
  const register = async (name, email, password, enrollmentNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, enrollmentNumber }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.message || 'Registration request failed');
      }

      if (!data?.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      const normalizedUser = normalizeUser(data.user);
      setUser(normalizedUser);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email) => {
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Email OTP is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env');
        }
        throw new Error(data?.message || `OTP send failed (${response.status})`);
      }
      return data;
    } catch (err) {
      throw new Error(err?.message || 'OTP send failed');
    }
  };

  const registerWithOtp = async (name, email, password, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) throw new Error(data?.message || `Registration request failed (${response.status})`);

      if (!data?.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      const normalizedUser = normalizeUser(data.user);
      setUser(normalizedUser);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      return data;
    } catch (err) {
      setError(err?.message || 'Request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserProfile = (updatedUser) => {
    const normalizedUser = normalizeUser(updatedUser);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    token,
    loading,
    error,
    initializing,
    login,
    register,
    sendOtp,
    registerWithOtp,
    logout,
    updateUserProfile,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
