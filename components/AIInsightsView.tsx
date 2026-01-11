import React, { useState } from 'react';
import { Transaction } from '../types';
import { generateSpendingInsight } from '../services/gemini';
import { Sparkles, BrainCircuit, Lightbulb, ChevronRight, RefreshCw, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePrivacy } from '../context/PrivacyContext';

interface InsightsProps {
  transactions: Transaction[];
}

export const AIInsightsView: React.FC<InsightsProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isPrivacyMode } = usePrivacy();

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateSpendingInsight(transactions);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-6 pb-32 px-4 sm:px-6">
      <div className="min-h-full flex flex-col max-w-3xl mx-auto">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
            Asisten Finansial AI <Sparkles className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />
          </h1>
          <p className="text-white/50 text-sm">Analisis cerdas bertenaga Gemini 2.5 Flash</p>
        </header>

        {/* Hero Card */}
        {!insight && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl animate-smooth-appear relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <BrainCircuit size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              Wawasan Keuangan Cerdas
            </p>
            <p className="text-white/60 mb-8 max-w-md leading-relaxed text-base">
              Biarkan AI menganalisis riwayat transaksi Anda untuk menemukan pola tersembunyi dan peluang penghematan.
            </p>
            
            <button
              onClick={handleGenerate}
              className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Mulai Analisis <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center animate-smooth-appear">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_30px_rgba(34,211,238,0.4)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-cyan-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Menganalisis Data...</h3>
            <p className="text-white/50 text-sm animate-pulse">Sedang mencari pola pengeluaran Anda</p>
          </div>
        )}

        {/* Results */}
        {insight && !loading && (
          <div className="animate-liquid-enter space-y-6">
            <div className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              {/* Decorative shine */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-yellow-400/20 rounded-xl">
                    <Lightbulb className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Hasil Analisis</h3>
                    <p className="text-xs text-white/50">Rekomendasi Personal</p>
                  </div>
                </div>

                <div className={`prose prose-invert prose-headings:text-cyan-300 prose-headings:font-bold prose-headings:text-lg prose-headings:mb-3 prose-headings:mt-6 prose-p:text-white/80 prose-p:leading-relaxed prose-strong:text-yellow-400 prose-li:text-white/80 prose-li:marker:text-cyan-500 max-w-none ${isPrivacyMode ? 'privacy-blur' : ''}`}>
                  <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setInsight(null)}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2"
              >
                <X size={18} />
                Tutup
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Analisis Ulang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};