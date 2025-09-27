import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Clear any localStorage data first (prevent auto-login from cached data)
      authService.clearAuthData();
      
      // Check with server if user is authenticated via session
      const response = await authService.getAuthStatus();
      
      if (response.isAuthenticated && response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('No active session found');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    
    // Optional: Store in localStorage for convenience (but server session is the source of truth)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = async () => {
    try {
      // Call backend logout to invalidate session
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear frontend state regardless of backend response
      setCurrentUser(null);
      setIsAuthenticated(false);
      authService.clearAuthData();
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isDriver: currentUser?.role === 'DRIVER',
    isRider: currentUser?.role === 'RIDER',
    loading,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};