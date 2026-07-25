// src/pages/GoogleCallBackPage.jsx
/**
 * @fileoverview Google OAuth Callback Page.
 * Rendered at route: `/google-callback`.
 * On mount, parses URL parameters to extract the JWT and user data, stores them in local storage, and redirects to profile setup.
 */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const GoogleCallBackPage = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    // const userId = params.get('userId'); 
    // We'll trust the token's user object or the params, but saving token is critical.
    const userId = params.get('userId');
    const name = params.get('name');
    const email = params.get('email');
    const token = params.get('token');

    console.log('Google callback params:', { from, userId, name, email, token: token ? "Present" : "Missing" });

    if (from === 'google' && token) {
      // 1. Store Token
      localStorage.setItem('token', token);

      // 2. Store User
      const userObj = {
        id: userId, // Keep as string or number? usually DB IDs are strings if MongoDB, but here we see mixed usage. 
        // Let's store what backend sent.
        email: email,
        name: name || 'Google User',
      };

      // If userId looks like a number, parse it, otherwise keep string
      // But actually, for consistency with standard login, let's keep it as is from params.
      // If the backend sends ObjectId strings, they are strings.

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('current_user_id', userId);

      // 3. Mark profile completed? 
      // We don't know from params if profile is complete. 
      // We'll assume NO for safety, or check if we want to fetch /me.
      // For now, redirect to profile-setup is safe.

      // Redirect
      window.location.href = ROUTES.PROFILE_SETUP;
    } else {
      console.error("Missing token in Google Callback");
      // If invalid callback, redirect to login
      window.location.href = `${ROUTES.LOGIN}?error=google_auth_failed`;
    }
  }, [location.search]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      color: 'white',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'white',
          animation: 'pulse 2s infinite',
        }} />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
        Signing in with Google
      </h2>
      <p style={{ color: '#94a3b8' }}>
        Please wait while we set up your account...
      </p>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleCallBackPage;