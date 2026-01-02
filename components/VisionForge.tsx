
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { UZLogo } from './Layout';

const VisionForge: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImages(prev => [{ url: imageUrl, prompt }, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} p-6 md:p-12 overflow-y-auto`}>
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <UZLogo className="w-16 h-16" isDarkMode={isDarkMode} />
          </div>
          <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>Vision Forge</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium max-w-2xl mx-auto`}>Your imagination - our code. Create professional images from text prompts.</p>
        </header>

        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-sm`}>
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition"></div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image... (e.g. 'A futuristic city in the rain')"
                className={`relative w-full ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} rounded-3xl p-6 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 min-h-[150px] font-medium leading-relaxed`}
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`px-12 py-5 rounded-full flex items-center gap-4 transition-all font-black text-sm tracking-widest uppercase ${
                  prompt.trim() && !isGenerating
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_15px_40px_-10px_rgba(79,70,229,0.5)] active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>GENERATING...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>GENERATE IMAGE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isGenerating && (
            <div className={`aspect-square ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'} border rounded-[2rem] flex flex-col items-center justify-center space-y-6 animate-pulse`}>
               <UZLogo className="w-12 h-12 opacity-50" isDarkMode={isDarkMode} />
               <div className={`h-2 w-1/2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full`}></div>
            </div>
          )}
          {generatedImages.map((img, idx) => (
            <div key={idx} className={`group relative aspect-square ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'} border rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.03]`}>
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <p className="text-white text-sm font-bold line-clamp-3 leading-relaxed mb-6 italic">"{img.prompt}"</p>
                <div className="flex gap-3">
                  <a 
                    href={img.url} 
                    download={`uz-vision-${idx}.png`} 
                    className="flex-1 bg-white text-black font-black text-[10px] tracking-widest uppercase py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    SAVE IMAGE
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisionForge;
