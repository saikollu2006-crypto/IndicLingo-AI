import { LanguageCode } from '../types';
import { getLanguageByCode } from '../utils/languages';
import { ApiService } from './api';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Reads text aloud using backend Neural TTS (Edge-TTS / gTTS) when online,
   * falling back cleanly to browser SpeechSynthesis.
   */
  public async speak(
    text: string,
    langCode: LanguageCode,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<boolean> {
    this.stop();

    // 1. Try Backend Neural TTS API
    try {
      const data = await ApiService.request<{ audio_url: string; voice: string }>('/speech/generate', {
        method: 'POST',
        body: JSON.stringify({
          text,
          language: langCode,
        }),
      });

      if (data && data.audio_url) {
        return new Promise<boolean>((resolve) => {
          // Construct full audio stream URL
          const baseUrl = ApiService.getBaseUrl().replace(/\/api\/?$/, '');
          const fullAudioUrl = data.audio_url.startsWith('http')
            ? data.audio_url
            : `${baseUrl}${data.audio_url.startsWith('/') ? '' : '/'}${data.audio_url}`;

          const audio = new Audio(fullAudioUrl);
          this.currentAudioElement = audio;

          audio.onplay = () => {
            options?.onStart?.();
          };

          audio.onended = () => {
            this.currentAudioElement = null;
            options?.onEnd?.();
            resolve(true);
          };

          audio.onerror = () => {
            this.currentAudioElement = null;
            // Fall back to browser synth
            this.speakWithBrowserSynth(text, langCode, options).then(resolve);
          };

          audio.play().catch(() => {
            this.speakWithBrowserSynth(text, langCode, options).then(resolve);
          });
        });
      }
    } catch {
      // Backend offline or speech generation failure: proceed to browser speech synthesis
    }

    // 2. Fallback to Browser SpeechSynthesis
    return this.speakWithBrowserSynth(text, langCode, options);
  }

  private speakWithBrowserSynth(
    text: string,
    langCode: LanguageCode,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth || !this.isSupported) {
        options?.onError?.(new Error('Speech Synthesis not supported in this browser.'));
        resolve(false);
        return;
      }

      const langObj = getLanguageByCode(langCode);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langObj.voiceCode;
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;

      // Match closest available voice for this language
      const voices = this.getAvailableVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langCode) ||
          v.lang.toLowerCase() === langObj.voiceCode.toLowerCase()
      );
      if (match) {
        utterance.voice = match;
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
        this.currentUtterance = null;
        resolve(true);
      };

      utterance.onerror = (e) => {
        options?.onError?.(e);
        this.currentUtterance = null;
        resolve(false);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  public pause(): void {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch(() => {});
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    const isAudioPlaying = Boolean(
      this.currentAudioElement &&
      !this.currentAudioElement.paused &&
      !this.currentAudioElement.ended
    );
    return isAudioPlaying || Boolean(this.synth && this.synth.speaking);
  }
}

export const speechService = new SpeechService();
