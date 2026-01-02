
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/gemini';
import { UZLogo } from './Layout';

interface ChatAreaProps {
  searchEnabled: boolean;
  isDarkMode: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ searchEnabled, isDarkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(input, messages, searchEnabled);
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
        content: "Noma'lum xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        timestamp: Date.now(),
        type: 'error'
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in">
              <UZLogo className="w-24 h-24 mb-4" />
              <div className="text-center">
                <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Xush kelibsiz!</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Sizga bugun qanday yordam bera olaman? Istalgan savolingizni bering.</p>
              </div>
           </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-[1.8rem] p-5 md:p-6 transition-all ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10' 
                : 'bg-white/5 border border-white/10 text-slate-200'
            }`}>
              <div className="text-[15px] md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-indigo-400 hover:bg-white/10 transition-all truncate max-w-[180px]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2 text-[9px] font-bold opacity-30 text-right uppercase tracking-widest">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25"></div>
          <div className="relative flex items-center bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-1.5 shadow-2xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Habar yozing..."
              className="flex-1 bg-transparent border-none px-6 py-4 focus:outline-none resize-none max-h-48 text-white placeholder-slate-500 font-medium"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95' 
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
