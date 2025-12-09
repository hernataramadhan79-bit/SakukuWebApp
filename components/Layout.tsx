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
  [AppView.ABOUT]: 4, // Not used since navbar is hidden
};

const NavItem: React.FC<{
  isActive: boolean;
  icon: React.ReactNode;
  label: string; 
  onClick: () => void;
}> = ({ isActive, icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative z-10 flex flex-col items-center justify-center h-full w-full transition-colors duration-300 group`}
    >
      {/* Icon stays centered, scales up when active */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${isActive ? 'text-theme scale-125' : 'text-theme opacity-50 group-hover:opacity-80 scale-100'}`}>
        {icon}
      </div>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, isModalOpen, language, theme }) => {
  const activeIndex = VIEW_INDEX_MAP[currentView];
  const isLight = theme === 'light';

  return (
    <div className="relative w-full h-full overflow-hidden text-theme selection:bg-cyan-500/30">
      
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

      {/* Floating Capsule Navigation - Slides down when modal is open or hidden on ABOUT page */}
      {currentView !== AppView.ABOUT && (
        <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isModalOpen ? 'translate-y-[200%]' : 'translate-y-0'}`}>
        
        {/* The Navbar Container - Increased width for better spacing */}
        <nav className={`pointer-events-auto w-full max-w-[20rem] backdrop-blur-3xl border shadow-2xl rounded-full p-2 relative overflow-hidden transition-all duration-500 ${
          isLight 
            ? 'bg-white/90 border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.15)]' // Light Mode
            : 'bg-[#18181b]/80 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]' // Dark Mode
        }`}>
          
          {/* Grid Layout - Height 16 (4rem) + Padding 2 (0.5rem*2) = Total Height 5rem */}
          <div className="grid grid-cols-4 relative h-14 items-center">
            
            {/* The Liquid Blob (Sliding Active Indicator) */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-1/4 h-full p-1.5 transition-transform duration-500"
              style={{ 
                transform: `translateX(${activeIndex * 100}%)`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1.2)' 
              }}
            >
              {/* Inner blob - Adjusted styling for clarity and spacing */}
              <div className={`w-full h-full rounded-full backdrop-blur-md transition-all duration-300 ${
                isLight 
                  ? 'bg-black/5 border border-black/5 shadow-inner' 
                  : 'bg-white/15 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              }`}></div>
            </div>

            {/* Nav Items */}
            <NavItem 
              isActive={currentView === AppView.DASHBOARD}
              icon={<LayoutDashboard className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('dashboard', language)} 
              onClick={() => onChangeView(AppView.DASHBOARD)} 
            />
            <NavItem 
              isActive={currentView === AppView.TRANSACTIONS}
              icon={<CreditCard className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('wallet', language)} 
              onClick={() => onChangeView(AppView.TRANSACTIONS)} 
            />
            <NavItem 
              isActive={currentView === AppView.ANALYTICS}
              icon={<PieChart className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('data', language)} 
              onClick={() => onChangeView(AppView.ANALYTICS)} 
            />
            <NavItem 
              isActive={currentView === AppView.SETTINGS}
              icon={<Settings className="w-6 h-6" strokeWidth={2.5} />} 
              label={t('settings', language)} 
              onClick={() => onChangeView(AppView.SETTINGS)} 
            />
          </div>
        </nav>
      </div>
      )}
    </div>
  );
};