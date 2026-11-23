export interface AudioRecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onTimeUpdate?: (seconds: number) => void;
  onWaveformData?: (levels: number[]) => void;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private timerInterval: number | null = null;
  private durationSeconds = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  public static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder === 'function'
    );
  }

  public async startRecording(options?: AudioRecorderOptions): Promise<boolean> {
    if (!AudioRecorderService.isSupported()) {
      throw new Error('Microphone audio recording is not supported in this browser environment.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.durationSeconds = 0;

      // Select supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

      this.mediaRecorder = new MediaRecorder(this.stream, supportedType ? { mimeType: supportedType } : undefined);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Set up Web Audio Analyser for live visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateVisuals = () => {
          if (this.analyser && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.analyser.getByteFrequencyData(dataArray);
            // Convert to normalized 0-1 values for 16 frequency bands
            const levels = Array.from(dataArray.slice(0, 16)).map((v) => Math.round((v / 255) * 100) / 100);
            options?.onWaveformData?.(levels);
            this.animFrameId = requestAnimationFrame(updateVisuals);
          }
        };
        updateVisuals();
      } catch (e) {
        console.warn('AudioContext visualizer init skipped:', e);
      }

      this.mediaRecorder.start(250); // capture in chunks of 250ms

      this.timerInterval = window.setInterval(() => {
        this.durationSeconds += 1;
        options?.onTimeUpdate?.(this.durationSeconds);
      }, 1000);

      return true;
    } catch (err: any) {
      this.cleanup();
      throw new Error(err.message || 'Permission denied or microphone unavailable.');
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  public stopRecording(): Promise<{ blob: Blob; url: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        this.cleanup();
        reject(new Error('No active recording.'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
      const finalDuration = this.durationSeconds;

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.cleanup();
        resolve({ blob: audioBlob, url: audioUrl, duration: finalDuration });
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export const audioRecorderService = new AudioRecorderService();
