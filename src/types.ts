export type TTSEngine = 'gemini' | 'webspeech';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'Feminino' | 'Masculino';
  description: string;
  bestFor: string;
  previewSentence: string;
  color: string;
  badge: string;
}

export interface VoiceStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  voice: string;
  style: string;
  audioUrl: string;
  blob?: Blob;
  duration?: number;
  createdAt: number;
  engine: TTSEngine;
  characterCount: number;
  isFavorite?: boolean;
}

export interface AudioEffect {
  id: 'none' | 'bass' | 'radio' | 'reverb';
  name: string;
  description: string;
}
