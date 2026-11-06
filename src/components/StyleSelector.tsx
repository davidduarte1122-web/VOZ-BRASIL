import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  MessageCircle,
  Megaphone,
  Radio,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VOICE_STYLES } from '../data/voices';

interface StyleSelectorProps {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
  customStyle: string;
  onCustomStyleChange: (text: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  customStyle,
  onCustomStyleChange,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle':
        return <MessageCircle className="w-3.5 h-3.5" />;
      case 'Megaphone':
        return <Megaphone className="w-3.5 h-3.5" />;
      case 'Radio':
        return <Radio className="w-3.5 h-3.5" />;
      case 'BookOpen':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>Estilo e Entonação Vocal</span>
        </label>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>{showCustomInput ? 'Ocultar Personalizado' : 'Personalizar Tom'}</span>
          {showCustomInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Style Chips */}
      <div className="flex flex-wrap gap-2">
        {VOICE_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id && !customStyle;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                onSelectStyle(style.id);
                if (customStyle) onCustomStyleChange('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={style.description}
            >
              <span className={isSelected ? 'text-amber-200' : 'text-slate-400'}>
                {getIcon(style.icon)}
              </span>
              <span>{style.name}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Accordion */}
      {showCustomInput && (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-900/40 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Direção de Voz Customizada (Prompt para IA):
            </span>
            {customStyle && (
              <button
                type="button"
                onClick={() => onCustomStyleChange('')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>
          <input
            type="text"
            value={customStyle}
            onChange={(e) => onCustomStyleChange(e.target.value)}
            placeholder="Ex: Locutor esportivo muito enérgico de rádio AM gritando gol..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-400">
            Dica: Você pode descrever o sotaque, a idade, a emoção (ex: triste, empolgado, sussurrado) ou o ambiente.
          </p>
        </div>
      )}
    </div>
  );
};
