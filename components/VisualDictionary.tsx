
import React, { useState } from 'react';
import { generateImage, getGeminiClient } from '../services/gemini';
import { UZLogo } from './Layout';

interface VisualCard {
  word: string;
  imageUrl: string;
  isLoading: boolean;
}

const VisualDictionary: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cards, setCards] = useState<VisualCard[]>([]);

  const analyzeAndGenerate = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setCards([]);

    try {
      const ai = getGeminiClient();
      const prompt = `Extract 3-5 key visualizable keywords from the following phrase and return ONLY in JSON format: { "keywords": ["word1", "word2", ...] }. Phrase: "${input}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{"keywords": []}');
      const keywords: string[] = data.keywords;

      const initialCards = keywords.map(w => ({ word: w, imageUrl: '', isLoading: true }));
      setCards(initialCards);

      keywords.forEach(async (word, index) => {
        try {
          const imgUrl = await generateImage(word);
          setCards(prev => {
            const newCards = [...prev];
            newCards[index] = { ...newCards[index], imageUrl: imgUrl, isLoading: false };
            return newCards;
          });
        } catch (e) {
          console.error(e);
          setCards(prev => {
            const newCards = [...prev];
            newCards[index] = { ...newCards[index], isLoading: false };
            return newCards;
          });
        }
      });

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} p-6 md:p-12 overflow-y-auto`}>
      <div className="max-w-6xl mx-auto w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-600/10 rounded-full animate-pulse">
               <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
            </div>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Visual Dictionary</h2>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Every word is a separate world</p>
        </header>

        <div className={`max-w-3xl mx-auto rounded-[3rem] p-8 border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 shadow-2xl shadow-indigo-500/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
           <div className="flex flex-col gap-6">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeAndGenerate()}
                placeholder="Enter a sentence or phrase... (e.g. A tree by a sunny river)"
                className={`w-full px-8 py-6 rounded-[2rem] text-lg font-medium focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-100 border-slate-200 focus:border-indigo-400'}`}
              />
              <button 
                onClick={analyzeAndGenerate}
                disabled={!input.trim() || isAnalyzing}
                className={`py-6 rounded-[2rem] font-black text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4 ${
                  input.trim() && !isAnalyzing 
                    ? 'bg-indigo-600 text-white shadow-xl hover:scale-[1.02] active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <span>CONVERT TO IMAGES</span>
                )}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {cards.map((card, idx) => (
             <div 
               key={idx} 
               className={`group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-700 animate-fadeIn ${
                 isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
               } hover:scale-[1.05] hover:-rotate-1`}
             >
                {card.isLoading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generating...</p>
                   </div>
                ) : card.imageUrl ? (
                   <>
                      <img src={card.imageUrl} alt={card.word} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                         <h3 className="text-white text-3xl font-black tracking-tighter uppercase italic">{card.word}</h3>
                         <div className="h-1 w-12 bg-indigo-500 mt-2 rounded-full transition-all group-hover:w-full"></div>
                      </div>
                   </>
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-slate-500 p-8 text-center text-xs font-bold uppercase tracking-widest">
                      Image failed
                   </div>
                )}
             </div>
           ))}
        </div>

        {cards.length === 0 && !isAnalyzing && (
          <div className="text-center py-20 opacity-20">
             <UZLogo className="w-32 h-32 mx-auto grayscale" isDarkMode={isDarkMode} />
             <p className="mt-8 font-black uppercase tracking-[0.5em] text-sm">Your words will come to life here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualDictionary;
