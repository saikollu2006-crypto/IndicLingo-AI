import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoginCosmicScene } from '../scenes/LoginCosmicScene';
import { AuthService } from '../services/authService';
import { useAppStore } from '../store/useAppStore';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, addToast } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await AuthService.register(name, email, password);
      setUser(newUser);
      addToast('Account created successfully!', 'success');
      navigate('/workspace');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#202221] selection:bg-[#B68B4B]/30 selection:text-[#F4EFE6]">
      <LoginCosmicScene />

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="p-8 sm:p-10 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] shadow-2xl">
          {/* Header */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="IndicLingo AI" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F4EFE6]">
                IndicLingo <span className="text-[#B68B4B] font-mono text-sm">AI</span>
              </span>
            </Link>

            <h1 className="text-2xl font-black text-[#F4EFE6] tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-[#F4EFE6]/70 mt-1">
              Start using multimodal translation across 6 Indian languages.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#F4EFE6]/80 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl clean-input text-sm text-[#F4EFE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4EFE6]/80 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl clean-input text-sm text-[#F4EFE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4EFE6]/80 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl clean-input text-sm text-[#F4EFE6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F4EFE6]/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4EFE6]/80 mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl clean-input text-sm text-[#F4EFE6]"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#F4EFE6]/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/[0.2] bg-white/[0.05] text-[#B68B4B] focus:ring-[#B68B4B]"
                />
                <span>
                  I agree to the <span className="text-[#B68B4B]">Terms of Service</span>.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-3"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-[#F4EFE6]/60">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B68B4B] font-semibold hover:underline">
              Log In / Sign Up
            </Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-[#F4EFE6]/50 hover:text-white transition-colors">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};
