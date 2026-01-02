
import React, { useState, useEffect } from 'react';
import { startVideoGeneration, checkVideoOperation } from '../services/gemini';

const CinemaxLogo = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse"></div>
    <div className="absolute inset-0 bg-indigo-500/10 blur-[30px] rounded-full scale-125"></div>
    <svg viewBox="0 0 100 100" className="w-full h-full relative">
      <defs>
        <linearGradient id="zGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path 
        d="M25 25 L75 25 L25 75 L75 75" 
        fill="none" 
        stroke="url(#zGrad)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="drop-shadow-[0_0_15px_rgba(99,102,241,1)]"
      />
      <circle cx="25" cy="25" r="4" fill="white" />
      <circle cx="75" cy="75" r="4" fill="#10b981" />
    </svg>
  </div>
);

const Cinemax: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideos, setGeneratedVideos] = useState<{ url: string; prompt: string }[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage("Kadrlar arxitekturasi tahlil qilinmoqda...");

    try {
      const operation = await startVideoGeneration(prompt, { resolution, aspectRatio });
      
      let currentOp = operation;
      while (!currentOp.done) {
        setStatusMessage("Video neyron tarmoqlar orqali render qilinmoqda...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        currentOp = await checkVideoOperation(currentOp);
      }

      const downloadLink = currentOp.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        setGeneratedVideos(prev => [{ url: videoUrl, prompt }, ...prev]);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        alert("API kalitni tekshiring.");
      } else {
        alert("Xatolik: " + (error.message || "Tizimda xatolik yuz berdi."));
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]"></div>
        <div className="relative z-10 space-y-12">
           <CinemaxLogo />
           <div className="max-w-xl space-y-6">
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CINEMAX<br/><span className="text-blue-500">STUDIO</span></h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Professional AI video kontent yaratish uchun Paid API kalit talab etiladi.
              </p>
           </div>
           <button
             onClick={handleSelectKey}
             className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm tracking-[0.3em] uppercase shadow-[0_25px_60px_-15px_rgba(37,99,235,0.6)] transition-all hover:scale-105 active:scale-95 border border-white/10"
           >
             API KALITNI ULANISH
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto relative transition-colors duration-500 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none opacity-50"></div>
      
      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 space-y-16 relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
          <div className="flex items-center gap-8">
            <CinemaxLogo />
            <div className="text-left">
              <h2 className={`text-6xl font-black tracking-tighter uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cinemax</h2>
              <p className={`font-bold mt-2 uppercase tracking-[0.4em] text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Visual Intelligence</p>
            </div>
          </div>
          <div className="flex gap-4 p-1.5 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/5">
             <div className="px-4 py-2 text-center border-r border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Model</p>
                <p className="text-xs text-white font-bold">Veo 3.1 Pro</p>
             </div>
             <div className="px-4 py-2 text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">FPS</p>
                <p className="text-xs text-white font-bold">60 High-Res</p>
             </div>
          </div>
        </header>

        <div className={`rounded-[3rem] p-1 border shadow-2xl overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-10 space-y-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Neyron tarmoqlar uchun sahnani tavsiflang..."
                className={`relative w-full rounded-[2.5rem] p-8 focus:outline-none focus:ring-0 min-h-[180px] font-medium text-lg leading-relaxed transition-all ${isDarkMode ? 'bg-[#0a1224] border-slate-800 text-slate-100 placeholder-slate-700' : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Video Sifati</label>
                <div className={`grid grid-cols-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-black/40' : 'bg-slate-100'}`}>
                  {['720p', '1080p'].map((res) => (
                    <button key={res} onClick={() => setResolution(res as any)} className={`py-3.5 rounded-xl text-xs font-black transition-all ${resolution === res ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{res}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Kadr Formati</label>
                <div className={`grid grid-cols-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-black/40' : 'bg-slate-100'}`}>
                  {['16:9', '9:16'].map((ratio) => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio as any)} className={`py-3.5 rounded-xl text-xs font-black transition-all ${aspectRatio === ratio ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{ratio === '16:9' ? 'Landshaft' : 'Portret'}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-6">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`group relative px-20 py-7 rounded-full transition-all font-black text-sm tracking-[0.4em] uppercase overflow-hidden ${
                  prompt.trim() && !isGenerating 
                    ? 'bg-blue-600 text-white shadow-[0_20px_50px_-10px_rgba(37,99,235,0.6)] hover:scale-[1.03] active:scale-95' 
                    : 'bg-slate-800 text-slate-600 opacity-40'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10 flex items-center gap-4">
                   {isGenerating ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       <span>RENDER_IN_PROGRESS</span>
                     </>
                   ) : (
                     <>
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                       </svg>
                       <span>CREATE_CINEMA</span>
                     </>
                   )}
                </div>
              </button>
              {isGenerating && <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-32">
          {generatedVideos.map((vid, idx) => (
            <div key={idx} className={`group relative rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:scale-[1.02] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <video src={vid.url} controls className="w-full aspect-video object-cover" />
              <div className="p-8 bg-black/60 backdrop-blur-xl border-t border-white/5">
                <p className="text-[11px] text-slate-400 font-mono italic leading-relaxed">PROMPT: "{vid.prompt}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cinemax;
