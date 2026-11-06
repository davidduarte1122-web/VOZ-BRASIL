import React from 'react';
import { Volume2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { TTSEngine } from '../types';

interface HeaderProps {
  engine: TTSEngine;
  setEngine: (engine: TTSEngine) => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ engine, setEngine, onOpenGuide }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                VozBrasil <span className="text-emerald-400 font-extrabold">AI</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                PT-BR 🇧🇷
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Estúdio de Conversão de Texto em Áudio com Vozes Neurais
            </p>
          </div>
        </div>

        {/* Engine switcher & Help */}
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setEngine('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                engine === 'gemini'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vozes de Estúdio Gemini 3.8 Flash Lite TTS com alta fidelidade e download WAV"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Estúdio IA</span>
            </button>
            <button
              onClick={() => setEngine('webspeech')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                engine === 'webspeech'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vozes locais instaladas no seu navegador com reprodução instantânea"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Voz do Navegador</span>
            </button>
          </div>

          {/* Pronunciation guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Dicas de Pronúncia</span>
          </button>
        </div>
      </div>
    </header>
  );
};
