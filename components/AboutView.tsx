import React from 'react';
import { ArrowLeft, Code, Palette, Wallet, ExternalLink } from 'lucide-react';
import { LanguageCode, ThemeMode } from '../types';
import { t } from '../utils/i18n';

interface AboutProps {
  language: LanguageCode;
  theme: ThemeMode;
  onBack: () => void;
}

export const AboutView: React.FC<AboutProps> = ({ language, theme, onBack }) => {
  const isLight = theme === 'light';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-6 pb-32 px-4 sm:px-6">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header with Back Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>
            {t('aboutApp', language)}
          </h1>
        </div>

        {/* App Info Card */}
        <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-6 sm:p-8 relative overflow-hidden ${
          isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
        }`}>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden relative ${
                  isLight
                    ? 'bg-gradient-to-br from-white to-cyan-50 shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-[#18181b] to-black border border-white/10 shadow-cyan-500/20'
                }`}>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer"></div>

                  <Wallet
                   size={40}
                   strokeWidth={1.5}
                   className={`relative z-10 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`}
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                Sakuku
              </h2>
              <p className={`text-lg ${isLight ? 'text-black/60' : 'text-white/60'}`}>
                v1.0
              </p>
            </div>
            <p className={`text-base leading-relaxed max-w-2xl mx-auto ${isLight ? 'text-black/70' : 'text-white/70'}`}>
              {t('appDescription', language)}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-6 sm:p-8 ${
          isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
        }`}>
          <h3 className={`text-xl font-bold mb-6 text-center ${isLight ? 'text-black' : 'text-white'}`}>
            {t('features', language)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                <Code size={20} />
              </div>
              <h4 className={`font-semibold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                {t('expenseTracking', language)}
              </h4>
              <p className={`text-sm ${isLight ? 'text-black/60' : 'text-white/60'}`}>
                {t('expenseTrackingDesc', language)}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                <Palette size={20} />
              </div>
              <h4 className={`font-semibold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                {t('analytics', language)}
              </h4>
              <p className={`text-sm ${isLight ? 'text-black/60' : 'text-white/60'}`}>
                {t('analyticsDesc', language)}
              </p>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className={`rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl border shadow-xl p-6 sm:p-8 ${
          isLight ? 'bg-white/60 border-black/5 shadow-black/5' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
        }`}>
          <h3 className={`text-xl font-bold mb-4 text-center ${isLight ? 'text-black' : 'text-white'}`}>
            {t('developer', language)}
          </h3>
          <div className="text-center space-y-3">
            <div>
              <h4 className={`text-lg font-semibold ${isLight ? 'text-black' : 'text-white'}`}>HRNT</h4>
              <p className={`text-sm ${isLight ? 'text-black/70' : 'text-white/70'}`}>
                {t('fullStackDeveloper', language)}
              </p>
            </div>
            <a
              href="https://hernataportfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all liquid-button ${
                isLight
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
              }`}
            >
              <ExternalLink size={14} />
              {t('viewPortfolio', language)}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};