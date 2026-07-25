// src/hooks/useAuth.js
/**
 * @fileoverview Consumer hook for accessing global authentication state.
 */
import { useState, useEffect } from 'react';

/**
 * Custom hook to access authentication data and actions.
 * 
 * NOTE: In a Context-based implementation, calling this outside the provider 
 * will return null (or throw an error). Any changes to the context value 
 * (like login/logout) will automatically trigger a re-render of the consuming component.
 * 
 * @returns {Object} An object containing the `user` state, `login` action, and `logout` action.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('current_user_id');
    localStorage.removeItem('profile_completed');
    window.location.href = '/login';
  };
  
  return { user, login, logout };
};