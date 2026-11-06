import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Loader2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  CheckCircle,
  Headphones,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { TextEditor } from './components/TextEditor';
import { AudioPlayer } from './components/AudioPlayer';
import { AudioHistory } from './components/AudioHistory';
import { PronunciationGuideModal } from './components/PronunciationGuideModal';
import { GeneratedAudio, TTSEngine } from './types';
import { generateStudioTTS } from './services/ttsService';
import { SAMPLE_TEXTS } from './data/voices';

export default function App() {
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<string>('Natural');
  const [customStyle, setCustomStyle] = useState<string>('');
  const [engine, setEngine] = useState<TTSEngine>('gemini');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentAudio, setCurrentAudio] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vozbrasil_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: GeneratedAudio[]) => {
    setHistory(newHistory);
    try {
      // Don't save large blob objects into localStorage, only metadata and lightweight items
      const serialized = newHistory.slice(0, 15).map(({ blob, ...rest }) => rest);
      localStorage.setItem('vozbrasil_history', JSON.stringify(serialized));
    } catch (e) {
      console.warn('Could not save history to localStorage:', e);
    }
  };

  // Main Audio Generation trigger
  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setErrorMessage('Por favor, digite ou cole um texto antes de gerar o áudio.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    if (engine === 'webspeech') {
      // Fallback: Browser Web Speech API
      if (!('speechSynthesis' in window)) {
        setErrorMessage('Seu navegador não suporta síntese de voz nativa.');
        setIsLoading(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (v) => v.lang.toLowerCase().includes('pt') || v.lang.toLowerCase().includes('br')
      );
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = (e) => {
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMessage(`Erro no leitor do navegador: ${e.error}`);
      };

      window.speechSynthesis.speak(utterance);
      return;
    }

    // Engine: Gemini 3.8 Flash Lite TTS Studio Audio
    try {
      const result = await generateStudioTTS({
        text: text.trim(),
        voice: selectedVoice,
        style: selectedStyle,
        customStyle: customStyle.trim() || undefined,
      });

      const newAudioItem: GeneratedAudio = {
        id: `aud_${Date.now()}`,
        text: text.trim(),
        voice: selectedVoice,
        style: customStyle.trim() ? 'Personalizado' : selectedStyle,
        audioUrl: result.audioUrl,
        blob: result.blob,
        createdAt: Date.now(),
        engine: 'gemini',
        characterCount: text.length,
      };

      setCurrentAudio(newAudioItem);
      setIsPlaying(true);
      saveHistory([newAudioItem, ...history]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          'Falha ao conectar com o estúdio de áudio Gemini. Verifique a chave de API ou tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayToggle = () => {
    if (engine === 'webspeech' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        if (isPlaying) {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        } else {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        }
        return;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSelectHistoryItem = (item: GeneratedAudio) => {
    setCurrentAudio(item);
    setIsPlaying(true);
  };

  const handleToggleHistoryPlay = (item: GeneratedAudio) => {
    if (currentAudio?.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(item);
      setIsPlaying(true);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(updated);
  };

  const handleDeleteAudio = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
      setIsPlaying(false);
    }
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico de áudios desta sessão?')) {
      setHistory([]);
      localStorage.removeItem('vozbrasil_history');
    }
  };

  // Keyboard shortcut: Ctrl + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, selectedVoice, selectedStyle, customStyle, engine]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        engine={engine}
        setEngine={setEngine}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 flex items-start gap-3 shadow-lg animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-rose-100 mb-0.5">Aviso do Estúdio</p>
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-300 hover:text-white font-bold px-2 py-1"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Top Hero / Intro Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/50 border border-emerald-900/40 p-5 sm:p-6 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Text-to-Speech Neural em Português Brasileiro</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Transforme qualquer texto em áudio realista com IA
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
                Produza locuções para vídeos, podcasts, anúncios, audiolivros e apresentações com pronúncia brasileira impecável e download em arquivo WAV 24kHz.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3">
              <div className="text-center border-r border-slate-800 pr-3">
                <div className="font-bold text-emerald-400 text-sm">24 kHz</div>
                <div className="text-[10px] text-slate-500">Qualidade WAV</div>
              </div>
              <div className="text-center border-r border-slate-800 pr-3">
                <div className="font-bold text-amber-400 text-sm">5 Vozes</div>
                <div className="text-[10px] text-slate-500">Fem & Masc</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-teal-400 text-sm">100% PT-BR</div>
                <div className="text-[10px] text-slate-500">Sotaque Nativo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Selector Section */}
        <section>
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
          />
        </section>

        {/* Style Selector Section */}
        <section>
          <StyleSelector
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            customStyle={customStyle}
            onCustomStyleChange={setCustomStyle}
          />
        </section>

        {/* Text Input Section */}
        <section>
          <TextEditor
            text={text}
            setText={setText}
            onSelectVoice={setSelectedVoice}
            onSelectStyle={setSelectedStyle}
            isLoading={isLoading}
          />
        </section>

        {/* Big Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 sticky bottom-4 z-20 backdrop-blur-md shadow-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Voz selecionada: <strong className="text-white">{selectedVoice}</strong> ({selectedStyle})
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-500">
              Dica: Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">Ctrl + Enter</kbd> para gerar
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerateAudio}
            disabled={isLoading || !text.trim()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 hover:from-emerald-400 hover:to-amber-200 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando Locução com IA...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>Gerar Áudio em Português BR</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Player Section */}
        <section className="pt-2">
          <AudioPlayer
            currentAudio={currentAudio}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
          />
        </section>

        {/* History / Audio Library */}
        <section>
          <AudioHistory
            history={history}
            currentAudioId={currentAudio?.id || null}
            isPlaying={isPlaying}
            onSelectAudio={handleSelectHistoryItem}
            onTogglePlay={handleToggleHistoryPlay}
            onToggleFavorite={handleToggleFavorite}
            onDeleteAudio={handleDeleteAudio}
            onClearHistory={handleClearHistory}
          />
        </section>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-900 text-xs text-slate-400">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Pronúncia Brasileira Fiel</h4>
              <p className="leading-relaxed">
                Entonação adaptada às nuances, acentos e cadências do português do Brasil para máxima naturalidade.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Efeitos de Estúdio</h4>
              <p className="leading-relaxed">
                Aplique filtros em tempo real como reforço de graves (Bass Boost) ou simulador de rádio vintage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Download WAV Ilimitado</h4>
              <p className="leading-relaxed">
                Baixe o arquivo de áudio de alta fidelidade sem compressão e use em seus vídeos, podcasts ou apresentações.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>🇧🇷 VozBrasil AI</span>
            <span>•</span>
            <span>Desenvolvido para locução em Português do Brasil</span>
          </p>
          <p className="text-slate-600">
            Powered by Google Gemini 3.8 Flash Lite TTS • 24kHz Mono WAV
          </p>
        </div>
      </footer>

      {/* Pronunciation Guide Modal */}
      <PronunciationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
