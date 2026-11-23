import React from 'react';

interface WaveformVisualizerProps {
  levels?: number[];
  isActive?: boolean;
  barCount?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  levels = [],
  isActive = false,
  barCount = 32,
  height = 50,
  color = '#B68B4B',
  className = '',
}) => {
  const bars = Array.from({ length: barCount }).map((_, i) => {
    if (levels.length > 0) {
      const idx = i % levels.length;
      return Math.max(0.08, levels[idx] || 0.1);
    }
    if (isActive) {
      return 0.15 + Math.sin(i * 0.4 + Date.now() * 0.005) * 0.35 + Math.random() * 0.35;
    }
    return 0.12 + Math.sin(i * 0.25) * 0.12;
  });

  return (
    <div
      className={`flex items-center justify-between gap-1 w-full px-2 py-1 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      {bars.map((bar, idx) => (
        <div
          key={idx}
          className="flex-1 rounded-full transition-all duration-75 origin-center"
          style={{
            height: `${Math.min(100, Math.max(12, bar * 100))}%`,
            backgroundColor: isActive ? color : '#4D574E',
            opacity: isActive ? 0.95 : 0.45,
            boxShadow: isActive ? `0 0 8px ${color}aa` : 'none',
          }}
        />
      ))}
    </div>
  );
};
