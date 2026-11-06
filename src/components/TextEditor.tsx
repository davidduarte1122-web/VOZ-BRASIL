import React, { useRef, useState } from 'react';
import {
  FileText,
  Trash2,
  Clipboard,
  Sparkles,
  Upload,
  Clock,
  Type,
  FileCheck,
  Hash,
  Loader2,
  Wand2,
} from 'lucide-react';
import { SAMPLE_TEXTS } from '../data/voices';
import { estimateReadingTimeSeconds, formatTime } from '../utils/audioUtils';
import { optimizeTextForSpeech } from '../services/ttsService';

interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
  onSelectVoice?: (voiceId: string) => void;
  onSelectStyle?: (styleId: string) => void;
  isLoading: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  setText,
  onSelectVoice,
  onSelectStyle,
  isLoading,
}) => {
  const [optimizingType, setOptimizingType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = estimateReadingTimeSeconds(text);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(text ? `${text}\n${clipText}` : clipText);
      }
    } catch {
      // Fallback: focus textarea
      textareaRef.current?.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setText(content);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplySample = (sample: typeof SAMPLE_TEXTS[0]) => {
    setText(sample.text);
    if (onSelectVoice && sample.voice) {
      onSelectVoice(sample.voice);
    }
    if (onSelectStyle && sample.style) {
      onSelectStyle(sample.style);
    }
  };

  const handleOptimize = async (type: 'punctuation' | 'numbers_to_words' | 'emotive') => {
    if (!text.trim() || isLoading || optimizingType) return;
    try {
      setOptimizingType(type);
      const result = await optimizeTextForSpeech(text, type);
      setText(result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setOptimizingType(null);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 backdrop-blur-sm">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Texto para Locução</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Colar texto copiado"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Colar</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.srt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Importar arquivo de texto .txt"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar .txt</span>
          </button>

          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition-colors"
              title="Limpar texto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Samples Carousel / Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Ou escolha um modelo pronto em Português BR:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded">
                {sample.badge}
              </span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite ou cole aqui o seu texto em português do Brasil que deseja transformar em áudio... Exemplo: 'Olá, pessoal! Bem-vindos ao nosso podcast especial de hoje...'"
          rows={7}
          maxLength={5000}
          className="w-full bg-slate-950/90 text-slate-100 placeholder-slate-500 rounded-xl p-4 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm leading-relaxed resize-y transition-colors font-sans"
        />

        {optimizingType && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium z-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Otimizando texto para fala natural...</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: AI text enhancement tools and counters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        {/* AI helpers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-emerald-400" />
            Assistente de Locução:
          </span>

          <button
            type="button"
            onClick={() => handleOptimize('punctuation')}
            disabled={!text.trim() || !!optimizingType}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-colors"
            title="Insere vírgulas e pausas para melhorar a cadência da respiração"
          >
            <FileCheck className="w-3 h-3 text-emerald-400" />
            <span>Pontuar para Fala</span>
          </button>

          <button
            type="button"
            onClick={() => handleOptimize('numbers_to_words')}
            disabled={!text.trim() || !!optimizingType}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-colors"
            title="Converte R$, datas, números e símbolos em palavras por extenso"
          >
            <Hash className="w-3 h-3 text-blue-400" />
            <span>Números por Extenso</span>
          </button>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-4 text-xs text-slate-400 self-end sm:self-auto">
          <span className="flex items-center gap-1" title="Contagem de palavras">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <strong className="text-slate-300 font-semibold">{wordCount}</strong> palavras
          </span>

          <span className="flex items-center gap-1" title="Duração estimada da fala em ritmo normal">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            ~<strong className="text-emerald-400 font-semibold">{formatTime(estimatedSeconds)}</strong>
          </span>

          <span
            className={`font-mono text-xs ${
              charCount > 4500 ? 'text-amber-400 font-bold' : 'text-slate-500'
            }`}
            title="Limite de caracteres"
          >
            {charCount}/5000
          </span>
        </div>
      </div>
    </div>
  );
};
