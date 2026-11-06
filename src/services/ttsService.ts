import { base64ToBlob } from '../utils/audioUtils';

export interface GenerateTTSParams {
  text: string;
  voice: string;
  style: string;
  customStyle?: string;
}

export interface TTSResult {
  audioUrl: string;
  blob: Blob;
  mimeType: string;
}

/**
 * Generate high-definition studio audio in Brazilian Portuguese via backend Gemini 3.8 Flash Lite TTS
 */
export async function generateStudioTTS(params: GenerateTTSParams): Promise<TTSResult> {
  const response = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${response.status} ao gerar áudio.`);
  }

  const data = await response.json();
  if (!data.audioBase64) {
    throw new Error('Servidor não retornou dados de áudio.');
  }

  const mimeType = data.mimeType || 'audio/wav';
  const blob = base64ToBlob(data.audioBase64, mimeType);
  const audioUrl = URL.createObjectURL(blob);

  return {
    audioUrl,
    blob,
    mimeType,
  };
}

/**
 * Use Gemini 3.8 Flash to optimize the text for natural Brazilian Portuguese speech
 */
export async function optimizeTextForSpeech(
  text: string,
  type: 'punctuation' | 'numbers_to_words' | 'emotive'
): Promise<string> {
  const response = await fetch('/api/tts/optimize-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, type }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao aprimorar texto com IA.');
  }

  const data = await response.json();
  return data.optimizedText || text;
}
