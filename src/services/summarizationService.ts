import { ApiService } from './api';
import { LanguageCode, SummaryLength, SummaryFormat } from '../types';

export interface SummarizationResult {
  originalText: string;
  summaryText: string;
  length: SummaryLength;
  format: SummaryFormat;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  isBackendGenerated: boolean;
}

export class SummarizationService {
  /**
   * Summarizes input text based on requested length and format.
   * Dispatches to Part 2 backend when online; returns structured preview when offline.
   */
  static async generateSummary(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode,
    length: SummaryLength,
    format: SummaryFormat
  ): Promise<SummarizationResult> {
    if (!text.trim()) {
      return {
        originalText: '',
        summaryText: '',
        length,
        format,
        sourceLang,
        targetLang,
        isBackendGenerated: false,
      };
    }

    try {
      const data = await ApiService.request<{ summary: string }>('/summarize', {
        method: 'POST',
        body: JSON.stringify({
          text,
          source_lang: sourceLang,
          target_lang: targetLang,
          length,
          format,
        }),
      });

      return {
        originalText: text,
        summaryText: data.summary,
        length,
        format,
        sourceLang,
        targetLang,
        isBackendGenerated: true,
      };
    } catch {
      // Offline fallback: generate a clean structured layout preview based on selected options
      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.trim().length > 0);

      let count = 2;
      if (length === 'short') count = 1;
      if (length === 'detailed') count = 4;

      const selected = sentences.slice(0, count);
      let summaryText = '';

      if (format === 'bullet') {
        summaryText = selected.length > 0
          ? selected.map((s) => `• ${s}`).join('\n')
          : `• Key insight 1: ${text.slice(0, 80)}...\n• Key insight 2: Summary output formatted for ${targetLang.toUpperCase()} preview.`;
      } else {
        summaryText = selected.length > 0
          ? selected.join(' ')
          : `[Summary Overview]: ${text.slice(0, 180)}...`;
      }

      return {
        originalText: text,
        summaryText: `[Part 1 Summarizer Preview · ${length.toUpperCase()} · ${format.toUpperCase()}]\n${summaryText}`,
        length,
        format,
        sourceLang,
        targetLang,
        isBackendGenerated: false,
      };
    }
  }
}
