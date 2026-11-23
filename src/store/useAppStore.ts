import { create } from 'zustand';
import { 
  LanguageCode, 
  TranslationState, 
  AudioProcessingState, 
  DocumentProcessingState, 
  SummarizationState, 
  HistoryItem, 
  UserProfile,
  SummaryLength,
  SummaryFormat
} from '../types';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface AppState {
  // Navigation & View
  activeTab: 'translate' | 'audio' | 'document' | 'summarize' | 'history' | 'settings';
  setActiveTab: (tab: 'translate' | 'audio' | 'document' | 'summarize' | 'history' | 'settings') => void;

  // Backend connection flag (Part 1 runs with clean API-ready stubs)
  isBackendConnected: boolean;
  setIsBackendConnected: (connected: boolean) => void;

  // Text Translation State
  translation: TranslationState;
  setTranslationSourceLang: (lang: LanguageCode) => void;
  setTranslationTargetLang: (lang: LanguageCode) => void;
  setTranslationSourceText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setIsTranslating: (loading: boolean) => void;
  swapTranslationLanguages: () => void;
  clearTranslation: () => void;

  // Audio Processing State
  audio: AudioProcessingState;
  setAudioSourceLang: (lang: LanguageCode) => void;
  setAudioTargetLang: (lang: LanguageCode) => void;
  setAudioRecordingState: (isRecording: boolean, isPaused?: boolean) => void;
  setRecordingDuration: (seconds: number) => void;
  setAudioData: (blob: Blob | null, url: string | null, fileName?: string | null) => void;
  setAudioTranscript: (transcript: string) => void;
  setAudioTranslatedTranscript: (text: string) => void;
  setIsTranscribing: (loading: boolean) => void;
  setIsTranslatingAudio: (loading: boolean) => void;
  resetAudio: () => void;

  // Document Processing State
  document: DocumentProcessingState;
  setDocumentSourceLang: (lang: LanguageCode) => void;
  setDocumentTargetLang: (lang: LanguageCode) => void;
  setDocumentFile: (file: File | null) => void;
  setDocumentUploadProgress: (progress: number) => void;
  setDocumentExtractedText: (text: string) => void;
  setDocumentTranslatedText: (text: string) => void;
  setDocumentSummarizedText: (text: string) => void;
  setDocumentStatus: (status: DocumentProcessingState['status']) => void;
  resetDocument: () => void;

  // Summarization State
  summarize: SummarizationState;
  setSummarizeSourceLang: (lang: LanguageCode) => void;
  setSummarizeTargetLang: (lang: LanguageCode) => void;
  setSummarizeInputText: (text: string) => void;
  setSummaryLength: (len: SummaryLength) => void;
  setSummaryFormat: (fmt: SummaryFormat) => void;
  setSummaryText: (text: string) => void;
  setTranslatedSummaryText: (text: string) => void;
  setIsGeneratingSummary: (loading: boolean) => void;
  resetSummarize: () => void;

  // History
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;

  // Authentication State & User Isolation
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ACTIVE_USER_STORAGE_KEY = 'indiclingo_active_user';

export const getHistoryStorageKey = (email?: string | null): string => {
  if (!email) return 'indiclingo_guest_history';
  const safeEmail = email.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '_');
  return `indiclingo_history_user_${safeEmail}`;
};

const getInitialUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loadUserHistory = (email?: string | null): HistoryItem[] => {
  try {
    const key = getHistoryStorageKey(email);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialUser = getInitialUser();

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'translate',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isBackendConnected: false,
  setIsBackendConnected: (connected) => set({ isBackendConnected: connected }),

  // Translation
  translation: {
    sourceLang: 'en',
    targetLang: 'kn',
    sourceText: '',
    translatedText: '',
    isTranslating: false,
    charCount: 0,
    error: null,
  },
  setTranslationSourceLang: (lang) =>
    set((state) => ({
      translation: { ...state.translation, sourceLang: lang },
    })),
  setTranslationTargetLang: (lang) =>
    set((state) => ({
      translation: { ...state.translation, targetLang: lang },
    })),
  setTranslationSourceText: (text) =>
    set((state) => ({
      translation: {
        ...state.translation,
        sourceText: text,
        charCount: text.length,
      },
    })),
  setTranslatedText: (text) =>
    set((state) => ({
      translation: { ...state.translation, translatedText: text },
    })),
  setIsTranslating: (loading) =>
    set((state) => ({
      translation: { ...state.translation, isTranslating: loading },
    })),
  swapTranslationLanguages: () =>
    set((state) => {
      const currentSource = state.translation.sourceLang;
      const currentTarget = state.translation.targetLang;
      const currentSrcText = state.translation.sourceText;
      const currentTrnText = state.translation.translatedText;
      return {
        translation: {
          ...state.translation,
          sourceLang: currentTarget,
          targetLang: currentSource,
          sourceText: currentTrnText,
          translatedText: currentSrcText,
          charCount: currentTrnText.length,
        },
      };
    }),
  clearTranslation: () =>
    set((state) => ({
      translation: {
        ...state.translation,
        sourceText: '',
        translatedText: '',
        charCount: 0,
        error: null,
      },
    })),

  // Audio
  audio: {
    sourceLang: 'kn',
    targetLang: 'en',
    isRecording: false,
    isPaused: false,
    recordingDuration: 0,
    audioBlob: null,
    audioUrl: null,
    audioFileName: null,
    transcript: '',
    translatedTranscript: '',
    isTranscribing: false,
    isTranslatingAudio: false,
  },
  setAudioSourceLang: (lang) =>
    set((state) => ({ audio: { ...state.audio, sourceLang: lang } })),
  setAudioTargetLang: (lang) =>
    set((state) => ({ audio: { ...state.audio, targetLang: lang } })),
  setAudioRecordingState: (isRecording, isPaused = false) =>
    set((state) => ({ audio: { ...state.audio, isRecording, isPaused } })),
  setRecordingDuration: (seconds) =>
    set((state) => ({ audio: { ...state.audio, recordingDuration: seconds } })),
  setAudioData: (blob, url, fileName = null) =>
    set((state) => ({
      audio: {
        ...state.audio,
        audioBlob: blob,
        audioUrl: url,
        audioFileName: fileName || (blob ? `recording-${Date.now()}.webm` : null),
      },
    })),
  setAudioTranscript: (transcript) =>
    set((state) => ({ audio: { ...state.audio, transcript } })),
  setAudioTranslatedTranscript: (text) =>
    set((state) => ({ audio: { ...state.audio, translatedTranscript: text } })),
  setIsTranscribing: (loading) =>
    set((state) => ({ audio: { ...state.audio, isTranscribing: loading } })),
  setIsTranslatingAudio: (loading) =>
    set((state) => ({ audio: { ...state.audio, isTranslatingAudio: loading } })),
  resetAudio: () =>
    set((state) => ({
      audio: {
        ...state.audio,
        isRecording: false,
        isPaused: false,
        recordingDuration: 0,
        audioBlob: null,
        audioUrl: null,
        audioFileName: null,
        transcript: '',
        translatedTranscript: '',
        isTranscribing: false,
        isTranslatingAudio: false,
      },
    })),

  // Document
  document: {
    sourceLang: 'en',
    targetLang: 'hi',
    file: null,
    fileName: null,
    fileSize: null,
    fileType: null,
    uploadProgress: 0,
    extractedText: '',
    translatedDocumentText: '',
    summarizedDocumentText: '',
    isUploading: false,
    isProcessing: false,
    status: 'idle',
  },
  setDocumentSourceLang: (lang) =>
    set((state) => ({ document: { ...state.document, sourceLang: lang } })),
  setDocumentTargetLang: (lang) =>
    set((state) => ({ document: { ...state.document, targetLang: lang } })),
  setDocumentFile: (file) =>
    set((state) => ({
      document: {
        ...state.document,
        file,
        fileName: file ? file.name : null,
        fileSize: file ? file.size : null,
        fileType: file ? file.name.split('.').pop()?.toUpperCase() || 'DOC' : null,
        status: file ? 'uploaded' : 'idle',
        uploadProgress: file ? 100 : 0,
      },
    })),
  setDocumentUploadProgress: (progress) =>
    set((state) => ({
      document: { ...state.document, uploadProgress: progress },
    })),
  setDocumentExtractedText: (text) =>
    set((state) => ({
      document: { ...state.document, extractedText: text },
    })),
  setDocumentTranslatedText: (text) =>
    set((state) => ({
      document: { ...state.document, translatedDocumentText: text },
    })),
  setDocumentSummarizedText: (text) =>
    set((state) => ({
      document: { ...state.document, summarizedDocumentText: text },
    })),
  setDocumentStatus: (status) =>
    set((state) => ({ document: { ...state.document, status } })),
  resetDocument: () =>
    set((state) => ({
      document: {
        ...state.document,
        file: null,
        fileName: null,
        fileSize: null,
        fileType: null,
        uploadProgress: 0,
        extractedText: '',
        translatedDocumentText: '',
        summarizedDocumentText: '',
        isUploading: false,
        isProcessing: false,
        status: 'idle',
      },
    })),

  // Summarize
  summarize: {
    sourceLang: 'en',
    targetLang: 'te',
    inputText: '',
    summaryLength: 'medium',
    summaryFormat: 'paragraph',
    summaryText: '',
    translatedSummaryText: '',
    isGenerating: false,
    isTranslatingSummary: false,
  },
  setSummarizeSourceLang: (lang) =>
    set((state) => ({ summarize: { ...state.summarize, sourceLang: lang } })),
  setSummarizeTargetLang: (lang) =>
    set((state) => ({ summarize: { ...state.summarize, targetLang: lang } })),
  setSummarizeInputText: (text) =>
    set((state) => ({ summarize: { ...state.summarize, inputText: text } })),
  setSummaryLength: (len) =>
    set((state) => ({ summarize: { ...state.summarize, summaryLength: len } })),
  setSummaryFormat: (fmt) =>
    set((state) => ({ summarize: { ...state.summarize, summaryFormat: fmt } })),
  setSummaryText: (text) =>
    set((state) => ({ summarize: { ...state.summarize, summaryText: text } })),
  setTranslatedSummaryText: (text) =>
    set((state) => ({
      summarize: { ...state.summarize, translatedSummaryText: text },
    })),
  setIsGeneratingSummary: (loading) =>
    set((state) => ({ summarize: { ...state.summarize, isGenerating: loading } })),
  resetSummarize: () =>
    set((state) => ({
      summarize: {
        ...state.summarize,
        inputText: '',
        summaryText: '',
        translatedSummaryText: '',
        isGenerating: false,
      },
    })),

  // History (Strictly Isolated per User)
  history: loadUserHistory(initialUser?.email),
  addToHistory: (item) => {
    const currentUser = get().user;
    const newItem: HistoryItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      userEmail: currentUser?.email,
    };
    const updated = [newItem, ...get().history.slice(0, 49)];
    set({ history: updated });
    try {
      const key = getHistoryStorageKey(currentUser?.email);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  },
  clearHistory: () => {
    const currentUser = get().user;
    set({ history: [] });
    try {
      const key = getHistoryStorageKey(currentUser?.email);
      localStorage.removeItem(key);
    } catch {}
  },
  deleteHistoryItem: (id) => {
    const currentUser = get().user;
    const updated = get().history.filter((h) => h.id !== id);
    set({ history: updated });
    try {
      const key = getHistoryStorageKey(currentUser?.email);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  },

  // User Authentication & Per-User Isolation
  user: initialUser,
  setUser: (user) => {
    if (user) {
      const normalizedUser = {
        ...user,
        email: user.email.toLowerCase().trim(),
      };
      try {
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      } catch {}
      // Load THIS specific user's isolated history
      const userHistory = loadUserHistory(normalizedUser.email);
      set({ user: normalizedUser, history: userHistory });
    } else {
      try {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      } catch {}
      set({ user: null, history: [] });
    }
  },

  logout: () => {
    try {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    } catch {}
    set({
      user: null,
      history: [],
      translation: {
        sourceLang: 'en',
        targetLang: 'kn',
        sourceText: '',
        translatedText: '',
        isTranslating: false,
        charCount: 0,
        error: null,
      },
      audio: {
        sourceLang: 'kn',
        targetLang: 'en',
        isRecording: false,
        isPaused: false,
        recordingDuration: 0,
        audioBlob: null,
        audioUrl: null,
        audioFileName: null,
        transcript: '',
        translatedTranscript: '',
        isTranscribing: false,
        isTranslatingAudio: false,
        error: null,
      },
      document: {
        sourceLang: 'en',
        targetLang: 'hi',
        file: null,
        fileName: null,
        fileSize: null,
        fileType: null,
        uploadProgress: 0,
        extractedText: '',
        translatedDocumentText: '',
        summarizedDocumentText: '',
        isUploading: false,
        isProcessing: false,
        status: 'idle',
        error: null,
      },
      summarize: {
        sourceLang: 'en',
        targetLang: 'te',
        inputText: '',
        summaryLength: 'medium',
        summaryFormat: 'paragraph',
        summaryText: '',
        translatedSummaryText: '',
        isGenerating: false,
        isTranslatingSummary: false,
        error: null,
      },
    });
  },

  // Toasts
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
