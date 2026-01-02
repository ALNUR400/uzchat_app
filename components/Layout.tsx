
import React, { useState } from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  searchEnabled: boolean;
  setSearchEnabled: (val: boolean) => void;
  voiceName: string;
  setVoiceName: (val: string) => void;
}

export const UZLogo = ({ className = "w-10 h-10", isDarkMode }: { className?: string; isDarkMode?: boolean }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full"></div>
    <svg viewBox="0 0 100 100" className="w-full h-full relative">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path 
        d="M30 30 L70 30 L30 70 L70 70" 
        fill="none" 
        stroke="url(#logoGrad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]"
      />
    </svg>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, activeMode, onModeChange, 
  isDarkMode, setIsDarkMode, 
  searchEnabled, setSearchEnabled,
  voiceName, setVoiceName
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { mode: AppMode.Chat, label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { mode: AppMode.Voice, label: 'Voice', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { mode: AppMode.ImageGen, label: 'Vision', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { mode: AppMode.Cinema, label: 'Cinema', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { mode: AppMode.Studio, label: 'Studio', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { mode: AppMode.VisualDict, label: 'Cards', icon: 'M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
  ];

  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden relative">
      <aside className="w-20 md:w-64 glass-panel rounded-3xl flex flex-col py-8 px-4 transition-all duration-500">
        <div className="flex items-center justify-center md:justify-start gap-4 px-2 mb-12">
          <UZLogo className="w-10 h-10" />
          <h1 className="hidden md:block text-xl font-extrabold tracking-tighter text-white">UZ<span className="text-indigo-400">CHAT</span></h1>
        </div>

        <nav className="flex-1 space-y-3 px-1">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                activeMode === item.mode
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
              </svg>
              <span className="hidden md:block text-sm font-bold tracking-tight">{item.label}</span>
              {activeMode === item.mode && (
                <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
           <button 
             onClick={() => setShowSettings(true)}
             className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="hidden md:block text-sm font-bold">Options</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 glass-panel rounded-3xl relative overflow-hidden flex flex-col">
        {children}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowSettings(false)}></div>
          <div className="relative w-full max-w-sm glass-panel rounded-[2.5rem] p-8 animate-in border border-white/10 shadow-2xl">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-extrabold">Preferences</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-300">Google Search</span>
                   <button onClick={() => setSearchEnabled(!searchEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${searchEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${searchEnabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Personality</p>
                   <div className="grid grid-cols-3 gap-2">
                      {['Kore', 'Puck', 'Zephyr'].map(v => (
                        <button key={v} onClick={() => setVoiceName(v)} className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${voiceName === v ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-white/5 text-slate-500 hover:border-white/10'}`}>{v}</button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
