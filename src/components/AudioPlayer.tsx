import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Sliders,
  Check,
  Radio,
  Sparkles,
} from 'lucide-react';
import { GeneratedAudio } from '../types';
import { downloadAudioFile, formatTime } from '../utils/audioUtils';

interface AudioPlayerProps {
  currentAudio: GeneratedAudio | null;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentAudio,
  isPlaying,
  onPlayToggle,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioEffect, setAudioEffect] = useState<'none' | 'bass' | 'radio'>('none');
  const [copied, setCopied] = useState(false);

  // Web Audio Context for real-time sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    if (!currentAudio) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentAudio.audioUrl;
    audio.load();
    setCurrentTime(0);

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      onPlayToggle();
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentAudio]);

  // Handle Play/Pause changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn('Playback prevented:', e);
      });
      // Setup Web Audio nodes if not already set
      setupWebAudio();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Volume & Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Web Audio filter setup
  const setupWebAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      const filter = ctx.createBiquadFilter();
      filterNodeRef.current = filter;

      applyFilter(audioEffect);
      source.connect(filter);
      filter.connect(ctx.destination);
    } catch {
      // Audio element fallback
    }
  };

  const applyFilter = (effect: 'none' | 'bass' | 'radio') => {
    setAudioEffect(effect);
    const filter = filterNodeRef.current;
    if (!filter) return;

    if (effect === 'none') {
      filter.type = 'allpass';
    } else if (effect === 'bass') {
      filter.type = 'lowshelf';
      filter.frequency.value = 250;
      filter.gain.value = 8;
    } else if (effect === 'radio') {
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 2.5;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownload = () => {
    if (!currentAudio) return;
    const voiceClean = currentAudio.voice.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `vozbrasil_${voiceClean}_${Date.now()}.wav`;
    downloadAudioFile(currentAudio.blob || currentAudio.audioUrl, filename);
  };

  if (!currentAudio) {
    return (
      <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">Nenhum áudio gerado ainda</p>
        <p className="text-xs text-slate-500 mt-1">
          Digite seu texto acima e clique em &quot;Gerar Áudio em Português BR&quot; para ouvir aqui
        </p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-emerald-900/40 p-5 space-y-4 backdrop-blur-md shadow-xl shadow-black/40">
      <audio ref={audioRef} />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-white">
            Voz: <strong className="text-emerald-400 font-bold">{currentAudio.voice}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400 font-medium">Estilo: {currentAudio.style}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Effect Badges */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-500 px-1 font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Efeito:
            </span>
            <button
              type="button"
              onClick={() => applyFilter('none')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                audioEffect === 'none'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Puro
            </button>
            <button
              type="button"
              onClick={() => applyFilter('bass')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                audioEffect === 'bass'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Graves
            </button>
            <button
              type="button"
              onClick={() => applyFilter('radio')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                audioEffect === 'radio'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3 inline mr-0.5" />
              Rádio
            </button>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors shadow-md shadow-emerald-900/30"
            title="Baixar arquivo de áudio WAV para o seu computador"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .WAV</span>
          </button>
        </div>
      </div>

      {/* Visualizer bars */}
      <div className="flex items-end justify-center gap-1 h-14 bg-slate-950/80 rounded-xl px-4 py-2 border border-slate-800/80 overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => {
          // Dynamic height calculation
          const seed = Math.sin(i * 0.45) * 0.5 + 0.5;
          const isActive = isPlaying;
          const height = isActive
            ? Math.max(15, Math.floor(seed * 95 + Math.random() * 20))
            : Math.max(10, Math.floor(seed * 30));

          return (
            <div
              key={i}
              style={{
                height: `${height}%`,
                transition: 'height 0.15s ease',
              }}
              className={`w-1.5 rounded-full ${
                isActive
                  ? i % 3 === 0
                    ? 'bg-gradient-to-t from-emerald-600 to-amber-300'
                    : 'bg-gradient-to-t from-emerald-500 to-teal-300'
                  : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* Progress slider */}
      <div className="space-y-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback rate */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 font-medium">Velocidade:</span>
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setPlaybackRate(rate)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                playbackRate === rate
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center transport buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Voltar 5 segundos"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPlayToggle}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Avançar 5 segundos"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};
