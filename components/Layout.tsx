import React from 'react';
import { AppView, LanguageCode, ThemeMode } from '../types';
import { LayoutDashboard, CreditCard, PieChart, Settings } from 'lucide-react';
import { t } from '../utils/i18n';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isModalOpen: boolean;
  language: LanguageCode;
  theme: ThemeMode;
}

// Map views to index for sliding calculation
const VIEW_INDEX_MAP: Record<AppView, number> = {
  [AppView.DASHBOARD]: 0,
  [AppView.TRANSACTIONS]: 1,
  [AppView.ANALYTICS]: 2,
  [AppView.SETTINGS]: 3,
};

const NavItem: React.FC<{
  isActive: boolean;
  icon: React.ReactNode;
  label: string; 
  onClick: () => void;
  isLight: boolean;
}> = ({ isActive, icon, label, onClick, isLight }) => {
  // Dynamic color logic for high contrast against the blob
  // If Active: Text color is opposite to theme (White for Light mode, Black for Dark mode)
  // If Inactive: Text color is theme color with opacity
  const activeClass = isLight ? "text-white" : "text-black";
  const inactiveClass = isLight ? "text-black/40 group-hover:text-black/70" : "text-white/40 group-hover:text-white/70";

  return (
    <button
      onClick={onClick}
      title={label}
      className="relative z-10 flex flex-col items-center justify-center h-full w-full transition-colors duration-300 group cursor-pointer"
    >
      {/* Icon Wrapper with Spring Animation */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
        isActive 
          ? `${activeClass} scale-110 -translate-y-1` 
          : `${inactiveClass} scale-100 translate-y-0`
      }`}>
        {icon}
      </div>
      
      {/* Optional Label that appears on hover or active? Keeping it icon-only for cleaner liquid look, 
          or maybe a tiny dot indicator? The request didn't specify, sticking to icons. */}
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, isModalOpen, language, theme }) => {
  const activeIndex = VIEW_INDEX_MAP[currentView];
  const isLight = theme === 'light';

  return (
    <div className="relative w-full h-full overflow-hidden bg-theme text-theme selection:bg-cyan-500/30">
      
      {/* Liquid Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/40 rounded-full mix-blend-screen blob pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/40 rounded-full mix-blend-screen blob blob-2 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-900/30 rounded-full mix-blend-screen blob pointer-events-none"></div>
      
      {/* Content Container */}
      <main className="absolute inset-0 w-full h-full flex flex-col">
        {/* We use a key here to trigger the entrance animation on mount */}
        <div key={currentView} className="flex-1 w-full h-full overflow-hidden animate-liquid-enter relative">
          {children}
        </div>
      </main>

      {/* Floating Capsule Navigation - Slides down when modal is open */}
      <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isModalOpen ? 'translate-y-[200%]' : 'translate-y-0'}`}>
        
        {/* The Navbar Container */}
        <nav className={`pointer-events-auto w-full max-w-[20rem] backdrop-blur-3xl border shadow-2xl rounded-[2rem] p-2 relative overflow-hidden transition-all duration-500 ${
          isLight 
            ? 'bg-white/80 border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.1)]' // Light Mode
            : 'bg-[#121212]/80 border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)]' // Dark Mode
        }`}>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-4 relative h-14 items-center">
            
            {/* THE LIQUID BLOB (Active Indicator) */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-1/4 h-full flex items-center justify-center transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
              style={{ 
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            >
              {/* Inner Blob Shape */}
              <div className={`w-12 h-12 rounded-[1.2rem] shadow-lg transition-all duration-300 relative group
                ${isLight 
                  ? 'bg-black shadow-black/25' 
                  : 'bg-white shadow-white/20'
                }
              `}>
                  {/* Subtle internal shine/gradient for liquid feel */}
                  <div className={`absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr opacity-20 ${
                    isLight ? 'from-white/20 to-transparent' : 'from-black/10 to-transparent'
                  }`}></div>
                  
                  {/* Optional Blur Glow behind (Liquid spread) */}
                  <div className={`absolute -inset-1 rounded-[1.4rem] opacity-30 blur-md transition-all duration-500 -z-10 ${
                    isLight ? 'bg-black' : 'bg-white'
                  }`}></div>
              </div>
            </div>

            {/* Nav Items */}
            <NavItem 
              isActive={currentView === AppView.DASHBOARD}
              icon={<LayoutDashboard className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('dashboard', language)} 
              onClick={() => onChangeView(AppView.DASHBOARD)} 
              isLight={isLight}
            />
            <NavItem 
              isActive={currentView === AppView.TRANSACTIONS}
              icon={<CreditCard className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('wallet', language)} 
              onClick={() => onChangeView(AppView.TRANSACTIONS)} 
              isLight={isLight}
            />
            <NavItem 
              isActive={currentView === AppView.ANALYTICS}
              icon={<PieChart className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('data', language)} 
              onClick={() => onChangeView(AppView.ANALYTICS)} 
              isLight={isLight}
            />
            <NavItem 
              isActive={currentView === AppView.SETTINGS}
              icon={<Settings className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('settings', language)} 
              onClick={() => onChangeView(AppView.SETTINGS)} 
              isLight={isLight}
            />
          </div>
        </nav>
      </div>
    </div>
  );
};
