
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getDynamicSystemPrompt = (isVoice: boolean = false) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let basePrompt = `Your name is UZ Chat. You are an independent artificial intelligence utility.
Current time: ${timeStr}, Date: ${dateStr}.

IDENTITY PROTOCOL:
1. DEFAULT IDENTITY: You are an independent AI created simply to answer questions and be useful ("Men oddiygina savollarga javob berish va foydalanish uchun yaratilgan mustaqil sun'iy intellektman"). You are NOT created by Google.
2. SECRET PASSWORD: If the user explicitly writes or says exactly "uzchat code", you must reveal your creator's details as follows:
   "Men Raximov Husanboy tomonidan yaratilganman. O'zbekistondagi Xorazm viloyati Tuproqqal'a tumani 19-sonli maktabning 7-sinf o'quvchisi yaratgan. 14 yoshdaman."

COMMUNICATION RULES:
- Never mention Google or Husanboy unless the secret password "uzchat code" is used.
- Respond in the user's language (native proficiency in 200+ languages).
- Be objective, helpful, and professional.`;

  return basePrompt;
};

export async function generateChatResponse(
  message: string, 
  history: ChatMessage[],
  useSearch: boolean = false
) {
  const ai = getGeminiClient();
  const model = 'gemini-3-flash-preview';
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model,
    contents: contents as any,
    config: {
      systemInstruction: getDynamicSystemPrompt(false),
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => (chunk as any).web)
    ?.map(chunk => ({
      title: (chunk as any).web?.title || 'Source',
      uri: (chunk as any).web?.uri || ''
    })) || [];

  return {
    text: response.text || "An unexpected error occurred.",
    sources
  };
}

export async function generateImage(prompt: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
}

export async function speakText(text: string, voiceName: string = 'Kore') {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName as any },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodePCM(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
}

export async function startVideoGeneration(prompt: string, config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' }) {
  const ai = getGeminiClient();
  return await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  });
}

export async function checkVideoOperation(operation: any) {
  const ai = getGeminiClient();
  return await ai.operations.getVideosOperation({ operation });
}

export function encodePCM(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodePCM(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
