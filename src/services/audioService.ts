import { ApiService } from './api';
import { LanguageCode } from '../types';

export interface TranscriptionResult {
  transcript: string;
  detectedLanguage: string;
  confidence?: number;
  durationSeconds?: number;
  isBackendGenerated: boolean;
  segments?: Array<{ id: number; start: number; end: number; text: string }>;
}

export class AudioService {
  /**
   * Transcribe recorded or uploaded audio using backend OpenAI Whisper engine.
   */
  static async transcribeAudio(
    audioBlob: Blob,
    filename: string = 'recording.webm',
    languageHint?: LanguageCode
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    if (languageHint) {
      formData.append('language', languageHint);
    }

    try {
      const response = await fetch(`${ApiService.getBaseUrl()}/audio/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Transcription failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        transcript: data.transcript || data.text || '',
        detectedLanguage: data.detected_language || languageHint || 'en',
        confidence: data.language_confidence,
        durationSeconds: data.duration_seconds,
        isBackendGenerated: true,
        segments: data.segments,
      };
    } catch (err: any) {
      console.warn('Backend audio transcription failed, returning structured fallback:', err);
      throw err;
    }
  }
}
