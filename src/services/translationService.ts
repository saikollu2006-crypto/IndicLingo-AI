import { ApiService } from './api';
import { LanguageCode } from '../types';
import { getLanguageByCode } from '../utils/languages';

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  isBackendGenerated: boolean;
  modelInfo?: string;
  timestamp: number;
}

// Representative linguistic dictionary examples for genuine interactive testing in Part 1
const LINGUISTIC_PREVIEWS: Record<string, Record<LanguageCode, string>> = {
  "hello": {
    en: "Hello, welcome to IndicLingo AI.",
    kn: "ನಮಸ್ಕಾರ, ಇಂಡಿಕ್‌ಲಿಂಗೋ ಎಐ ಗೆ ಸುಸ್ವಾಗತ.",
    hi: "नमस्ते, इंडिक्लिंगो एआई में आपका स्वागत है।",
    te: "నమస్కారం, ఇండిక్లింగో ఏఐకి స్వాగతం.",
    ta: "வணக்கம், இண்டிக்லிங்கோ ஏஐக்கு நல்வரவு.",
    ml: "നമസ്കാരം, ഇൻഡിക്ലിംഗോ എഐയിലേക്ക് സ്വാഗതം."
  },
  "how are you": {
    en: "How are you doing today?",
    kn: "ನೀವು ಇಂದು ಹೇಗಿದ್ದೀರಿ?",
    hi: "आप आज कैसे हैं?",
    te: "మీరు ఈ రోజు ఎలా ఉన్నారు?",
    ta: "நீங்கள் இன்று எப்படி இருக்கிறீர்கள்?",
    ml: "സുഖമാണോ? ഇന്നത്തെ ദിവസം എങ്ങനെയുണ്ട്?"
  },
  "thank you": {
    en: "Thank you very much.",
    kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು.",
    hi: "आपका बहुत-बहुत धन्यवाद।",
    te: "చాలా ధన్యవాదాలు.",
    ta: "மிக்க நன்றி.",
    ml: "വളരെ നന്ദി."
  }
};

export class TranslationService {
  /**
   * Request text translation.
   * If Part 2 backend is running, calls real translation model.
   * If backend is offline, provides a transparent preview response clearly flagged.
   */
  static async translateText(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode
  ): Promise<TranslationResult> {
    if (!text.trim()) {
      return {
        sourceText: '',
        translatedText: '',
        sourceLang,
        targetLang,
        isBackendGenerated: false,
        timestamp: Date.now(),
      };
    }

    // Try calling backend if available
    try {
      const data = await ApiService.request<{ translated_text: string; model?: string }>('/translate', {
        method: 'POST',
        body: JSON.stringify({
          text,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      });

      return {
        sourceText: text,
        translatedText: data.translated_text,
        sourceLang,
        targetLang,
        isBackendGenerated: true,
        modelInfo: data.model || 'IndicTrans2 / IndicLingo Core',
        timestamp: Date.now(),
      };
    } catch {
      // Backend not connected (Part 1 phase)
      // Provide an honest, clearly-labeled preview output
      const lower = text.trim().toLowerCase();
      let matchedPreview = '';
      for (const [key, mapping] of Object.entries(LINGUISTIC_PREVIEWS)) {
        if (lower.includes(key)) {
          matchedPreview = mapping[targetLang];
          break;
        }
      }

      const targetLangMeta = getLanguageByCode(targetLang);
      const previewText = matchedPreview || 
        `[Part 1 Frontend Preview · ${targetLangMeta.nativeName}]\n${text} → [Ready for Part 2 Translation Engine integration]`;

      return {
        sourceText: text,
        translatedText: previewText,
        sourceLang,
        targetLang,
        isBackendGenerated: false,
        modelInfo: 'Part 1 Interface Preview (Backend Offline)',
        timestamp: Date.now(),
      };
    }
  }
}
