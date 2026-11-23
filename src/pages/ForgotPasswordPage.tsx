import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoginCosmicScene } from '../scenes/LoginCosmicScene';
import { AuthService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process reset request.');
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
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="IndicLingo AI" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F4EFE6]">
                IndicLingo <span className="text-[#B68B4B] font-mono text-sm">AI</span>
              </span>
            </Link>

            <h1 className="text-2xl font-black text-[#F4EFE6] tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-[#F4EFE6]/70 mt-1">
              Enter your email to receive recovery instructions.
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-[#B68B4B]/40 flex items-center justify-center mx-auto text-[#B68B4B]">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F4EFE6] mb-1">Check Your Email</h3>
                <p className="text-xs text-[#F4EFE6]/70 leading-relaxed">
                  Reset instructions have been sent to <span className="text-[#B68B4B]">{email}</span>.
                </p>
              </div>

              <Link to="/login" className="block">
                <Button variant="outline" size="md" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#F4EFE6]/80 mb-1.5 uppercase tracking-wider">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl clean-input text-sm text-[#F4EFE6]"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Send Instructions
              </Button>

              <div className="pt-3 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F4EFE6]/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
