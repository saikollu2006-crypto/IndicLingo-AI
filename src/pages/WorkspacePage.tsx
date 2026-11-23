import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceSidebar } from '../components/workspace/WorkspaceSidebar';
import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader';
import { TextTranslationPanel } from '../components/workspace/TextTranslationPanel';
import { AudioWorkspacePanel } from '../components/workspace/AudioWorkspacePanel';
import { DocumentWorkspacePanel } from '../components/workspace/DocumentWorkspacePanel';
import { SummarizationPanel } from '../components/workspace/SummarizationPanel';
import { HistoryPanel } from '../components/workspace/HistoryPanel';
import { SettingsPanel } from '../components/workspace/SettingsPanel';
import { useAppStore } from '../store/useAppStore';
import { ToastContainer } from '../components/common/ToastContainer';
import { WorkspaceCosmicScene } from '../scenes/WorkspaceCosmicScene';
import { X } from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeTab, user, addToast } = useAppStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      addToast('Please log in or create an account to access the workspace.', 'info');
      navigate('/login');
    }
  }, [user, navigate, addToast]);

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen text-[#F4EFE6] flex flex-col md:flex-row overflow-x-hidden selection:bg-[#B68B4B]/30 selection:text-white bg-[#202221]">
      {/* Semi-transparent 3D Cosmic Background across Workspace */}
      <WorkspaceCosmicScene />

      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-20">
        <WorkspaceSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-60 bg-[#202221]/95 backdrop-blur-2xl h-full flex flex-col border-r border-white/[0.08]">
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#F4EFE6]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <WorkspaceSidebar />
          </div>
        </div>
      )}

      {/* Main Workspace Flow */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-transparent relative z-10">
        <WorkspaceHeader onToggleMobileMenu={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'translate' && <TextTranslationPanel />}
          {activeTab === 'audio' && <AudioWorkspacePanel />}
          {activeTab === 'document' && <DocumentWorkspacePanel />}
          {activeTab === 'summarize' && <SummarizationPanel />}
          {activeTab === 'history' && <HistoryPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
