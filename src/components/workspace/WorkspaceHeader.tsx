import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { BackendStatusBadge } from '../common/BackendStatusBadge';
import { User, Menu, LogOut } from 'lucide-react';

interface WorkspaceHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { activeTab, user, logout, addToast } = useAppStore();

  const handleLogout = () => {
    logout();
    addToast('You have been signed out.', 'info');
    navigate('/login');
  };

  const titles: Record<string, string> = {
    translate: 'Text Translation',
    audio: 'Audio & Speech Translation',
    document: 'Document Translation',
    summarize: 'Intelligent Summarization',
    history: 'Translation History',
    settings: 'Settings & Voices',
  };

  const currentTitle = titles[activeTab] || 'Translation Workspace';

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#F4EFE6]/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-[#F4EFE6] tracking-tight">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <BackendStatusBadge />

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-xs text-[#F4EFE6]">
              <div className="w-5 h-5 rounded-full bg-[#B68B4B] text-[#202221] flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-[#F4EFE6] leading-tight">{user.name}</span>
                <span className="text-[10px] text-[#F4EFE6]/60 font-mono leading-none hidden sm:inline">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[#F4EFE6]/80 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B68B4B]" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:border-[#B68B4B]/50 border border-white/[0.08] text-xs text-[#F4EFE6]/80 hover:text-[#F4EFE6] transition-colors"
          >
            <User className="w-3.5 h-3.5 text-[#B68B4B]" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
