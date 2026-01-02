
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse, speakText } from '../services/gemini';

const EducationHelper: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('7');
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const subjects = ['Matematika', 'Fizika', 'Ona tili', 'Ingliz tili', 'Biologiya', 'Kimyo', 'Tarix', 'Geografiya'];
  const testTypes = ['1-BSB', '2-BSB', '1-CHSB', '2-CHSB'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuickAsk = (subject: string, type: string) => {
    const prompt = `${selectedGrade}-sinf ${subject} fanidan ${type} javoblari va savollarini topib ber. Manba sifatida https://sor-soch.com saytidan foydalan.`;
    handleSend(prompt);
  };

  const handleSpeak = async (text: string, id: string) => {
    if (isSpeakingId === id) return;
    setIsSpeakingId(id);
    try {
      await speakText(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpeakingId(null);
    }
  };

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
        `Foydalanuvchi maktab o'quvchisi. Savol: ${textToSend}. Javoblarni aniq va tushunarli qilib, sor-soch.com kabi saytlardan qidirib ber.`, 
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
        content: "Ma'lumot topilmadi. Iltimos, savolni aniqroq yozing (masalan: 7-sinf fizika 1-bsb).",
        timestamp: Date.now(),
        type: 'error'
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      {/* Header with Filters */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Maktab Yordamchisi
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Sinf:</span>
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                {['7', '8', '9', '10', '11'].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedGrade === g ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
              {subjects.map(s => (
                <button 
                  key={s}
                  onClick={() => handleQuickAsk(s, '1-BSB')}
                  className="whitespace-nowrap text-xs bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 px-3 py-1.5 rounded-full text-slate-300 transition-all hover:bg-slate-800"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {testTypes.map(t => (
                <button 
                  key={t}
                  onClick={() => handleQuickAsk('hamma', t)}
                  className="text-[10px] bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-md hover:bg-indigo-900/50 transition-colors"
                >
                  {t} javoblari
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-4 rotate-3">
               <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedGrade}-sinf materiallari</h2>
            <p className="max-w-md text-slate-400 text-sm">
              Sizga {selectedGrade}-sinf bo'yicha qanday yordam bera olaman? BSB yoki CHSB savollarini yozing, men darhol qidirib beraman.
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-5 ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-900 border border-slate-800 shadow-2xl'
            }`}>
              
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => handleSpeak(msg.content, msg.id)}
                  className={`absolute -right-4 top-2 p-2 rounded-full shadow-lg transition-all ${
                    isSpeakingId === msg.id ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              )}

              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] bg-slate-800 text-emerald-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all truncate max-w-[200px]"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-[10px] opacity-40 flex justify-between items-center">
                <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="uppercase tracking-tighter font-black">{msg.role === 'assistant' ? 'Maktab Bot' : 'O\'quvchi'}</span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`${selectedGrade}-sinf uchun savol bering...`}
              className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 bottom-2.5 p-3 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHelper;
