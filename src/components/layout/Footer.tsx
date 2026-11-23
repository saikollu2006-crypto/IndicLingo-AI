import React from 'react';
import { Link } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-[#202221]/90 backdrop-blur-2xl border-t border-white/[0.08] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] flex items-center justify-center p-1">
                <img src="/logo.svg" alt="IndicLingo AI" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-lg font-bold text-[#F4EFE6] tracking-tight">IndicLingo AI</span>
            </Link>
            <p className="text-xs text-[#F4EFE6]/70 leading-relaxed">
              Unified multilingual translation, speech recognition, and intelligent summarization across India's regional languages.
            </p>
          </div>

          {/* Supported Languages */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-[#F4EFE6] uppercase tracking-wider mb-4">
              Supported Languages
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]"
                >
                  <div className="text-sm font-semibold text-[#B68B4B]">{lang.nativeName}</div>
                  <div className="text-xs text-[#F4EFE6]/50">{lang.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#F4EFE6] uppercase tracking-wider mb-4">
              Workspace Modules
            </h4>
            <ul className="space-y-2 text-xs text-[#F4EFE6]/60">
              <li>
                <Link to="/workspace" className="hover:text-[#B68B4B] transition-colors">
                  Text Translation
                </Link>
              </li>
              <li>
                <Link to="/workspace" className="hover:text-[#B68B4B] transition-colors">
                  Voice & Audio Processing
                </Link>
              </li>
              <li>
                <Link to="/workspace" className="hover:text-[#B68B4B] transition-colors">
                  Document Translation (PDF / DOCX)
                </Link>
              </li>
              <li>
                <Link to="/workspace" className="hover:text-[#B68B4B] transition-colors">
                  Intelligent Summarization
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#B68B4B] transition-colors">
                  User Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4EFE6]/40">
          <div>
            © {new Date().getFullYear()} IndicLingo AI. All rights reserved.
          </div>
          <div>
            English · ಕನ್ನಡ · हिन्दी · తెలుగు · தமிழ் · മലയാളം
          </div>
        </div>
      </div>
    </footer>
  );
};
