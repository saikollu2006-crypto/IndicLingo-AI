import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LanguageSelector } from '../common/LanguageSelector';
import { Button } from '../common/Button';
import { 
  Sparkles, 
  Copy, 
  Volume2, 
  Trash2, 
  Check, 
  AlignLeft, 
  List, 
  ClipboardPaste
} from 'lucide-react';
import { SummarizationService } from '../../services/summarizationService';
import { speechService } from '../../services/speechService';
import { SummaryLength, SummaryFormat } from '../../types';
import { getLanguageByCode } from '../../utils/languages';

export const SummarizationPanel: React.FC = () => {
  const {
    summarize,
    setSummarizeSourceLang,
    setSummarizeTargetLang,
    setSummarizeInputText,
    setSummaryLength,
    setSummaryFormat,
    setSummaryText,
    setIsGeneratingSummary,
    resetSummarize,
    addToHistory,
    addToast,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sourceMeta = getLanguageByCode(summarize.sourceLang);
  const targetMeta = getLanguageByCode(summarize.targetLang);

  const handleGenerateSummary = async () => {
    if (!summarize.inputText.trim()) {
      addToast('Please enter text to summarize.', 'warning');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const res = await SummarizationService.generateSummary(
        summarize.inputText,
        summarize.sourceLang,
        summarize.targetLang,
        summarize.summaryLength,
        summarize.summaryFormat
      );
      setSummaryText(res.summaryText);
      addToHistory({
        type: 'summarize',
        sourceLang: summarize.sourceLang,
        targetLang: summarize.targetLang,
        title: `Summary (${summarize.summaryLength} · ${summarize.summaryFormat})`,
        sourcePreview: summarize.inputText.slice(0, 100),
        resultPreview: res.summaryText.slice(0, 100),
      });
      addToast('Summary generated.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Summarization failed', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSummarizeInputText(text);
      addToast('Pasted from clipboard', 'info');
    } catch {
      addToast('Clipboard access was denied.', 'warning');
    }
  };

  const handleCopy = async () => {
    if (!summarize.summaryText) return;
    try {
      await navigator.clipboard.writeText(summarize.summaryText);
      setCopied(true);
      addToast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const handleSpeakSummary = () => {
    if (!summarize.summaryText) return;
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speechService.speak(summarize.summaryText, summarize.targetLang, {
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        addToast(`Voice for ${targetMeta.name} unavailable on this device.`, 'warning');
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Options Bar */}
      <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-wrap items-center justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <LanguageSelector
            label="Source Language"
            value={summarize.sourceLang}
            onChange={setSummarizeSourceLang}
            align="left"
          />
          <LanguageSelector
            label="Output Language"
            value={summarize.targetLang}
            onChange={setSummarizeTargetLang}
            align="left"
          />
        </div>

        {/* Length & Format Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            {(['short', 'medium', 'detailed'] as SummaryLength[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setSummaryLength(len)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  summarize.summaryLength === len
                    ? 'bg-[#B68B4B] text-[#202221] shadow-sm'
                    : 'text-[#F4EFE6]/70 hover:text-[#F4EFE6]'
                }`}
              >
                {len}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setSummaryFormat('paragraph')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                summarize.summaryFormat === 'paragraph'
                  ? 'bg-[#B68B4B] text-[#202221]'
                  : 'text-[#F4EFE6]/70 hover:text-[#F4EFE6]'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Paragraph</span>
            </button>
            <button
              type="button"
              onClick={() => setSummaryFormat('bullet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                summarize.summaryFormat === 'bullet'
                  ? 'bg-[#B68B4B] text-[#202221]'
                  : 'text-[#F4EFE6]/70 hover:text-[#F4EFE6]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bullets</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleGenerateSummary}
            isLoading={summarize.isGenerating}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Summarize
          </Button>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input */}
        <div className="flex flex-col rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-semibold text-[#F4EFE6]">
              Input Text ({sourceMeta.name})
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
              {summarize.inputText && (
                <button
                  type="button"
                  onClick={resetSummarize}
                  className="p-1.5 rounded-lg text-[#F4EFE6]/70 hover:text-rose-400 text-xs transition-colors"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={summarize.inputText}
            onChange={(e) => setSummarizeInputText(e.target.value)}
            placeholder="Paste text or document excerpts to summarize..."
            rows={11}
            className="w-full flex-1 p-5 bg-transparent resize-none text-[#F4EFE6] placeholder:text-[#F4EFE6]/30 focus:outline-none text-base leading-relaxed"
          />

          <div className="px-5 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#F4EFE6]/50 bg-white/[0.02] font-mono text-[11px]">
            <span>{summarize.inputText.length} characters</span>
            <span>{sourceMeta.script}</span>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-semibold text-[#B68B4B]">
              Summary ({targetMeta.name})
            </span>

            {summarize.summaryText && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSpeakSummary}
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
            {summarize.isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full border-2 border-[#B68B4B]/30 border-t-[#B68B4B] animate-spin" />
                <span className="text-xs text-[#F4EFE6]/60 font-mono">
                  Summarizing...
                </span>
              </div>
            ) : summarize.summaryText ? (
              <div className="text-[#F4EFE6] text-base leading-relaxed whitespace-pre-wrap">
                {summarize.summaryText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#F4EFE6]/40 select-none">
                <p className="text-sm font-medium">Summary will appear here</p>
                <p className="text-xs mt-1">Select length & format, then click 'Summarize'</p>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#F4EFE6]/50 bg-white/[0.02] font-mono text-[11px]">
            <span>
              {summarize.summaryText ? `${summarize.summaryText.length} characters` : '0 characters'}
            </span>
            <span>{targetMeta.script}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
