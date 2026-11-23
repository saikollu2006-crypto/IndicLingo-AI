import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LanguageSelector } from '../common/LanguageSelector';
import { Button } from '../common/Button';
import { 
  FileUp, 
  Sparkles, 
  Download, 
  Languages, 
  Trash2,
  FileCheck
} from 'lucide-react';
import { DocumentService } from '../../services/documentService';
import { SummarizationService } from '../../services/summarizationService';
import { getLanguageByCode } from '../../utils/languages';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export const DocumentWorkspacePanel: React.FC = () => {
  const {
    document,
    setDocumentSourceLang,
    setDocumentTargetLang,
    setDocumentFile,
    setDocumentExtractedText,
    setDocumentTranslatedText,
    setDocumentSummarizedText,
    setDocumentStatus,
    resetDocument,
    addToHistory,
    addToast,
  } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'translated' | 'summarized'>('translated');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceMeta = getLanguageByCode(document.sourceLang);
  const targetMeta = getLanguageByCode(document.targetLang);

  const validateAndProcessFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      addToast('Please upload a PDF, DOCX, or TXT file.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      addToast('File exceeds 25MB limit.', 'error');
      return;
    }

    setDocumentFile(file);
    setDocumentStatus('extracting');

    try {
      const res = await DocumentService.extractDocumentText(file);
      setDocumentExtractedText(res.extractedText);
      setDocumentStatus('ready');
      addToast('Document ready for processing.', 'success');
    } catch {
      setDocumentStatus('error');
      addToast('Extraction failed.', 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleTranslateDoc = async () => {
    if (!document.extractedText) {
      addToast('Please upload a document first.', 'warning');
      return;
    }

    setDocumentStatus('translating');
    setActiveOutputTab('translated');
    try {
      const result = await DocumentService.translateDocument(
        document.extractedText,
        document.sourceLang,
        document.targetLang
      );
      setDocumentTranslatedText(result);
      setDocumentStatus('completed');
      addToHistory({
        type: 'document',
        sourceLang: document.sourceLang,
        targetLang: document.targetLang,
        title: `Doc Translation: ${document.fileName}`,
        sourcePreview: document.extractedText.slice(0, 100),
        resultPreview: result.slice(0, 100),
      });
      addToast('Document translated.', 'success');
    } catch {
      setDocumentStatus('ready');
      addToast('Translation error', 'error');
    }
  };

  const handleSummarizeDoc = async () => {
    if (!document.extractedText) {
      addToast('Please upload a document first.', 'warning');
      return;
    }

    setDocumentStatus('translating');
    setActiveOutputTab('summarized');
    try {
      const result = await SummarizationService.generateSummary(
        document.extractedText,
        document.sourceLang,
        document.targetLang,
        'medium',
        'bullet'
      );
      setDocumentSummarizedText(result.summaryText);
      setDocumentStatus('completed');
      addToHistory({
        type: 'summarize',
        sourceLang: document.sourceLang,
        targetLang: document.targetLang,
        title: `Doc Summary: ${document.fileName}`,
        sourcePreview: document.extractedText.slice(0, 100),
        resultPreview: result.summaryText.slice(0, 100),
      });
      addToast('Document summarized.', 'success');
    } catch {
      setDocumentStatus('ready');
      addToast('Summarization error', 'error');
    }
  };

  const handleDownloadOutput = () => {
    const textToExport =
      activeOutputTab === 'translated'
        ? document.translatedDocumentText
        : document.summarizedDocumentText;

    if (!textToExport) return;

    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `indiclingo-${activeOutputTab}-${document.fileName || 'doc'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Exported to text file.', 'success');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-wrap items-center justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <LanguageSelector
            label="Source Language"
            value={document.sourceLang}
            onChange={setDocumentSourceLang}
            align="left"
          />
          <LanguageSelector
            label="Target Language"
            value={document.targetLang}
            onChange={setDocumentTargetLang}
            align="left"
          />
        </div>

        {document.file && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSummarizeDoc}
              isLoading={document.status === 'translating' && activeOutputTab === 'summarized'}
              icon={<Sparkles className="w-3.5 h-3.5 text-[#B68B4B]" />}
            >
              Summarize
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTranslateDoc}
              isLoading={document.status === 'translating' && activeOutputTab === 'translated'}
              icon={<Languages className="w-3.5 h-3.5" />}
            >
              Translate
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Upload and preview */}
        <div className="space-y-4">
          {!document.file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 rounded-2xl clean-card border-2 border-dashed transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center min-h-[260px] ${
                isDragging
                  ? 'border-[#B68B4B] bg-[#B68B4B]/10 shadow-[0_0_20px_rgba(182,139,75,0.3)]'
                  : 'border-white/[0.12] bg-white/[0.03] hover:border-[#B68B4B]/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.1] flex items-center justify-center text-[#B68B4B] mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#F4EFE6] mb-1">
                Drop your document here or browse
              </h3>
              <p className="text-xs text-[#F4EFE6]/60 max-w-sm mb-3">
                Supports PDF, DOCX, TXT up to 25MB.
              </p>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-[#B68B4B] font-medium">
                Choose File
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-[#B68B4B]">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F4EFE6] truncate max-w-xs">
                      {document.fileName}
                    </h4>
                    <span className="text-xs text-[#F4EFE6]/60 font-mono">
                      {formatFileSize(document.fileSize)} · {document.fileType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={resetDocument}
                  className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-rose-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {document.file && (
            <div className="p-4 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
              <span className="text-xs font-semibold text-[#F4EFE6] uppercase tracking-wider block mb-2">
                Extracted Text
              </span>
              <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] max-h-56 overflow-y-auto text-xs text-[#F4EFE6] font-mono leading-relaxed whitespace-pre-wrap">
                {document.extractedText}
              </div>
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="p-5 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('translated')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeOutputTab === 'translated'
                      ? 'bg-[#B68B4B] text-[#202221]'
                      : 'text-[#F4EFE6]/70 hover:text-[#F4EFE6]'
                  }`}
                >
                  Translated Document
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('summarized')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeOutputTab === 'summarized'
                      ? 'bg-[#B68B4B] text-[#202221]'
                      : 'text-[#F4EFE6]/70 hover:text-[#F4EFE6]'
                  }`}
                >
                  Document Summary
                </button>
              </div>

              {((activeOutputTab === 'translated' && document.translatedDocumentText) ||
                (activeOutputTab === 'summarized' && document.summarizedDocumentText)) && (
                <button
                  type="button"
                  onClick={handleDownloadOutput}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-[#F4EFE6] hover:text-[#B68B4B] hover:border-[#B68B4B] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              )}
            </div>

            <div className="min-h-[260px] p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-sm text-[#F4EFE6] leading-relaxed whitespace-pre-wrap">
              {document.status === 'translating' ? (
                <div className="h-44 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-[#B68B4B]/30 border-t-[#B68B4B] animate-spin" />
                  <span className="text-xs text-[#F4EFE6]/60 font-mono">
                    Processing document...
                  </span>
                </div>
              ) : activeOutputTab === 'translated' ? (
                document.translatedDocumentText || (
                  <span className="text-[#F4EFE6]/40 italic">
                    Translated content will appear here after clicking 'Translate'.
                  </span>
                )
              ) : (
                document.summarizedDocumentText || (
                  <span className="text-[#F4EFE6]/40 italic">
                    Document summary will appear here after clicking 'Summarize'.
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
