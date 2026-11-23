import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../utils/languages';
import { LanguageCode } from '../../types';
import { Volume2 } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { useAppStore } from '../../store/useAppStore';

const SAMPLE_GREETINGS: Record<LanguageCode, { text: string; translation: string }> = {
  en: {
    text: "Welcome to IndicLingo AI. Let language bring us together.",
    translation: "Universal communication across diverse linguistic traditions."
  },
  kn: {
    text: "ಇಂಡಿಕ್‌ಲಿಂಗೋ ಎಐ ಗೆ ಸುಸ್ವಾಗತ. ಭಾಷೆ ನಮ್ಮನ್ನು ಒಗ್ಗೂಡಿಸಲಿ.",
    translation: "Welcome to IndicLingo AI. Let language bring us together."
  },
  hi: {
    text: "इंडिक्लिंगो एआई में आपका स्वागत है। भाषा हमें जोड़े।",
    translation: "Welcome to IndicLingo AI. Let language bring us together."
  },
  te: {
    text: "ఇండిక్లింగో ఏఐకి స్వాగతం. భాష మనల్ని ఏకం చేయనివ్వండి.",
    translation: "Welcome to IndicLingo AI. Let language bring us together."
  },
  ta: {
    text: "இண்டிக்லிங்கோ ஏஐக்கு நல்வரவு. மொழி நம்மை ஒன்றிணைக்கட்டும்.",
    translation: "Welcome to IndicLingo AI. Let language bring us together."
  },
  ml: {
    text: "ഇൻഡിക്ലിംഗോ എഐയിലേക്ക് സ്വാഗതം. ഭാഷ നമ്മെ ഒന്നിപ്പിക്കട്ടെ.",
    translation: "Welcome to IndicLingo AI. Let language bring us together."
  }
};

export const LanguagesSection: React.FC = () => {
  const [selectedCode, setSelectedCode] = useState<LanguageCode>('kn');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { addToast } = useAppStore();

  const activeLang = getLanguageByCode(selectedCode);
  const sample = SAMPLE_GREETINGS[selectedCode];

  const handleSpeak = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speechService.speak(sample.text, selectedCode, {
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        addToast('Voice preview unavailable on this device.', 'warning');
      }
    });
  };

  return (
    <section id="languages" className="relative py-24 bg-transparent border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono text-[#B68B4B] uppercase tracking-wider block mb-2">
            Regional Scripts
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F4EFE6] tracking-tight mb-3">
            Six Supported <span className="text-[#B68B4B]">Languages</span>
          </h2>
          <p className="text-sm text-[#F4EFE6]/70">
            Engineered with native font shaping for accurate display of Indian scripts and ligatures.
          </p>
        </div>

        {/* Clean Glass Language Selector Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedCode(lang.code);
                  speechService.stop();
                  setIsSpeaking(false);
                }}
                className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] backdrop-blur-md border border-[#B68B4B] shadow-[0_0_20px_rgba(182,139,75,0.3)]'
                    : 'bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-[#B68B4B]/50 hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-xl font-bold text-[#F4EFE6] block mb-0.5">
                  {lang.nativeName}
                </span>
                <span className="text-xs text-[#B68B4B] font-mono block">
                  {lang.name}
                </span>
                <span className="text-[10px] text-[#F4EFE6]/50 block mt-1">
                  {lang.script} Script
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Language Spotlight Card */}
        <div className="p-6 sm:p-8 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Glyph Preview */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-center">
              <div className="text-7xl font-black text-[#B68B4B] mb-2 drop-shadow-[0_0_25px_rgba(182,139,75,0.5)]">
                {activeLang.sampleGlyphs[0]}
              </div>
              <div className="text-sm font-semibold text-[#F4EFE6]">{activeLang.nativeName}</div>
              <div className="text-xs text-[#F4EFE6]/50 font-mono mt-0.5">
                {activeLang.script} Script
              </div>
            </div>

            {/* Right: Details & Pronunciation */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#F4EFE6]">
                    {activeLang.name} <span className="text-[#B68B4B] font-normal">({activeLang.nativeName})</span>
                  </h3>
                  <p className="text-xs text-[#F4EFE6]/70 mt-1 leading-relaxed">
                    {activeLang.description}
                  </p>
                </div>
                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#B68B4B] text-[#202221] animate-pulse'
                      : 'bg-white/[0.04] backdrop-blur-md border border-white/[0.12] text-[#F4EFE6] hover:border-[#B68B4B] hover:text-[#B68B4B]'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Playing...' : 'Pronounce'}</span>
                </button>
              </div>

              {/* Sample Box */}
              <div className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-[#F4EFE6]/50 uppercase tracking-wider block">
                  Sample Text
                </span>
                <p className="text-base font-medium text-[#F4EFE6]">
                  "{sample.text}"
                </p>
                <p className="text-xs text-[#F4EFE6]/70">
                  Translation: {sample.translation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
