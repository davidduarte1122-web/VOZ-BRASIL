/**
 * Converts a Base64 string to a Blob
 */
export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Downloads a Blob or Base64 as an audio file
 */
export function downloadAudioFile(blobOrUrl: Blob | string, filename = 'voz-brasil-audio.wav') {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Estimates speech duration in Brazilian Portuguese
 * Average speaking rate is roughly 130 - 150 words per minute (around 2.3 words/sec)
 */
export function estimateReadingTimeSeconds(text: string): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  // ~2.4 words per second in Portuguese
  return Math.max(1, Math.round(words / 2.4));
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if the browser supports SpeechSynthesis (Web Speech API)
 */
export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available Portuguese (pt-BR / pt) browser voices
 */
export function getBrowserPortugueseVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isWebSpeechSupported()) {
      return resolve([]);
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const ptVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('pt') || v.lang.toLowerCase().includes('br')
      );
      if (ptVoices.length > 0) {
        return resolve(ptVoices);
      }
      return resolve(voices); // fallback to all
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      checkVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        checkVoices();
      };
      // Timeout fallback
      setTimeout(checkVoices, 1000);
    }
  });
}
