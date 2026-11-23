import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Languages, 
  Mic, 
  FileText, 
  Sparkles, 
  History, 
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const WorkspaceSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, user, logout, addToast } = useAppStore();

  const handleLogout = () => {
    logout();
    addToast('You have been signed out.', 'info');
    navigate('/login');
  };

  const navItems = [
    {
      id: 'translate',
      label: 'Translate',
      icon: <Languages className="w-4 h-4" />,
    },
    {
      id: 'audio',
      label: 'Audio & Speech',
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: 'document',
      label: 'Documents',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-4 h-4" />,
    },
  ] as const;

  return (
    <aside className="w-60 bg-white/[0.03] backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Top Branding */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center p-1">
              <img src="/logo.svg" alt="IndicLingo AI" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#F4EFE6] flex items-center gap-1.5">
              IndicLingo <span className="text-[#B68B4B] text-xs font-mono">AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-[#B68B4B] border border-[#B68B4B]/50 shadow-[0_0_15px_rgba(182,139,75,0.25)]'
                    : 'text-[#F4EFE6]/70 hover:bg-white/[0.05] hover:text-[#F4EFE6] border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#B68B4B]' : 'text-[#F4EFE6]/50'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Info & Exit */}
      <div className="p-3 border-t border-white/[0.08] space-y-2">
        {user && (
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#B68B4B] text-[#202221] flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#F4EFE6] truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-[#F4EFE6]/60 font-mono truncate leading-none">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-[#F4EFE6]/60 hover:text-[#B68B4B] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </Link>
      </div>
    </aside>
  );
};
