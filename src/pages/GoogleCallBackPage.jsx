// src/pages/GoogleCallBackPage.jsx
/**
 * @fileoverview Google OAuth Callback Page.
 * Rendered at route: `/google-callback`.
 * On mount, parses URL parameters returned by the backend after Google OAuth,
 * stores the JWT and user data, then routes the user to the correct page
 * based on whether their profile is already complete.
 */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const GoogleCallBackPage = () => {
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState('Completing sign-in with Google...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const from = params.get('from');
    const userId = params.get('userId');
    const name = params.get('name');
    const email = params.get('email');
    const token = params.get('token');
    // Backend sends "true" or "false" as string
    const profileCompleteRaw = params.get('profile_complete');

    console.log('Google callback params:', {
      from,
      userId,
      name,
      email,
      token: token ? 'Present (hidden)' : 'MISSING',
      profile_complete: profileCompleteRaw,
    });

    if (from === 'google' && token) {
      setStatusMessage('Setting up your account...');

      // 1. Determine if profile is complete
      // Backend sends "true" or "false" as a lowercase string
      const profileComplete = profileCompleteRaw === 'true';

      // 2. Build user object
      const userObj = {
        id: userId,
        email: email,
        name: name || 'Google User',
        profile_complete: profileComplete,
      };

      // 3. Persist token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('current_user_id', userId);
      localStorage.setItem('profileCompleted', profileComplete ? 'true' : 'false');

      setStatusMessage('Success! Redirecting you now...');

      // 4. Route based on profile completion status
      //    - New user (profile_complete = false) → Profile Setup
      //    - Returning user (profile_complete = true) → Dashboard
      if (profileComplete) {
        window.location.href = ROUTES.DASHBOARD;
      } else {
        window.location.href = ROUTES.PROFILE_SETUP;
      }
    } else {
      // Token missing or 'from' param incorrect — show error and redirect to login
      const errParam = params.get('google_error') || params.get('error');
      const errMsg = errParam
        ? `Google sign-in error: ${errParam.replace(/_/g, ' ')}`
        : 'Google sign-in failed — no token received.';

      console.error('GoogleCallBackPage error:', errMsg, { from, token: !!token });
      setIsError(true);
      setStatusMessage(errMsg);

      // Redirect to login after a short delay so user can read the message
      setTimeout(() => {
        window.location.href = `${ROUTES.LOGIN}?google_error=${errParam || 'auth_failed'}`;
      }, 2500);
    }
  }, [location.search]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        color: 'white',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 100%)',
        padding: '2rem',
      }}
    >
      {/* Animated icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isError
            ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          transition: 'background 0.3s',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'white',
            animation: isError ? 'none' : 'pulse 1.5s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isError && (
            <span style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</span>
          )}
        </div>
      </div>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: isError ? '#fca5a5' : 'white',
        }}
      >
        {isError ? 'Sign-in Failed' : 'Signing in with Google'}
      </h2>

      <p style={{ color: '#94a3b8', maxWidth: '360px', lineHeight: 1.6 }}>
        {statusMessage}
      </p>

      {isError && (
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1rem' }}>
          Redirecting you back to the login page...
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(0.85); opacity: 0.6; }
          50%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default GoogleCallBackPage;