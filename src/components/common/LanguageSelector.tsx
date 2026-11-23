import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../utils/languages';

export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  excludeCode?: LanguageCode;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  excludeCode,
  label,
  className = '',
  size = 'md',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLang = getLanguageByCode(value);

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !excludeCode || lang.code !== excludeCode
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={containerRef}>
      {label && (
        <span className="block text-[11px] font-medium text-[#F4EFE6]/70 mb-1 tracking-wider uppercase">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] text-[#F4EFE6] transition-all duration-200 cursor-pointer shadow-sm hover:border-[#B68B4B]/60 focus:outline-none focus:ring-1 focus:ring-[#B68B4B] min-w-[175px] sm:min-w-[200px] ${
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-3.5 h-3.5 text-[#B68B4B] shrink-0" />
          <span className="font-semibold text-[#F4EFE6] truncate">{currentLang.nativeName}</span>
          <span className="text-[#F4EFE6]/60 text-xs hidden sm:inline truncate">({currentLang.name})</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#F4EFE6]/60 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-[#B68B4B]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 w-64 max-h-80 overflow-y-auto rounded-xl border border-white/[0.12] p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            backgroundColor: '#202221', // Solid dark canvas background: prevents any transparent bleed-through
            boxShadow: '0 20px 45px -5px rgba(0, 0, 0, 0.95), 0 0 25px rgba(182, 139, 75, 0.25)',
          }}
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[#F4EFE6]/60 uppercase tracking-wider border-b border-white/[0.08] mb-1">
            Supported Languages
          </div>
          {availableLanguages.map((lang) => {
            const isSelected = lang.code === value;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] text-[#B68B4B] font-semibold border border-[#B68B4B]/40'
                    : 'text-[#F4EFE6]/80 hover:bg-white/[0.05] hover:text-[#F4EFE6]'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{lang.nativeName}</span>
                    <span className="text-xs text-[#F4EFE6]/60">· {lang.name}</span>
                  </div>
                  <span className="text-[10px] text-[#F4EFE6]/40 font-mono">
                    Script: {lang.script}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#B68B4B] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
