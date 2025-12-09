import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { LanguageCode } from '../types';
import { t } from '../utils/i18n';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  language: LanguageCode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 animate-backdrop">
      {/* Changed bg to black/90 for easier light mode override */}
      <div className="w-full max-w-sm bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 relative overflow-hidden ring-1 ring-white/5 animate-liquid-pop transform-gpu">
        
        {/* Decorative background element */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-6 mt-2 relative z-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-tr from-red-500/20 to-orange-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.25)] border border-red-500/20">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-[250px]">{message}</p>
        </div>

        <div className="flex gap-3 relative z-10">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/5 hover:border-white/10 active:scale-95 duration-200"
          >
            {t('cancel', language)}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-red-600/40 active:scale-95"
          >
            {t('delete', language)}
          </button>
        </div>
      </div>
    </div>
  );
};