import React from 'react';
import logoAsset from '../assets/logo.png';
import heroAsset from '../assets/hero-dandelion.png';
import { useAuth } from '../auth/AuthProvider.jsx';

export function LandingPage({ onNavigate }) {
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      onNavigate('/app');
    } else {
      onNavigate('/auth');
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo-container">
          <img src={logoAsset} alt="Dandli Logo" className="landing-logo" />
          <span className="landing-brand-name">Dandli</span>
        </div>
        <nav className="landing-nav">
          <button type="button" className="landing-secondary-btn" onClick={() => onNavigate('/auth')}>
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🌿</span>
            <span className="badge-text">Mind Mapping Reimagined</span>
          </div>
          <h1 className="hero-headline">Turn messy notes into beautiful mind maps.</h1>
          <p className="hero-subheadline">
            Dandli transforms scattered thoughts into structured insight. Clear your mind, see the connections, and grow your ideas naturally.
          </p>
          <div className="hero-actions">
            <button type="button" className="landing-primary-btn" onClick={handleGetStarted} disabled={loading}>
              Get Started
            </button>
          </div>
          <div className="hero-features-preview">
            <div className="feature-item"><span className="feature-icon">✨</span> <span>AI-Powered Generation</span></div>
            <div className="feature-item"><span className="feature-icon">🎨</span> <span>Premium Botanical Design</span></div>
            <div className="feature-item"><span className="feature-icon">🔄</span> <span>Instant Autosave</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="image-frame">
            <img src={heroAsset} alt="Dandli Mind Map Preview" className="hero-image" />
            <div className="frame-overlay-glow" />
          </div>
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Dandli. Made for deep thinkers and creators.</p>
      </footer>
    </div>
  );
}
