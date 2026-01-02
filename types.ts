
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'video' | 'error';
  imageUrl?: string;
  videoUrl?: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export enum AppMode {
  Chat = 'CHAT',
  Voice = 'VOICE',
  ImageGen = 'IMAGE_GEN',
  Cinema = 'CINEMA',
  Studio = 'STUDIO',
  VisualDict = 'VISUAL_DICT'
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
}
