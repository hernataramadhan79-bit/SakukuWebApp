import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { LanguageCode, ThemeMode } from '../types';
import { t } from '../utils/i18n';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
  language: LanguageCode;
  theme: ThemeMode;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onUpdate,
  onDismiss,
  language,
  theme
}) => {
  const isLight = theme === 'light';

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-liquid-float">
      <div className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 ${
        isLight
          ? 'bg-white/95 border-black/10 shadow-black/20'
          : 'bg-black/90 border-white/10 shadow-black/50'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLight ? 'bg-cyan-100' : 'bg-cyan-500/20'
          }`}>
            <RefreshCw size={20} className={isLight ? 'text-cyan-600' : 'text-cyan-400'} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm mb-1 ${isLight ? 'text-black' : 'text-white'}`}>
              {t('updateAvailable', language)}
            </h3>
            <p className={`text-xs mb-3 ${isLight ? 'text-black/70' : 'text-white/70'}`}>
              {t('updateDescription', language)}
            </p>

            <div className="flex gap-2">
              <button
                onClick={onUpdate}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all liquid-button ${
                  isLight
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'bg-cyan-500 text-white hover:bg-cyan-400'
                }`}
              >
                {t('updateNow', language)}
              </button>
              <button
                onClick={onDismiss}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isLight
                    ? 'text-black/60 hover:text-black hover:bg-black/5'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {t('later', language)}
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};