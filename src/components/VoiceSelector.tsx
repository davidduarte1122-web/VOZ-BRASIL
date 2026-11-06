import React, { useState } from 'react';
import { Volume2, Check, User, Sparkles } from 'lucide-react';
import { VOICES } from '../data/voices';
import { VoiceProfile } from '../types';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
}) => {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handlePreview = (e: React.MouseEvent, voice: VoiceProfile) => {
    e.stopPropagation();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingPreview === voice.id) {
        setPlayingPreview(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(voice.previewSentence);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;

      // Try to find a matching pt-BR voice by gender if possible
      const voices = window.speechSynthesis.getVoices();
      const ptVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('pt') || v.lang.toLowerCase().includes('br')
      );
      if (ptVoices.length > 0) {
        utterance.voice = ptVoices[0];
      }

      utterance.onend = () => setPlayingPreview(null);
      utterance.onerror = () => setPlayingPreview(null);

      setPlayingPreview(voice.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Vozes de Estúdio em Português BR</span>
        </label>
        <span className="text-xs text-slate-400">
          5 perfis vocais neurais otimizados
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPreviewing = playingPreview === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`group relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header card info */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      voice.gender === 'Feminino'
                        ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                        : 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                    }`}
                  >
                    {voice.gender}
                  </span>

                  <span className="text-[10px] text-emerald-400 font-medium">
                    {voice.badge}
                  </span>
                </div>

                {/* Voice name */}
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-1">
                  <span>{voice.name}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {voice.description}
                </p>
              </div>

              {/* Best for and preview */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                <span className="text-[11px] text-slate-500 truncate" title={voice.bestFor}>
                  {voice.bestFor.split(',')[0]}
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePreview(e, voice)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    isPreviewing
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Ouvir demonstração rápida"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPreviewing ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
