import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { LanguageCode, ThemeMode } from '../types';
import { t } from '../utils/i18n';

interface InstallPromptProps {
  language: LanguageCode;
  theme: ThemeMode;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ language, theme }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode || isInWebAppiOS);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      // Don't show if already installed or dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const now = Date.now();

      if (dismissed && (now - parseInt(dismissed)) < 24 * 60 * 60 * 1000) { // 24 hours
        return;
      }

      if (!isStandaloneMode && !isInWebAppiOS) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Auto-show after 30 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!isStandaloneMode && !isInWebAppiOS) {
        handleInstallAvailable();
      }
    }, 30000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = () => {
    if ((window as any).installPWA) {
      (window as any).installPWA();
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleIOSInstall = () => {
    setShowPrompt(false);
    // iOS doesn't support programmatic install, just hide the prompt
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-liquid-float">
      <div className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 ${
        isLight
          ? 'bg-white/95 border-black/10 shadow-black/20'
          : 'bg-black/90 border-white/10 shadow-black/50'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLight ? 'bg-indigo-100' : 'bg-indigo-500/20'
          }`}>
            <Download size={24} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm mb-1 ${isLight ? 'text-black' : 'text-white'}`}>
              {t('installApp', language)}
            </h3>
            <p className={`text-xs mb-3 ${isLight ? 'text-black/70' : 'text-white/70'}`}>
              {isIOS
                ? t('installAppDescIOS', language)
                : t('installAppDesc', language)
              }
            </p>

            <div className="flex gap-2">
              <button
                onClick={isIOS ? handleIOSInstall : handleInstall}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all liquid-button ${
                  isLight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {isIOS ? t('shareInstall', language) : t('install', language)}
              </button>
              <button
                onClick={handleDismiss}
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
            onClick={handleDismiss}
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