import React, { useEffect } from 'react';
import BoomerangVideoBg from './BoomerangVideoBg.jsx';
import logoAsset from '../assets/logo.webp';
import convertNotesAsset from '../assets/convert_notes.png';
import interviewPrepAsset from '../assets/Interview Preparation.png';
import finalSsAsset from '../assets/final_ss.png';
import { useAuth } from '../auth/AuthProvider.jsx';
import { AuthPage } from './AuthPage.jsx';
import { trackLandingViewed } from '../lib/analytics.js';
import { Sparkles, GitMerge, FileText, Image } from 'lucide-react';

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
      {/* Scrollable Main Content */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showAuth ? 'blur-md opacity-20 scale-[0.99] pointer-events-none' : ''}`}>
        
        {/* Section 1: Hero Header & Nav */}
        <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
          <BoomerangVideoBg
            src={BG_VIDEO}
            className="absolute inset-0 w-full h-full filter saturate-[0.75] contrast-[0.85] blur-[0.5px] animate-slow-zoom-out"
          />

          {/* Cinematic overlay to soften background under text */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/20 to-black/45 pointer-events-none" />

          {/* Navbar */}
          <nav className="relative z-30 flex items-center justify-between px-6 md:px-12 py-6 w-full">
            <div className="flex items-center gap-2 text-white">
              <img src={logoAsset} alt="Dandli Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-medium tracking-tight font-inter">
                Dandli<sup className="text-[10px] font-medium">™</sup>
              </span>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="bg-[#0a0a0a] hover:bg-neutral-800 text-white text-sm font-medium h-[36px] px-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
              >
                Sign In
              </button>
            </div>
          </nav>

          {/* Hero Copy */}
          <div className="relative z-20 flex flex-col items-center text-center px-6 mt-16 md:mt-24 mb-auto max-w-4xl mx-auto w-full">
            <h1 className="font-playfair font-medium text-white text-5xl sm:text-6xl md:text-7xl lg:text-[72px] leading-none tracking-tight">
              Map the way you think.
            </h1>
            <p className="mt-12 md:mt-16 font-inter font-light text-white/80 text-base sm:text-lg md:text-xl max-w-lg leading-relaxed" style={{ marginTop: '64px' }}>
              Paste your messy notes. Watch AI turn them into a structured mind map.
            </p>
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-[#0a0a0a] hover:bg-neutral-800 text-white text-base font-medium h-[48px] px-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg mt-24 md:mt-32" style={{ marginTop: '128px' }}
            >
              Get Started
            </button>
            <p className="font-inter text-xs text-white/50 mt-8 md:mt-12 select-none" style={{ marginTop: '48px' }}>
              No credit card required.
            </p>
          </div>

          {/* Hero footer line */}
          <div className="relative z-20 w-full text-center py-6 text-xs text-white/40 tracking-[1.2px] uppercase font-inter">
            Clear your mind, see the connections.
          </div>
        </section>

        {/* Section 2: How It Works */}
        <section className="bg-white px-6 py-28 w-full border-b border-[#e8e5de]">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <p className="font-inter font-medium text-xs text-[#888] tracking-[1.2px] uppercase text-center mb-4" style={{ marginBottom: '16px' }}>
              How it works
            </p>
            <h2 className="font-playfair font-medium text-3xl sm:text-4xl md:text-[40px] leading-tight text-center text-[#0a0a0a] mb-12" style={{ marginBottom: '48px' }}>
              From chaos to clarity in seconds.
            </h2>
            
            <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 w-full">
              {/* Left Column: Your Raw Notes */}
              <div className="w-full md:flex-1 border border-[#e8e5de] rounded-2xl flex flex-col items-start" style={{ height: '500px', backgroundColor: '#F6F2EA', padding: '24px' }}>
                <p className="font-inter font-medium text-xs text-[#aaa] tracking-[1.2px] uppercase mb-4 select-none" style={{ marginBottom: '16px' }}>
                  Your raw notes
                </p>
                <div className="whitespace-pre-line font-inter text-sm md:text-base text-neutral-700 leading-relaxed overflow-y-auto w-full flex-grow text-left">
                  {`system design interview next week - not ready
need to revise - distributed systems, CAP theorem, kafka
behavioural questions - prep STAR stories
which companies - google too hard rn? maybe mid tier first
resume gaps - how to explain the 4 month break
portfolio project needs to be updated
negotiation - dont accept first offer
referrals - reach out to priya and ankit
sleep schedule is broken, fix before interview week`}
                </div>
              </div>

              {/* Arrow Column */}
              <div className="flex items-center justify-center text-[#999999] text-3xl md:text-5xl font-light py-2 md:py-0 select-none pointer-events-none self-center">
                <span className="transform rotate-90 md:rotate-0">→</span>
              </div>

              {/* Right Column: Dandli Mind Map */}
              <div className="w-full md:flex-1 border border-[#e8e5de] rounded-2xl flex flex-col items-start overflow-hidden p-0" style={{ padding: 0, boxShadow: '0 2px 20px rgba(0,0,0,0.08)', height: '500px', backgroundColor: '#F6F2EA' }}>
                <img src={interviewPrepAsset} alt="Mind Map After" className="w-full h-full select-none pointer-events-none" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
            </div>

            <p className="font-inter text-sm text-[#888] text-center mt-8" style={{ marginTop: '32px' }}>
              Paste anything. Dandli figures out the structure.
            </p>

            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-[#0a0a0a] hover:bg-neutral-800 text-white text-base font-medium h-[44px] px-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md mt-6" style={{ marginTop: '24px' }}
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Section 3: Why Dandli */}
        <section className="bg-[#f7f6f3] px-6 w-full border-b border-[#e8e5de]" style={{ paddingTop: '192px', paddingBottom: '112px' }}>
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <p className="font-inter font-medium text-xs text-[#888] tracking-[1.2px] uppercase text-center mb-4" style={{ marginBottom: '16px' }}>
              Why Dandli
            </p>
            <h2 className="font-playfair font-medium text-2xl sm:text-3xl md:text-[36px] leading-tight text-center text-[#0a0a0a] max-w-3xl mb-16" style={{ marginBottom: '64px' }}>
              The only tool that goes from raw thought to structured map — in one shot.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Card 1 */}
              <div className="bg-white border border-[#e8e5de] rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <Sparkles className="w-6 h-6 text-[#0a0a0a] mb-6" />
                <p className="font-inter text-[#333] text-base leading-relaxed">
                  No manual building. You dump, AI structures.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e8e5de] rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <GitMerge className="w-6 h-6 text-[#0a0a0a] mb-6" />
                <p className="font-inter text-[#333] text-base leading-relaxed">
                  Map and outline always in sync. Click outline, jump to node.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#e8e5de] rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <FileText className="w-6 h-6 text-[#0a0a0a] mb-6" />
                <p className="font-inter text-[#333] text-base leading-relaxed">
                  Export as Markdown or PNG. Your thinking, portable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Output Quality */}
        <section className="bg-white px-6 w-full border-b border-[#e8e5de]" style={{ paddingTop: '160px', paddingBottom: '160px' }}>
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <p className="font-inter font-medium text-xs text-[#888] tracking-[1.2px] uppercase text-center mb-4" style={{ marginBottom: '16px' }}>
              Output quality
            </p>
            <h2 className="font-playfair font-medium text-3xl sm:text-4xl md:text-[40px] leading-tight text-center text-[#0a0a0a] mb-12" style={{ marginBottom: '48px' }}>
              This is what your thinking looks like after Dandli.
            </h2>

            <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-[#e8e5de]">
              <img src={finalSsAsset} alt="Dandli Mind Map Quality" className="w-full h-auto object-cover select-none pointer-events-none" />
            </div>

            <p className="text-center text-xs md:text-sm text-[#888] mt-4 font-light" style={{ marginTop: '16px' }}>
              Click anything in the outline — jump straight to it on the map.
            </p>
          </div>
        </section>

        {/* Section 5: Output Options */}
        <section className="bg-[#f7f6f3] px-6 py-28 w-full border-b border-[#e8e5de]">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <p className="font-inter font-medium text-xs text-[#888] tracking-[1.2px] uppercase text-center mb-4" style={{ marginBottom: '16px' }}>
              Output options
            </p>
            <h2 className="font-playfair font-medium text-3xl sm:text-4xl md:text-[40px] leading-tight text-center text-[#0a0a0a] mb-8" style={{ marginBottom: '32px' }}>
              Your map, wherever you need it.
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4 w-full" style={{ marginTop: '16px' }}>
              {/* Copy as Markdown Pill */}
              <div className="bg-white border border-[#e8e5de] px-6 py-3.5 rounded-full flex items-center gap-3 shadow-sm select-none pointer-events-none">
                <FileText className="w-5 h-5 text-[#0a0a0a]" />
                <span className="font-inter font-medium text-[#0a0a0a] text-sm md:text-base">
                  Copy as Markdown
                </span>
              </div>

              {/* Export as PNG Pill */}
              <div className="bg-white border border-[#e8e5de] px-6 py-3.5 rounded-full flex items-center gap-3 shadow-sm select-none pointer-events-none">
                <Image className="w-5 h-5 text-[#0a0a0a]" />
                <span className="font-inter font-medium text-[#0a0a0a] text-sm md:text-base">
                  Export as PNG
                </span>
              </div>
            </div>

            <p className="text-center text-xs md:text-sm text-[#888] mt-6" style={{ marginTop: '24px' }}>
              Your thinking doesn't stay trapped in another app.
            </p>
          </div>
        </section>

        {/* Section 6: Testimonials */}
        <section className="bg-white px-6 py-28 w-full border-b border-[#e8e5de]">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <p className="font-playfair text-[#ccc] text-7xl md:text-8xl text-center leading-none select-none">
              "
            </p>
            <blockquote className="font-playfair text-lg sm:text-xl md:text-2xl text-[#0a0a0a] text-center -mt-4 leading-relaxed px-4">
              I dumped a week of scattered notes into Dandli. In under a minute I had a map that actually made sense of everything I had been thinking.
            </blockquote>
            <p className="font-inter text-[#888] text-sm md:text-base text-center mt-6">
              — Early user, Hyderabad
            </p>
          </div>
        </section>

        {/* Section 7: Final CTA */}
        <section className="bg-[#f7f6f3] px-6 py-32 w-full">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-playfair font-medium text-2xl sm:text-3xl md:text-[36px] leading-tight text-center text-[#0a0a0a]">
              Your best thinking is already in your notes.
            </h2>
            <p className="font-inter text-[#666] text-base sm:text-lg text-center mt-8 md:mt-10" style={{ marginTop: '36px' }}>
              Let Dandli find the structure in it.
            </p>

            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-[#0a0a0a] hover:bg-neutral-800 text-white rounded-full font-medium text-lg h-[60px] px-10 flex items-center justify-center transition-all duration-200 shadow-lg mt-20 md:mt-24" style={{ marginTop: '80px' }}
            >
              Get Started
            </button>

            <p className="font-inter text-xs md:text-sm text-[#aaa] text-center mt-8 select-none" style={{ marginTop: '32px' }}>
              No credit card required.
            </p>
          </div>
        </section>

      </div>

      {/* Auth overlay modal layer */}
      <AuthPage onNavigate={onNavigate} active={showAuth} />
    </div>
  );
}

