// src/App.jsx
/**
 * @fileoverview Application Root Component.
 * Composes global providers (e.g., Auth, Toaster) around the router.
 * (Note: Current active composition happens in main.jsx; this file serves as an alternate/legacy entry).
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from './constants/routes';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfileSetupPage from './pages/ProfileSetupPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setProfileComplete(user.profile_complete || false);
      } else {
        setIsAuthenticated(false);
        setProfileComplete(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route path="/profile-setup" element={
          isAuthenticated ? (
            profileComplete === false ? (
              <ProfileSetupPage />
            ) : (
              <Navigate to={ROUTES.DASHBOARD} replace />
            )
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        } />
        
        {/* Default route */}
        <Route path="/" element={
          isAuthenticated ? (
            profileComplete === false ? (
              <Navigate to={ROUTES.PROFILE_SETUP} replace />
            ) : (
              <Navigate to={ROUTES.DASHBOARD} replace />
            )
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;