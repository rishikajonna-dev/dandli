import React, { useEffect } from 'react';
import BoomerangVideoBg from './BoomerangVideoBg.jsx';
import logoAsset from '../assets/logo.webp';
import { useAuth } from '../auth/AuthProvider.jsx';
import { AuthPage } from './AuthPage.jsx';
import { trackLandingViewed } from '../lib/analytics.js';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4';

export function LandingPage({ onNavigate, showAuth }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!showAuth) {
      trackLandingViewed();
    }
  }, [showAuth]);

  const handleGetStarted = (e) => {
    if (e) e.preventDefault();
    if (user) {
      onNavigate('/app');
    } else {
      onNavigate('/auth');
    }
  };

  return (
    <div className="landing-page-root">
      <section className="relative w-full min-h-screen sm:h-screen overflow-hidden flex flex-col justify-between">
        <BoomerangVideoBg
          src={BG_VIDEO}
          className="absolute inset-0 w-full h-full filter saturate-[0.75] contrast-[0.85] blur-[0.5px]"
        />

        {/* Subtle cinematic overlay to soften background under text */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#faf8f5]/85 via-[#faf8f5]/45 to-transparent pointer-events-none" />

        {/* Navbar */}
        <nav className={`relative z-30 flex items-center justify-between px-6 md:px-12 py-6 w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showAuth ? 'opacity-20 blur-[2px] pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 text-[#2B2B2B]">
            <img src={logoAsset} alt="Dandli Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            <span className="text-xl md:text-2xl font-bold tracking-tight text-[#2B2B2B]">
              Dandli<sup className="text-[10px] font-medium text-[#2B2B2B]">TM</sup>
            </span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero copy */}
        <div className={`relative z-20 flex flex-col items-center text-center px-4 sm:px-6 mt-8 sm:mt-16 md:mt-20 mb-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showAuth ? 'blur-md opacity-20 scale-[0.97] pointer-events-none' : ''}`}>
          <h1
            className="font-normal leading-[0.95] text-[#2B2B2B] text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] max-w-4xl mx-auto"
            style={{
              fontFamily:
                "'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: '-0.035em',
            }}
          >
            Map the way you think.
          </h1>
          <p className="mt-6 sm:mt-8 text-[#4A4A4A] text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto px-2">
            Give your ideas space to grow, connect, and evolve.
          </p>
          <div className="mt-9 sm:mt-11">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-[#111111] hover:bg-[#222222] text-white text-base font-semibold px-8 py-3.5 rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Footer spacer to balance layout */}
        <div className={`relative z-20 w-full text-center py-6 text-xs text-[#2B2B2B]/60 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showAuth ? 'opacity-0' : ''}`}>
          © {new Date().getFullYear()} Dandli. Clear your mind, see the connections.
        </div>

        {/* Auth overlay modal layer */}
        <AuthPage onNavigate={onNavigate} active={showAuth} />
      </section>
    </div>
  );
}
