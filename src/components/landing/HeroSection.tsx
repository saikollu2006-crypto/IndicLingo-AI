import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';

export const HeroSection: React.FC = () => {
  const { user } = useAppStore();
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-transparent">
      {/* Luminous Drapery Gradient Lighting Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(182,139,75,0.18)_0%,rgba(101,73,34,0.10)_50%,transparent_80%)]" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Clean Glass Gold Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.10] backdrop-blur-xl mb-6 shadow-clean-glass">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B68B4B] animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-[#B68B4B] uppercase font-mono">
            Multilingual AI Platform
          </span>
        </div>

        {/* Big Editorial Hero Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[1.02] mb-6 text-[#F4EFE6] uppercase select-none">
          Every Language. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B68B4B] via-[#F4EFE6] to-[#B68B4B] block sm:inline drop-shadow-[0_0_35px_rgba(182,139,75,0.45)]">
            One Connection.
          </span>
        </h1>

        {/* Clean, readable description */}
        <p className="text-base sm:text-lg md:text-xl text-[#F4EFE6]/80 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          AI-powered translation, intelligent summarization, and speech processing across India’s six major regional languages.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {user ? (
            <>
              <Link to="/workspace" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Enter Workspace
                </Button>
              </Link>
              <a href="#about" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                  Explore Overview
                </Button>
              </a>
            </>
          ) : (
            <>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </Link>

              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  icon={<LogIn className="w-4 h-4" />}
                >
                  Login / Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Language Script Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[#F4EFE6]/60 text-xs sm:text-sm">
          <span className="hover:text-[#B68B4B] transition-colors">English</span>
          <span className="text-white/20">·</span>
          <span className="font-kannada font-semibold text-[#F4EFE6] hover:text-[#B68B4B] transition-colors">ಕನ್ನಡ</span>
          <span className="text-white/20">·</span>
          <span className="font-devanagari font-semibold text-[#F4EFE6] hover:text-[#B68B4B] transition-colors">हिन्दी</span>
          <span className="text-white/20">·</span>
          <span className="font-telugu font-semibold text-[#F4EFE6] hover:text-[#B68B4B] transition-colors">తెలుగు</span>
          <span className="text-white/20">·</span>
          <span className="font-tamil font-semibold text-[#F4EFE6] hover:text-[#B68B4B] transition-colors">தமிழ்</span>
          <span className="text-white/20">·</span>
          <span className="font-malayalam font-semibold text-[#F4EFE6] hover:text-[#B68B4B] transition-colors">മലയാളം</span>
        </div>
      </div>

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#202221]/50 to-transparent pointer-events-none" />
    </section>
  );
};
