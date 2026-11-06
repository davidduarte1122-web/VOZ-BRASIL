import React from 'react';
import {
  History,
  Play,
  Pause,
  Download,
  Trash2,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GeneratedAudio } from '../types';
import { downloadAudioFile } from '../utils/audioUtils';

interface AudioHistoryProps {
  history: GeneratedAudio[];
  currentAudioId: string | null;
  isPlaying: boolean;
  onSelectAudio: (audio: GeneratedAudio) => void;
  onTogglePlay: (audio: GeneratedAudio) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteAudio: (id: string) => void;
  onClearHistory: () => void;
}

export const AudioHistory: React.FC<AudioHistoryProps> = ({
  history,
  currentAudioId,
  isPlaying,
  onSelectAudio,
  onTogglePlay,
  onToggleFavorite,
  onDeleteAudio,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Auditeca & Histórico</h3>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
            {history.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar histórico</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isCurrent = currentAudioId === item.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const formattedDate = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectAudio(item)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                isCurrent
                  ? 'bg-slate-800/90 border-emerald-500/80 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Play toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay(item);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
                  isCurrentPlaying
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 group-hover:bg-emerald-600 text-white group-hover:text-slate-950'
                }`}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Text & Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 line-clamp-1 font-medium group-hover:text-white">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400">{item.voice}</span>
                  <span>•</span>
                  <span>{item.style}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span>{item.characterCount} letras</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.isFavorite
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={item.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadAudioFile(item.blob || item.audioUrl, `audio_${item.voice}_${item.id}.wav`);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  title="Baixar áudio .WAV"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAudio(item.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Excluir do histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
