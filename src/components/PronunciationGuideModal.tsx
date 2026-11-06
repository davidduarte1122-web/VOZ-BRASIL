import React from 'react';
import { X, BookOpen, CheckCircle2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface PronunciationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PronunciationGuideModal: React.FC<PronunciationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Guia de Pronúncia em Português do Brasil (PT-BR)
              </h3>
              <p className="text-xs text-slate-400">
                Dicas práticas para obter uma locução fluida e 100% profissional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Tip 1: Pauses and breathing */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              1. Pausas, Vírgulas e Respiração
            </h4>
            <p>
              O modelo neural interpreta a pontuação como ritmo de respiração. Use vírgulas para pequenas pausas e pontos finais para conclusões de ideia.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
              <span className="text-emerald-400">Exemplo:</span> &quot;Hoje, após muitos estudos... chegamos a uma grande descoberta.&quot;
            </div>
          </div>

          {/* Tip 2: Acronyms and Abbreviations */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              2. Siglas e Abreviações
            </h4>
            <p>
              Para siglas que devem ser soletradas, coloque pontos ou hífens entre as letras. Para siglas que são lidas como palavras normais, escreva normalmente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <strong className="text-emerald-400">Soletradas:</strong> C.P.F., R.G., E.U.A., O.N.U.
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <strong className="text-emerald-400">Faladas como palavra:</strong> Pix, SUS, Petrobras, IBGE
              </div>
            </div>
          </div>

          {/* Tip 3: Numbers and Currency */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              3. Números, Valores e Datas
            </h4>
            <p>
              Recomendamos escrever valores monetários e números por extenso, ou utilizar o botão{' '}
              <strong className="text-emerald-400">&quot;Números por Extenso&quot;</strong> na barra de ferramentas.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
              <span className="text-amber-400">Em vez de:</span> &quot;R$ 150,00 em 10x&quot;<br />
              <span className="text-emerald-400">Prefira:</span> &quot;cento e cinquenta reais em dez vezes&quot;
            </div>
          </div>

          {/* Tip 4: Foreign Words and Tech terms */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              4. Palavras Estrangeiras
            </h4>
            <p>
              Para palavras em inglês muito técnicas, você pode escrever a pronúncia fonética aportuguesada para garantir precisão exata:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
              &quot;Design&quot; → &quot;Desain&quot; &bull; &quot;Feedback&quot; → &quot;Fidibéc&quot; &bull; &quot;Download&quot; → &quot;Daunlod&quot;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-colors"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
