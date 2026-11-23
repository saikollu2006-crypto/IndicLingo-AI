export type LanguageCode = 'en' | 'kn' | 'hi' | 'te' | 'ta' | 'ml';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  fontFamily: string;
  sampleGlyphs: string[];
  description: string;
  voiceCode: string; // BCP-47 for SpeechSynthesis
}

export type SummaryLength = 'short' | 'medium' | 'detailed';
export type SummaryFormat = 'paragraph' | 'bullet';

export interface TranslationState {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  charCount: number;
  lastUpdated?: number;
  error?: string | null;
}

export interface AudioProcessingState {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioFileName: string | null;
  transcript: string;
  translatedTranscript: string;
  isTranscribing: boolean;
  isTranslatingAudio: boolean;
  error?: string | null;
}

export interface DocumentProcessingState {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  uploadProgress: number;
  extractedText: string;
  translatedDocumentText: string;
  summarizedDocumentText: string;
  isUploading: boolean;
  isProcessing: boolean;
  status: 'idle' | 'uploaded' | 'extracting' | 'ready' | 'translating' | 'completed' | 'error';
  error?: string | null;
}

export interface SummarizationState {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  inputText: string;
  summaryLength: SummaryLength;
  summaryFormat: SummaryFormat;
  summaryText: string;
  translatedSummaryText: string;
  isGenerating: boolean;
  isTranslatingSummary: boolean;
  error?: string | null;
}

export interface HistoryItem {
  id: string;
  type: 'text' | 'audio' | 'document' | 'summarize';
  timestamp: number;
  sourceLang: LanguageCode;
  targetLang?: LanguageCode;
  title: string;
  sourcePreview: string;
  resultPreview: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
