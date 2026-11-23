import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';

export const CtaSection: React.FC = () => {
  const { user } = useAppStore();

  return (
    <section className="relative py-24 bg-transparent border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="p-10 sm:p-14 rounded-3xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] shadow-2xl">
          <span className="text-xs font-mono text-[#B68B4B] uppercase tracking-wider block mb-3">
            Get Started
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-[#F4EFE6] tracking-tight mb-4">
            Let Language Bring Us Together.
          </h2>

          <p className="text-sm sm:text-base text-[#F4EFE6]/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Experience a smarter way to understand, translate, and communicate across Indian languages.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link to="/workspace">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Enter Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-8"
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8"
                    icon={<LogIn className="w-4 h-4" />}
                  >
                    Login / Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
