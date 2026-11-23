import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw 
} from 'lucide-react';

interface AudioPlayerControlProps {
  audioUrl?: string | null;
  audioBlob?: Blob | null;
  title?: string;
  sourceType: 'uploaded' | 'recorded' | 'synthetic_speech';
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({
  audioUrl,
  title = 'Audio Track',
  sourceType,
  onPlayStateChange,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioUrl) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }).catch((err) => {
        console.error('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayStateChange?.(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `indiclingo-${sourceType}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!audioUrl) {
    return (
      <div className={`p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-[#F4EFE6]/50 text-center ${className}`}>
        No audio available for playback.
      </div>
    );
  }

  const badgeLabels = {
    uploaded: 'Uploaded Audio',
    recorded: 'Recorded Voice',
    synthetic_speech: 'Speech Synthesis',
  }[sourceType];

  return (
    <div className={`p-4 rounded-xl clean-card bg-white/[0.038] backdrop-blur-2xl border border-white/[0.09] ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F4EFE6]">{title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-[#B68B4B]">
            {badgeLabels}
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#F4EFE6]/70">
          {formatSeconds(currentTime)} / {formatSeconds(duration)}
        </div>
      </div>

      <div className="relative mb-3 flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#B68B4B] focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-[#956E2F] to-[#B68B4B] hover:brightness-110 text-[#202221] flex items-center justify-center font-bold transition-all shadow-[0_0_15px_rgba(182,139,75,0.4)] cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-white transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSpeedToggle}
            className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-[#B68B4B] font-semibold transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-[#F4EFE6]/60 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#B68B4B]"
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-[#F4EFE6]/70 hover:text-[#B68B4B] transition-colors flex items-center gap-1 text-xs"
            title="Download Audio"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
