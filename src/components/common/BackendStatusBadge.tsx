import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';

export const BackendStatusBadge: React.FC = () => {
  const { isBackendConnected, setIsBackendConnected } = useAppStore();
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const health = await ApiService.checkBackendHealth();
    setIsBackendConnected(health.isOnline);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-colors ${
          isBackendConnected
            ? 'bg-white/[0.06] border-[#B68B4B]/60 text-[#B68B4B]'
            : 'bg-white/[0.03] border-white/[0.1] text-[#F4EFE6]/70'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isBackendConnected
              ? 'bg-[#B68B4B] animate-pulse shadow-[0_0_8px_#B68B4B]'
              : 'bg-[#4D574E]'
          }`}
        />
        <span className="font-mono text-[11px]">
          {isBackendConnected ? 'Backend Connected' : 'Frontend Preview'}
        </span>
      </div>

      <button
        onClick={checkConnection}
        disabled={checking}
        title="Check Backend Connection"
        className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-[#B68B4B] hover:bg-white/5 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-[#B68B4B]' : ''}`} />
      </button>
    </div>
  );
};
