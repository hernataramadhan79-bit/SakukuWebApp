import React, { useRef, useState } from 'react';
import { Moon, Sun, Globe, DollarSign, ChevronRight, RefreshCw, User, Camera, Upload, Info, Download, EyeOff } from 'lucide-react';
import { AppSettings, CurrencyCode, LanguageCode, ThemeMode } from '../types';
import { usePrivacy } from './PrivacyContext';
import { t } from '../utils/i18n';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
  onNavigateToAbout: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onClearAllData, onNavigateToAbout }) => {
   const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
   const lang = settings.language;
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Local state for username input to avoid triggering ViewTransitions on every keystroke
   const [localUsername, setLocalUsername] = useState(settings.username);

   // State for update checking
   const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
   const [showResultModal, setShowResultModal] = useState(false);
   const [updateCheckMessage, setUpdateCheckMessage] = useState('');

  const handleThemeToggle = () => {
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  const handleCurrencyChange = (curr: CurrencyCode) => {
    onUpdateSettings({ ...settings, currency: curr });
  };

  const handleLanguageChange = (l: LanguageCode) => {
    onUpdateSettings({ ...settings, language: l });
  };
  
  const handleNameBlur = () => {
    if (localUsername !== settings.username) {
      onUpdateSettings({ ...settings, username: localUsername });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(lang === 'id' ? 'File harus berupa gambar!' : 'File must be an image!');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'id' ? 'Ukuran file maksimal 5MB!' : 'Maximum file size is 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 512px width/height)
        let { width, height } = img;
        const maxSize = 512;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Check final size (should be much smaller now)
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4); // Approximate base64 to bytes

        if (compressedSize > 2 * 1024 * 1024) { // 2MB limit for safety
          alert(lang === 'id' ? 'Gambar terlalu besar setelah kompresi. Coba gambar yang lebih kecil.' : 'Image too large after compression. Try a smaller image.');
          return;
        }

        onUpdateSettings({ ...settings, avatar: compressedDataUrl });
      };

      img.onerror = () => {
        alert(lang === 'id' ? 'Gagal memproses gambar!' : 'Failed to process image!');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      alert(lang === 'id' ? 'Gagal membaca file!' : 'Failed to read file!');
    };

    reader.readAsDataURL(file);
  };

  const handleCheckForUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      setUpdateCheckMessage(t('notAvailable', lang));
      setIsCheckingUpdate(false);
      setShowResultModal(true);
      return;
    }

    setIsCheckingUpdate(true);
    setUpdateCheckMessage(t('checkingForUpdate', lang));

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        setUpdateCheckMessage(lang === 'id' ? 'Pengecekan update selesai. Jika ada update tersedia, akan diinstall otomatis.' : 'Update check completed. If an update is available, it will be installed automatically.');
      } else {
        setUpdateCheckMessage(t('notAvailable', lang));
      }
    } catch (error) {
      setUpdateCheckMessage(lang === 'id' ? 'Gagal mengecek update. Silakan coba lagi.' : 'Failed to check for updates. Please try again.');
    }

    setIsCheckingUpdate(false);
    setShowResultModal(true);
  };

  const handleInstallApp = () => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    if (isStandalone) {
      alert(lang === 'id' ? 'App sudah terinstall!' : 'App is already installed!');
      return;
    }

    if ((window as any).installPWA) {
      (window as any).installPWA();
    } else {
      // Fallback for browsers that don't support programmatic install
      alert(t('installAppDesc', lang));
    }
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 px-2">{children}</h3>
  );

  const SettingCard: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    className?: string;
  }> = ({ icon, label, value, action, onClick, danger, className }) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 border border-white/5 first:rounded-t-2xl last:rounded-b-2xl transition-all cursor-default ${onClick ? 'cursor-pointer liquid-hover hover:bg-white/10' : 'bg-white/5'} ${className || ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${danger ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white'}`}>
          {icon}
        </div>
        <span className={`font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-white/60 text-sm">{value}</span>}
        {action}
        {!action && onClick && <ChevronRight size={16} className="text-white/30" />}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-6 pb-32 px-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
            {t('settingsTitle', lang)}
          </h1>
          <p className="text-base sm:text-lg text-white/80 font-medium">
             {t('hello', lang)}, <span className="text-cyan-400">{settings.username}</span>
          </p>
          <p className="text-white/40 text-xs sm:text-sm mt-1">{t('settingsSubtitle', lang)}</p>
        </header>

        {/* Profile Section */}
        <div>
          <SectionTitle>{t('profile', lang)}</SectionTitle>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-5 items-center">
            
            {/* Avatar Uploader */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
               <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-cyan-400/50 transition-colors shadow-lg">
                 {settings.avatar ? (
                   <img src={settings.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-tr from-cyan-900 to-blue-900 flex items-center justify-center">
                     <User size={40} className="text-cyan-200" />
                   </div>
                 )}
               </div>
               
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                 <Camera className="text-white" size={24} />
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/*" 
                 className="hidden" 
               />
            </div>
            <p className="text-xs text-white/40 -mt-2">{t('tapToChange', lang)}</p>

            {/* Username Input */}
            <div className="w-full">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block px-1">{t('username', lang)}</label>
              <input 
                type="text" 
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                onBlur={handleNameBlur}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <SectionTitle>{t('appearance', lang)}</SectionTitle>
          <div className="flex flex-col gap-[1px]">
            <SettingCard 
              icon={settings.theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
              label={t('appTheme', lang)}
              action={
                <button 
                  onClick={handleThemeToggle}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${settings.theme === 'dark' ? 'bg-purple-600' : 'bg-yellow-400'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              }
            />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <SectionTitle>{t('preferences', lang)}</SectionTitle>
          <div className="flex flex-col gap-[1px] rounded-2xl overflow-hidden bg-white/5">
            <SettingCard 
              icon={<DollarSign size={16}/>}
              label={t('currency', lang)}
              action={
                <div className="flex bg-black/20 rounded-lg p-0.5">
                  {(['IDR', 'USD', 'EUR'] as CurrencyCode[]).map(curr => (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settings.currency === curr ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              }
            />
            <SettingCard 
              icon={<Globe size={16}/>}
              label={t('language', lang)}
              action={
                <div className="flex bg-black/20 rounded-lg p-0.5">
                   {(['id', 'en'] as LanguageCode[]).map(code => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settings.language === code ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                      {code === 'id' ? 'ID' : 'EN'}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </div>

        {/* Data Management */}
        <div>
          <SectionTitle>{t('dataPrivacy', lang)}</SectionTitle>
          <div className="flex flex-col gap-[1px] rounded-2xl overflow-hidden bg-white/5">
             <SettingCard
               icon={<EyeOff size={16}/>}
               label={isPrivacyMode ? t('showBalance', lang) : t('hideBalance', lang)}
               action={
                <button
                  onClick={togglePrivacyMode}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${isPrivacyMode ? 'bg-purple-600' : 'bg-gray-500'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isPrivacyMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
               }
             />
             <SettingCard
               icon={<RefreshCw size={16}/>}
               label={t('resetAll', lang)}
               danger
               onClick={onClearAllData}
             />
          </div>
        </div>

        {/* App Information */}
        <div>
          <SectionTitle>{t('appInfo', lang)}</SectionTitle>
          <div className="flex flex-col gap-[1px] rounded-2xl overflow-hidden bg-white/5">
             <SettingCard
                icon={<RefreshCw size={16} />}
                label={t('checkForUpdate', lang)}
                onClick={handleCheckForUpdate}
              />
              <SettingCard
                icon={<Info size={16}/>}
                label={t('aboutApp', lang)}
                onClick={onNavigateToAbout}
              />
              <SettingCard
                icon={<Download size={16}/>}
                label={t('installApp', lang)}
                value={window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true ? (lang === 'id' ? 'Sudah Terinstall' : 'Already Installed') : undefined}
                onClick={handleInstallApp}
              />
          </div>
        </div>
      </div>

      {/* Update Check Modal */}
      {(isCheckingUpdate || showResultModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-backdrop">
          <div className={`p-6 rounded-2xl shadow-xl max-w-sm mx-4 animate-liquid-pop ${
            settings.theme === 'light' ? 'bg-white border border-white/50' : 'bg-black/80 border border-white/10'
          }`}>
            {isCheckingUpdate ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                <p className={`text-sm font-medium ${settings.theme === 'light' ? 'text-black' : 'text-white'}`}>
                  {updateCheckMessage}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className={`text-sm font-medium mb-4 ${settings.theme === 'light' ? 'text-black' : 'text-white'}`}>
                  {updateCheckMessage}
                </p>
                <button
                  onClick={() => setShowResultModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    settings.theme === 'light'
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  {lang === 'id' ? 'OK' : 'OK'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};