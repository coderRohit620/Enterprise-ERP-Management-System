import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check for existing session token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and fetch profile context
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Session initialization failed:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      
      // Fetch full profile details (including employee profile if applicable)
      const profileRes = await api.get('/auth/profile');
      setUser(profileRes.data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Notify backend (stateless clearance)
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout call failed, clearing session locally...');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Password update handler
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update password';
      return { success: false, error: message };
    }
  };

  // Context value payload
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updatePassword,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume AuthContext cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider');
  }
  return context;
};
