import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { speechService } from '../../services/speechService';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import { 
  Server, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Type 
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { isBackendConnected, setIsBackendConnected, addToast } = useAppStore();
  const [apiUrl, setApiUrl] = useState(ApiService.getBaseUrl());
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const voices = speechService.getAvailableVoices();
    setAvailableVoices(voices);

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        setAvailableVoices(speechService.getAvailableVoices());
      };
    }
  }, []);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    ApiService.setBaseUrl(apiUrl);
    const health = await ApiService.checkBackendHealth();
    setIsBackendConnected(health.isOnline);
    setIsPinging(false);

    if (health.isOnline) {
      setPingResult(`Connected (${health.latencyMs}ms)`);
      addToast('Backend connected.', 'success');
    } else {
      setPingResult('Backend offline (FastAPI backend will connect in Part 2).');
      addToast('Backend offline - frontend is in preview mode.', 'info');
    }
  };

  const handleTestSpeech = () => {
    speechService.speak(
      'IndicLingo AI speech synthesis test. Ready for translation.',
      'en',
      {
        rate: speechRate,
        pitch: speechPitch,
        onError: () => addToast('Speech test failed.', 'error'),
      }
    );
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Backend API Configuration */}
      <div className="p-6 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-[#B68B4B]" />
          <h3 className="text-base font-bold text-[#F4EFE6]">
            Backend API Endpoint
          </h3>
        </div>
        <p className="text-xs text-[#F4EFE6]/70 mb-4">
          Connect your Part 2 Python FastAPI backend endpoint.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000/api"
            className="flex-1 w-full px-3.5 py-2 rounded-xl clean-input text-xs font-mono text-[#F4EFE6]"
          />
          <Button
            variant="secondary"
            size="md"
            onClick={handleTestPing}
            isLoading={isPinging}
            className="w-full sm:w-auto shrink-0"
          >
            Test Connection
          </Button>
        </div>

        {pingResult && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              isBackendConnected
                ? 'bg-white/[0.05] border-[#B68B4B]/40 text-[#B68B4B]'
                : 'bg-white/[0.02] border-white/[0.08] text-[#F4EFE6]/80'
            }`}
          >
            {isBackendConnected ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#B68B4B]" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-[#F4EFE6]/60" />
            )}
            <span>{pingResult}</span>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="p-6 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#B68B4B]" />
            <h3 className="text-base font-bold text-[#F4EFE6]">
              Voice Controls
            </h3>
          </div>

          <Button variant="ghost" size="sm" onClick={handleTestSpeech}>
            Test Voice
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between text-xs text-[#F4EFE6] mb-2">
              <span>Speech Rate</span>
              <span className="font-mono text-[#B68B4B]">{speechRate}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.75}
              step={0.05}
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#B68B4B]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-[#F4EFE6] mb-2">
              <span>Voice Pitch</span>
              <span className="font-mono text-[#B68B4B]">{speechPitch}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#B68B4B]"
            />
          </div>
        </div>
      </div>

      {/* Font Verification */}
      <div className="p-6 rounded-2xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09]">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-4 h-4 text-[#B68B4B]" />
          <h3 className="text-base font-bold text-[#F4EFE6]">
            Script Font Shaping
          </h3>
        </div>
        <p className="text-xs text-[#F4EFE6]/70 mb-4">
          Verified Noto Sans font families for all six Indian regional scripts.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">Kannada</span>
            <span className="text-base font-bold font-kannada text-[#F4EFE6]">ಕನ್ನಡ ಸಾಹಿತ್ಯ</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">Hindi</span>
            <span className="text-base font-bold font-devanagari text-[#F4EFE6]">हिन्दी भाषा</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">Telugu</span>
            <span className="text-base font-bold font-telugu text-[#F4EFE6]">తెలుగు లిపి</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">Tamil</span>
            <span className="text-base font-bold font-tamil text-[#F4EFE6]">தமிழ் எழுத்து</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">Malayalam</span>
            <span className="text-base font-bold font-malayalam text-[#F4EFE6]">മലയാള ഭാഷ</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#F4EFE6]/40 block">English</span>
            <span className="text-base font-bold font-sans text-[#B68B4B]">IndicLingo AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
