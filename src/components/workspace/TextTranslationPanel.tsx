import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LanguageSelector } from '../common/LanguageSelector';
import { Button } from '../common/Button';
import { 
  ArrowLeftRight, 
  Copy, 
  Volume2, 
  Trash2, 
  ClipboardPaste, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { TranslationService } from '../../services/translationService';
import { speechService } from '../../services/speechService';
import { getLanguageByCode } from '../../utils/languages';

export const TextTranslationPanel: React.FC = () => {
  const {
    translation,
    setTranslationSourceLang,
    setTranslationTargetLang,
    setTranslationSourceText,
    setTranslatedText,
    setIsTranslating,
    swapTranslationLanguages,
    clearTranslation,
    addToHistory,
    addToast,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningInput, setIsListeningInput] = useState(false);

  const sourceMeta = getLanguageByCode(translation.sourceLang);
  const targetMeta = getLanguageByCode(translation.targetLang);

  const handleTranslate = async () => {
    if (!translation.sourceText.trim()) {
      addToast('Please enter text to translate.', 'warning');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await TranslationService.translateText(
        translation.sourceText,
        translation.sourceLang,
        translation.targetLang
      );
      setTranslatedText(res.translatedText);
      addToHistory({
        type: 'text',
        sourceLang: translation.sourceLang,
        targetLang: translation.targetLang,
        title: `Text Translation: ${sourceMeta.name} → ${targetMeta.name}`,
        sourcePreview: translation.sourceText.slice(0, 100),
        resultPreview: res.translatedText.slice(0, 100),
      });
      addToast('Translation completed.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Translation failed.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranslationSourceText(text);
      addToast('Pasted from clipboard', 'info');
    } catch {
      addToast('Clipboard access was denied.', 'warning');
    }
  };

  const handleCopy = async () => {
    if (!translation.translatedText) return;
    try {
      await navigator.clipboard.writeText(translation.translatedText);
      setCopied(true);
      addToast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const handleSpeakTranslation = () => {
    if (!translation.translatedText) return;
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speechService.speak(translation.translatedText, translation.targetLang, {
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        addToast(`Voice for ${targetMeta.name} not found on this system.`, 'warning');
      },
    });
  };

  const handleSpeakInput = () => {
    if (!translation.sourceText) return;
    if (isListeningInput) {
      speechService.stop();
      setIsListeningInput(false);
      return;
    }

    setIsListeningInput(true);
    speechService.speak(translation.sourceText, translation.sourceLang, {
      onEnd: () => setIsListeningInput(false),
      onError: () => {
        setIsListeningInput(false);
        addToast(`Voice for ${sourceMeta.name} not found on this system.`, 'warning');
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Language Header Bar */}
      <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-wrap items-center justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <LanguageSelector
            label="Source Language"
            value={translation.sourceLang}
            onChange={setTranslationSourceLang}
            size="md"
            align="left"
          />

          <button
            type="button"
            onClick={swapTranslationLanguages}
            className="p-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] text-[#F4EFE6]/80 hover:border-[#B68B4B]/50 hover:text-[#B68B4B] transition-all cursor-pointer mt-5"
            title="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <LanguageSelector
            label="Target Language"
            value={translation.targetLang}
            onChange={setTranslationTargetLang}
            size="md"
            align="left"
          />
        </div>

        <div className="mt-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleTranslate}
            isLoading={translation.isTranslating}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Translate Text
          </Button>
        </div>
      </div>

      {/* Two-Panel Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT PANEL: Input Text */}
        <div className="flex flex-col rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-semibold text-[#F4EFE6]">
              {sourceMeta.nativeName} ({sourceMeta.name})
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePaste}
                className="p-1.5 rounded-lg text-[#F4EFE6]/70 hover:text-white text-xs flex items-center gap-1 transition-colors"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="text-[11px]">Paste</span>
              </button>
              {translation.sourceText && (
                <>
                  <button
                    type="button"
                    onClick={handleSpeakInput}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                      isListeningInput
                        ? 'text-[#B68B4B]'
                        : 'text-[#F4EFE6]/70 hover:text-white'
                    }`}
                    title="Listen"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isListeningInput ? 'Playing...' : 'Listen'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearTranslation}
                    className="p-1.5 rounded-lg text-[#F4EFE6]/70 hover:text-rose-400 text-xs transition-colors"
                    title="Clear text"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            value={translation.sourceText}
            onChange={(e) => setTranslationSourceText(e.target.value)}
            placeholder={`Enter text in ${sourceMeta.name} (${sourceMeta.nativeName}) to translate...`}
            rows={10}
            className="w-full flex-1 p-5 bg-transparent resize-none text-[#F4EFE6] placeholder:text-[#F4EFE6]/30 focus:outline-none text-base leading-relaxed"
          />

          <div className="px-5 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#F4EFE6]/50 bg-white/[0.02] font-mono text-[11px]">
            <span>{translation.charCount} characters</span>
            <span>{sourceMeta.script}</span>
          </div>
        </div>

        {/* RIGHT PANEL: Output Text */}
        <div className="flex flex-col rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-semibold text-[#B68B4B]">
              {targetMeta.nativeName} ({targetMeta.name})
            </span>

            {translation.translatedText && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSpeakTranslation}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                    isSpeaking
                      ? 'text-[#B68B4B] animate-pulse'
                      : 'text-[#F4EFE6]/70 hover:text-white'
                  }`}
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isSpeaking ? 'Playing...' : 'Listen'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-[#F4EFE6]/70 hover:text-[#B68B4B] text-xs flex items-center gap-1 transition-colors"
                  title="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#B68B4B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-full flex-1 p-5 min-h-[240px] relative">
            {translation.isTranslating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full border-2 border-[#B68B4B]/30 border-t-[#B68B4B] animate-spin" />
                <span className="text-xs text-[#F4EFE6]/60 font-mono">
                  Translating...
                </span>
              </div>
            ) : translation.translatedText ? (
              <div className="text-[#F4EFE6] text-base leading-relaxed whitespace-pre-wrap">
                {translation.translatedText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#F4EFE6]/40 select-none">
                <p className="text-sm font-medium">Translation will appear here</p>
                <p className="text-xs mt-1">Click 'Translate Text' to translate</p>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#F4EFE6]/50 bg-white/[0.02] font-mono text-[11px]">
            <span>
              {translation.translatedText ? `${translation.translatedText.length} characters` : '0 characters'}
            </span>
            <span>{targetMeta.script}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
