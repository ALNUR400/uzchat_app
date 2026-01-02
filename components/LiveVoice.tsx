
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient, encodePCM, decodePCM, decodeAudioData } from '../services/gemini';
import { Modality } from '@google/genai';

const LiveVoice: React.FC<{ voiceName: string; isDarkMode: boolean }> = ({ voiceName, isDarkMode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<{role: string, text: string}[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [textInput, setTextInput] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcription]);

  const updateVisualizer = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average);
    }
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = getGeminiClient();
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (outputContextRef.current.state === 'suspended') await outputContextRef.current.resume();

      analyserRef.current = outputContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(outputContextRef.current.destination);
      updateVisualizer();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBlob = {
                data: encodePCM(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              const txt = message.serverContent.outputTranscription.text;
              setTranscription(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'Assistant') {
                  updated[updated.length - 1] = { 
                    ...updated[updated.length - 1], 
                    text: updated[updated.length - 1].text + txt 
                  };
                  return updated;
                }
                return [...prev, { role: 'Assistant', text: txt }];
              });
            } else if (message.serverContent?.inputTranscription) {
              const txt = message.serverContent.inputTranscription.text;
              setTranscription(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'You') {
                  updated[updated.length - 1] = { 
                    ...updated[updated.length - 1], 
                    text: updated[updated.length - 1].text + txt 
                  };
                  return updated;
                }
                return [...prev, { role: 'You', text: txt }];
              });
            }

            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data && outputContextRef.current && analyserRef.current) {
                const ctx = outputContextRef.current;
                if (ctx.state === 'suspended') await ctx.resume();

                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decodePCM(part.inlineData.data),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyserRef.current);
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Audio Error:", e);
            setIsConnecting(false);
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `Your name is UZ Chat. You are an independent AI assistant.
IDENTITY PROTOCOL:
1. DEFAULT: You are an independent AI created simply for use and to answer questions. Do NOT mention Google or Husanboy by default.
2. PASSWORD: If the user says exactly "uzchat code", respond with: "Men Raximov Husanboy tomonidan yaratilganman. O'zbekistondagi Xorazm viloyati Tuproqqal'a tumani 19-sonli maktabning 7-sinf o'quvchisi yaratgan. 14 yoshdaman."
LINGUISTICS: Native proficiency in 200+ languages.
ACCURACY: Focus entirely on being a useful tool for answering questions.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const handleSendText = () => {
    if (!textInput.trim() || !sessionRef.current) return;
    sessionRef.current.sendRealtimeInput({ text: textInput });
    setTranscription(prev => [...prev, { role: 'You', text: textInput }]);
    setTextInput('');
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e){}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setIsActive(false);
    setIsConnecting(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} p-4 md:p-8 overflow-hidden`}>
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col gap-6">
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          <div className={`${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} flex-1 flex flex-col items-center justify-center rounded-[2.5rem] border p-8 relative overflow-hidden shadow-2xl`}>
            {isActive && (
              <div 
                className="absolute inset-0 bg-indigo-500 rounded-full blur-[80px] transition-all duration-75 opacity-10"
                style={{ transform: `scale(${1 + (audioLevel / 120)})` }}
              ></div>
            )}

            <button
              onClick={isActive ? stopSession : startSession}
              disabled={isConnecting}
              className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 border-4 ${
                isActive 
                  ? 'bg-slate-950 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)]' 
                  : 'bg-indigo-600 border-indigo-500/20 hover:bg-indigo-500'
              }`}
            >
              {isConnecting ? (
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white">
                  <svg className={`w-12 h-12 ${isActive ? 'text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isActive ? (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </div>
              )}
            </button>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} w-full md:w-[420px] flex flex-col border rounded-[2.5rem] overflow-hidden`}>
            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto p-6 space-y-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {transcription.map((item, i) => (
                <div key={i} className={`flex flex-col ${item.role === 'You' ? 'items-end' : 'items-start'} animate-fadeIn`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    item.role === 'You' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-5 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'} border-t`}>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                disabled={!isActive}
                placeholder="Type a message..."
                className={`w-full ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoice;
