import React, { useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';

/**
 * This page handles the OAuth redirect callback from Google.
 * When the user clicks "Sign in with Google" on the Login page,
 * they are redirected to Google, then back to /sso-callback.
 * Clerk processes the callback automatically.
 */
const SSOCallback = () => {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
    }).catch(err => console.error('SSO callback error:', err));
  }, [handleRedirectCallback]);

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p style={{ color: '#94a3b8' }}>Completing sign in…</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SSOCallback;
