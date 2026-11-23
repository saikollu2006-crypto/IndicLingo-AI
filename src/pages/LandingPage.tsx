import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { LanguagesSection } from '../components/landing/LanguagesSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/layout/Footer';
import { useLenis } from '../hooks/useLenis';
import { LanguageUniverseScene } from '../scenes/LanguageUniverseScene';

export const LandingPage: React.FC = () => {
  useLenis(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#202221] text-[#F4EFE6] flex flex-col selection:bg-[#B68B4B]/30 selection:text-white">
      {/* Persistent 3D Language Universe Scene in background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <LanguageUniverseScene />
        {/* Luminous veil: crystal clear readability while keeping 3D background clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#202221]/25 to-[#202221]/55 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <AboutSection />
          <LanguagesSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};
