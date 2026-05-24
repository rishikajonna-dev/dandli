import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import logoAsset from '../assets/logo.png';

export function AuthPage() {
  const { signInWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Could not start Google sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-blob blob-1"></div>
      <div className="auth-bg-blob blob-2"></div>

      <div className="auth-card">
        <div className="auth-header">
          <img src={logoAsset} alt="Dandli Logo" className="auth-logo" />
          <p className="auth-eyebrow">Welcome to</p>
          <h1 className="auth-brand">Dandli</h1>
          <p className="auth-subtitle">Scatter your thoughts. Structure your mind.</p>
        </div>

        {errorMsg && <div className="auth-error-alert">{errorMsg}</div>}

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Opening Google...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
