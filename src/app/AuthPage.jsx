import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';

export function AuthPage({ onNavigate, active }) {
  const { signInWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (e) => {
    e.stopPropagation();
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
    <div
      className={`auth-overlay-backdrop ${active ? 'active' : ''}`}
      onClick={() => onNavigate && onNavigate('/')}
    >
      {/* Subtle atmospheric glow layers inside the overlay backdrop */}
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#fbf9f6] opacity-[0.25] filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[15%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#faf8f5] opacity-15 filter blur-[90px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-[#f4ebd0]/15 opacity-15 filter blur-[110px] pointer-events-none" />

      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <p className="auth-eyebrow">Welcome to</p>
          <h1 className="auth-brand" style={{
            fontFamily: "'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: '-0.035em',
          }}>
            Enter Dandli.
          </h1>
          <p className="auth-subtitle">
            Give your ideas space to grow.
          </p>
        </div>

        {errorMsg && <div className="auth-error-alert">{errorMsg}</div>}

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          {loading ? 'Opening Google...' : 'Continue with Google'}
        </button>

        <button
          type="button"
          className="bg-transparent border-0 text-sm text-[#55524E] hover:text-[#2B2B2B] mt-2 cursor-pointer transition-colors duration-200"
          onClick={() => onNavigate && onNavigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
