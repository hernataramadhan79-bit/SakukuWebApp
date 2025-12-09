import React, { useState } from 'react';
import { Transaction } from '../types';
import { generateSpendingInsight } from '../services/gemini';
import { Sparkles, BrainCircuit, Lightbulb, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightsProps {
  transactions: Transaction[];
}

export const AIInsightsView: React.FC<InsightsProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateSpendingInsight(transactions);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-6 pb-32 px-4 sm:px-6">
      <div className="min-h-full flex flex-col max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Asisten AI <Sparkles className="text-yellow-400 fill-yellow-400 animate-pulse" size={18} />
          </h1>
          <p className="text-white/50 text-xs sm:text-sm">Ditenagai oleh Gemini 2.5 Flash</p>
        </header>

        {/* Hero Card */}
        {!insight && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)] animate-pulse">
              <BrainCircuit size={28} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Buka Wawasan Finansial</h2>
            <p className="text-white/60 mb-6 sm:mb-8 max-w-xs leading-relaxed text-sm sm:text-base">
              Biarkan AI menganalisis pola transaksi Anda untuk menemukan peluang berhemat yang cerdas.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-black font-bold text-base sm:text-lg liquid-hover shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center gap-2"
            >
              Analisis Keuanganku
              <ChevronRight size={16} className="sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
            <p className="text-white/60 animate-pulse text-sm sm:text-base text-center">Sedang berkonsultasi dengan oracle digital...</p>
          </div>
        )}

        {/* Results */}
        {insight && !loading && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/20 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              {/* Decorative shine */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-yellow-400/20 rounded-xl">
                  <Lightbulb className="text-yellow-400" size={18} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Wawasan AI</h3>
              </div>

              <div className="prose prose-invert prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-cyan-300 prose-sm sm:prose-base">
                <ReactMarkdown>{insight}</ReactMarkdown>
              </div>
            </div>

            <button
              onClick={() => setInsight(null)}
              className="w-full py-3 sm:py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 liquid-hover transition-colors"
            >
              Hapus Analisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};