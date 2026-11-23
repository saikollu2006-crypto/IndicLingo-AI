import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  History, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  ArrowRight, 
  Languages, 
  Mic, 
  FileText, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { getLanguageByCode } from '../../utils/languages';

export const HistoryPanel: React.FC = () => {
  const { history, clearHistory, deleteHistoryItem, setActiveTab, setTranslationSourceText, addToast, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.sourcePreview.toLowerCase().includes(q) ||
      item.resultPreview.toLowerCase().includes(q)
    );
  });

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      addToast('Copied to clipboard.', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const handleLoadItem = (item: any) => {
    if (item.type === 'text') {
      setTranslationSourceText(item.sourcePreview);
      setActiveTab('translate');
      addToast('Loaded into translator', 'info');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-4 h-4 text-[#B68B4B]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#B68B4B]" />;
      case 'summarize':
        return <Sparkles className="w-4 h-4 text-[#B68B4B]" />;
      default:
        return <Languages className="w-4 h-4 text-[#B68B4B]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Account Privacy & Isolation Indicator */}
      {user && (
        <div className="px-4 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center justify-between text-xs text-[#F4EFE6]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Private data isolated for: <span className="text-[#B68B4B] font-mono font-semibold">{user.email}</span>
            </span>
          </div>
          <span className="text-[11px] text-[#F4EFE6]/60 hidden sm:inline font-mono">
            Encrypted & isolated per account
          </span>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-wrap items-center justify-between gap-4 relative z-20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4EFE6]/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past translations, voice notes, or summaries..."
            className="w-full pl-10 pr-4 py-2 rounded-xl clean-input text-xs text-[#F4EFE6]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#F4EFE6]/60 font-mono">
            {filteredHistory.length} items
          </span>
          {history.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearHistory}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="p-16 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] text-center flex flex-col items-center justify-center text-[#F4EFE6]/50">
          <History className="w-10 h-10 text-white/30 mb-3" />
          <h3 className="text-sm font-bold text-[#F4EFE6] mb-1">
            {searchQuery ? 'No matching records' : 'No saved history'}
          </h3>
          <p className="text-xs text-[#F4EFE6]/60">
            Translations and summaries will be automatically saved here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString();
            const sourceLang = getLanguageByCode(item.sourceLang);
            const targetLang = item.targetLang ? getLanguageByCode(item.targetLang) : null;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#F4EFE6] truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#F4EFE6]/50">
                        · {dateStr}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-[#F4EFE6]/50 block mb-0.5">
                          {sourceLang.name}
                        </span>
                        <p className="text-[#F4EFE6]/80 truncate">{item.sourcePreview}</p>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-[#B68B4B] block mb-0.5">
                          {targetLang ? targetLang.name : 'Result'}
                        </span>
                        <p className="text-[#F4EFE6] truncate">{item.resultPreview}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.resultPreview)}
                    className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-[#B68B4B]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleLoadItem(item)}
                    className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-[#B68B4B] transition-colors"
                    title="Open in translator"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
