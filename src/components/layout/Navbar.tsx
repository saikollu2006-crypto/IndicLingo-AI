import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Languages', href: '#languages' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#workflow' },
  ];

  const isWorkspace = location.pathname.startsWith('/workspace');
  const isAuth =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#202221]/60 backdrop-blur-2xl border-b border-white/[0.08] py-3.5 shadow-lg shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center p-1 group-hover:border-[#B68B4B]/60 backdrop-blur-md transition-colors">
            <img src="/logo.svg" alt="IndicLingo AI" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F4EFE6] flex items-center gap-1.5">
            IndicLingo <span className="text-[#B68B4B] text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.10]">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links - Clean Glass Pill */}
        {!isWorkspace && !isAuth && (
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.035] border border-white/[0.08] rounded-full px-5 py-1.5 backdrop-blur-2xl shadow-clean-glass">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-[#F4EFE6]/80 hover:text-[#B68B4B] hover:bg-white/[0.05] rounded-full transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {isWorkspace ? (
            <Link to="/">
              <Button variant="outline" size="sm">
                Exit
              </Button>
            </Link>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link to="/workspace">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Go to Workspace
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="hidden sm:inline-flex"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<LogIn className="w-3.5 h-3.5" />}
                >
                  Login / Sign Up
                </Button>
              </Link>
              <Link to="/signup" className="hidden sm:inline-block">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Create Account
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          {!isWorkspace && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#F4EFE6]/80 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && !isWorkspace && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-[#202221]/95 border-b border-white/[0.08] backdrop-blur-2xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#F4EFE6]/80 hover:text-[#B68B4B] hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/workspace" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Go to Workspace
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out ({user.email})
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full" icon={<LogIn className="w-3.5 h-3.5" />}>
                      Login / Sign Up
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full" icon={<UserPlus className="w-3.5 h-3.5" />}>
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
