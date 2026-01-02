
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/gemini';

const MarketingAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = [
    { title: 'Product Hunt Launch', prompt: 'Mening yangi SaaS loyihamni Product Hunt-da muvaffaqiyatli ishga tushirish uchun "Hunter" topishdan tortib, "First Comment" gacha reja tuzib ber.', icon: '🚀' },
    { title: 'GitHub Stars', prompt: 'Mening Open Source kutubxonam ko\'proq yulduzcha (stars) to\'plashi uchun GitHub README.md va marketing strategiyasini qanday qilay?', icon: '⭐' },
    { title: 'Technical Blog', prompt: 'Dasturchilar orasida mashhur bo\'lish uchun Dev.to va Hashnode-da qanday mavzularda yozishim kerak? Menga 5 ta qiziqarli mavzu rejasini ber.', icon: '📝' },
    { title: 'Personal Brand', prompt: 'Senior Dasturchi sifatida LinkedIn va Twitter (X) da o\'z brendimni yaratish uchun haftalik kontent-plan tuzib ber.', icon: '👨‍💻' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(
        `Siz dasturchilar va texnik asoschilar (Indie Hackers) uchun marketing mutaxassisiz. Sizning vazifangiz - kod yozadigan insonlarga o'z mahsulotlarini sotishga, o'z brendini yaratishga va texnik auditoriya bilan muloqot qilishga yordam berish. Savol: ${textToSend}`, 
        messages, 
        true
      );
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        type: 'text',
        sources: response.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Xatolik yuz berdi. Iltimos, API kalitingizni yoki ulanishni tekshiring.",
        timestamp: Date.now(),
        type: 'error'
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1d]">
      {/* Header */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 border-b border-indigo-500/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-mono font-bold text-indigo-400 flex items-center gap-3">
              <span className="bg-indigo-500/10 p-2 rounded-lg">&lt;DevMarketing /&gt;</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-2">Dasturchilar uchun o'sish strategiyalari</p>
          </div>
          <div className="hidden sm:block">
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Technical Marketing Active</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-6">
               <div className="inline-flex p-6 bg-indigo-500/5 rounded-3xl text-indigo-400 mb-2 border border-indigo-500/10">
                 <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                 </svg>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Kodingizni butun dunyoga ko'rsating</h1>
               <p className="text-slate-400 max-w-2xl mx-auto font-mono text-sm leading-relaxed">
                 Siz kod yozasiz, biz uni sotishda yordam beramiz. Product Hunt-dan GitHub-gacha bo'lgan yo'lda dasturchilar uchun marketing markazi.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  className="flex items-start gap-5 p-6 bg-slate-900/30 border border-slate-800 rounded-2xl hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">{p.icon}</span>
                  </div>
                  <span className="text-3xl bg-slate-800 w-14 h-14 flex items-center justify-center rounded-xl shrink-0 border border-slate-700">{p.icon}</span>
                  <div className="relative z-10">
                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors mb-1">{p.title}</h3>
                    <p className="text-[11px] text-slate-500 font-mono leading-tight">{p.prompt.substring(0, 60)}...</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-6 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                  : 'bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-sm'
              }`}>
                <div className="text-sm md:text-[15px] leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-3">Tahlil va Trendlar:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" className="text-[10px] font-mono bg-slate-800/50 text-indigo-400 px-3 py-2 rounded-lg border border-slate-700 hover:bg-indigo-500/10 transition-all">{s.title}</a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between opacity-30 text-[9px] font-mono font-bold uppercase tracking-widest">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{msg.role === 'assistant' ? 'DevMarketing AI' : 'Developer'}</span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Analysing strategy...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Loyiha nomi yoki marketing bo'yicha savolingiz..."
                className="w-full bg-[#0d1324] border border-slate-800 rounded-2xl px-6 py-5 pr-24 focus:outline-none focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 font-mono text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2.5 top-2.5 bottom-2.5 px-6 rounded-xl font-mono font-bold text-xs transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg active:scale-95' 
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isLoading ? '...' : 'RUN_PROMPT'}
              </button>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-center text-slate-600 font-mono">
            Tavsiya: "Meni LinkedIn-da senior dasturchi sifatida qanday brend qilish mumkin?" deb so'rang.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingAssistant;
