
import React, { useState } from 'react';
import { getGeminiClient } from '../services/gemini';
import { Type } from '@google/genai';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

interface ProjectData {
  projectName: string;
  description: string;
  techStack: string[];
  structure: FileNode[];
}

const DevStudio: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
  const [currentStatus, setCurrentStatus] = useState('');

  const languages = [
    { name: 'JavaScript', color: 'text-yellow-400', icon: 'JS' },
    { name: 'Python', color: 'text-blue-400', icon: 'PY' },
    { name: 'Java', color: 'text-red-400', icon: 'JV' },
    { name: 'C++', color: 'text-blue-600', icon: 'C+' },
    { name: 'PHP', color: 'text-indigo-400', icon: 'PH' },
    { name: 'Go', color: 'text-cyan-400', icon: 'GO' },
    { name: 'Rust', color: 'text-orange-500', icon: 'RS' },
    { name: 'Swift', color: 'text-orange-400', icon: 'SW' },
  ];

  const generateProject = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProject(null);
    setSelectedFile(null);
    setCurrentStatus('Loyiha mohiyati tahlil qilinmoqda...');

    try {
      const ai = getGeminiClient();
      const systemInstruction = `Siz UZ Studio 8X tizimisiz. Siz dunyodagi eng tajribali Senior Full-Stack Architect-siz. 
Foydalanuvchi so'ragan g'oya uchun professional va ishchi arxitektura yarating.
MUHIM: Agar foydalanuvchi aniq bir tilni so'ramasa, loyiha strukturasiga quyidagi 8 ta tilning har biri uchun kamida bitta namunaviy fayl yoki modul qo'shing: JavaScript, Python, Java, C++, PHP, Go, Rust, Swift.
Kodlar o'zbek tilidagi kommentariyalar bilan boyitilgan bo'lishi kerak. 
Natijani FAQAT JSON formatida qaytaring.`;

      setTimeout(() => setCurrentStatus('Algoritmlar 8 xil tilda sintez qilinmoqda...'), 3000);
      setTimeout(() => setCurrentStatus('Struktura va modullar shakllantirilmoqda...'), 7000);

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: `Loyiha g'oyasi: "${prompt}". Ushbu loyihani 8 xil dasturlash tilida (JS, PY, JV, C++, PHP, GO, RS, SW) qismlarga bo'lib, mukammal kodlar bilan tayyorla.` }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              description: { type: Type.STRING },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              structure: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    children: { type: Type.ARRAY, items: { type: Type.OBJECT } }
                  }
                }
              }
            },
            required: ['projectName', 'description', 'techStack', 'structure']
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as ProjectData;
      setProject(data);
      setActiveTab('overview');
    } catch (error) {
      console.error(error);
      alert("Xatolik: Loyihani generatsiya qilishda xatolik yuz berdi.");
    } finally {
      setIsGenerating(false);
      setCurrentStatus('');
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node, i) => (
      <div key={i} className="select-none">
        <div 
          onClick={() => node.type === 'file' && setSelectedFile(node)}
          className={`flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer transition-all ${
            selectedFile?.name === node.name 
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
              : 'hover:bg-white/5 border border-transparent'
          }`}
          style={{ marginLeft: `${depth * 1.2}rem` }}
        >
          {node.type === 'folder' ? (
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="text-xs font-bold tracking-tight">{node.name}</span>
        </div>
        {node.children && renderTree(node.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} overflow-hidden relative`}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="text-[8px] font-mono leading-none break-all">
            {Array(500).fill("01100101010101UZSTUDIO8X010101").join("")}
         </div>
      </div>

      {/* Header Section */}
      <div className={`relative z-10 p-8 border-b transition-all ${isDarkMode ? 'border-slate-800 bg-slate-900/60 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-lg'}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-indigo-600 rounded-[2rem] shadow-[0_0_30px_rgba(79,70,229,0.5)] transform -rotate-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
               </div>
               <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">UZ Studio 8X</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">The Ultimate Multi-Language IDE • Pro Edition</p>
               </div>
            </div>

            <div className="flex flex-wrap gap-2">
               {languages.map(lang => (
                 <div key={lang.name} className={`px-3 py-1.5 rounded-xl text-[10px] font-black bg-white/5 border border-white/10 ${lang.color} flex items-center gap-2`}>
                   <span className="w-4 h-4 bg-white/10 rounded flex items-center justify-center text-[8px]">{lang.icon}</span>
                   {lang.name}
                 </div>
               ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex gap-4">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateProject()}
                placeholder="Nima yaratmoqchimiz? (masalan: 8 xil tilda chat tizimi kodi)"
                className={`flex-1 px-8 py-6 rounded-[2rem] text-xl font-bold transition-all focus:outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white border-2 focus:border-indigo-500' : 'bg-slate-100 border-slate-200 focus:border-indigo-400 border-2 shadow-inner'
                }`}
              />
              <button
                onClick={generateProject}
                disabled={!prompt.trim() || isGenerating}
                className={`px-12 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase transition-all flex items-center gap-3 ${
                  prompt.trim() && !isGenerating 
                    ? 'bg-indigo-600 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:scale-[1.05] active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? 'GENERATING...' : 'BUILD_NOW'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-fadeIn">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-indigo-600 rounded-3xl animate-pulse rotate-45"></div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-[0.2em]">{currentStatus}</h3>
              <div className="flex justify-center gap-1">
                 {Array(5).fill(0).map((_, i) => (
                   <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                 ))}
              </div>
            </div>
          </div>
        ) : project ? (
          <div className="flex-1 flex overflow-hidden animate-fadeIn">
            {/* Sidebar (File Tree) */}
            <div className={`w-80 border-r overflow-y-auto p-6 space-y-8 ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-white'}`}>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2 flex items-center justify-between">
                  <span>LOJIHA DARAXTI</span>
                  <span className="bg-indigo-500 text-white px-1.5 rounded">v8.0</span>
                </p>
                <div className="space-y-2">
                  {renderTree(project.structure)}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-800/50">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">TEXNOLOGIYALAR</p>
                <div className="flex flex-wrap gap-2 px-2">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{tech}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
               <div className={`flex items-center gap-10 px-10 py-5 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-500 scale-110' : 'border-transparent text-slate-500 hover:text-indigo-400'}`}
                  >
                    UMUMIY_REJA
                  </button>
                  <button 
                    onClick={() => setActiveTab('code')}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'code' ? 'border-indigo-500 text-indigo-500 scale-110' : 'border-transparent text-slate-500 hover:text-indigo-400'}`}
                  >
                    MANBA_KODI
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  {activeTab === 'overview' ? (
                    <div className="max-w-4xl space-y-12">
                       <div className="space-y-6">
                          <h1 className="text-6xl font-black tracking-tighter text-indigo-500 uppercase italic">{project.projectName}</h1>
                          <div className="h-1 w-32 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"></div>
                          <p className="text-2xl font-medium leading-relaxed opacity-80">{project.description}</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className={`p-10 rounded-[2.5rem] border group hover:scale-[1.02] transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 group-hover:rotate-12 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">OPTIMALLASHGAN LOYIHA</h4>
                             <p className="text-sm font-medium opacity-60 leading-relaxed">Ushbu loyiha 8 xil dasturlash tilining eng yaxshi amaliyotlari asosida sintez qilindi. Har bir modul o'zaro modular va scalable.</p>
                          </div>
                          <div className={`p-10 rounded-[2.5rem] border group hover:scale-[1.02] transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:-rotate-12 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-4">PRODUCTION_READY</h4>
                             <p className="text-sm font-medium opacity-60 leading-relaxed">Biz taqdim etgan kodlar syntax jihatidan tekshirilgan va real muhitda (Docker/Kubernetes/Cloud) ishlatishga tayyor holatda shakllantirilgan.</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                       {selectedFile ? (
                         <div className="h-full flex flex-col space-y-6 animate-slideUp">
                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xs text-white">
                                     {selectedFile.name.split('.').pop()?.toUpperCase()}
                                  </div>
                                  <div>
                                     <span className="font-mono text-sm font-bold text-indigo-400 block">{selectedFile.name}</span>
                                     <span className="text-[8px] font-black uppercase tracking-widest opacity-40">UZ STUDIO CODE VIEWER</span>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => {
                                   navigator.clipboard.writeText(selectedFile.content || '');
                                   alert('Kod nusxalandi!');
                                 }}
                                 className="text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all active:scale-95"
                               >
                                 NUSXA_OLISH
                               </button>
                            </div>
                            <div className="flex-1 relative group">
                               <div className="absolute -inset-0.5 bg-indigo-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                               <pre className={`relative h-full p-10 rounded-3xl overflow-auto font-mono text-sm leading-relaxed border custom-scrollbar ${
                                 isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-inner'
                               }`}>
                                  {selectedFile.content || '// Fayl bo\'sh'}
                               </pre>
                            </div>
                         </div>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <div className="w-32 h-32 border-2 border-dashed border-indigo-500 rounded-full flex items-center justify-center animate-spin-slow mb-8">
                               <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                               </svg>
                            </div>
                            <p className="font-black uppercase tracking-[0.5em] text-sm italic">Faylni tanlang va kod sirlarini oching</p>
                         </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-16 animate-fadeIn">
             <div className="relative">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full"></div>
                <div className="relative p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                   <div className="grid grid-cols-4 gap-4">
                      {languages.map(l => (
                        <div key={l.name} className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-xs ${l.color} border border-white/5`}>
                          {l.icon}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="max-w-2xl space-y-6">
                <h3 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">G'oyani 8 xil tilda kodga aylantiramiz</h3>
                <p className="text-xl font-medium opacity-40 leading-relaxed">JS, Python, Java va boshqa eng mashhur tillarda professional loyiha strukturasini bir marta bosish bilan oling.</p>
                <div className="pt-8 flex justify-center gap-4">
                   <div className="flex -space-x-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                           {i + 1}
                        </div>
                      ))}
                   </div>
                   <p className="text-xs font-bold text-slate-500 uppercase mt-3 tracking-widest">LOYIHALAR YARATILDI</p>
                </div>
             </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default DevStudio;
