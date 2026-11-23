/**
 * IndicLingo AI - Core API Client
 * Configured for Part 2 FastAPI / Python backend integration.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiService {
  private static baseUrl = API_BASE_URL;

  static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  static getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health check to detect if Part 2 backend is running,
   * automatically discovering whether to use relative /api proxy or direct port 8000.
   */
  static async checkBackendHealth(): Promise<{ isOnline: boolean; latencyMs?: number; info?: any }> {
    const startTime = performance.now();
    const candidates = [
      this.baseUrl,
      '/api',
      'http://127.0.0.1:8000/api',
      'http://localhost:8000/api',
    ];

    const uniqueCandidates = Array.from(new Set(candidates));

    for (const testUrl of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${testUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const latency = Math.round(performance.now() - startTime);
        if (response.ok) {
          this.baseUrl = testUrl;
          const data = await response.json().catch(() => ({}));
          return { isOnline: true, latencyMs: latency, info: data };
        }
      } catch {
        // Continue trying next candidate
      }
    }

    return { isOnline: false };
  }

  /**
   * Generic request wrapper with type safety and error normalization
   */
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || errorBody.detail || `API Error: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw err;
    }
  }
}
