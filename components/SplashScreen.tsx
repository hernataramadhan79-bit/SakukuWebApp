import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { ThemeMode } from '../types';

interface SplashScreenProps {
  onFinish: () => void;
  theme: ThemeMode;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, theme }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    // 1. Initial display time
    const displayTimer = setTimeout(() => {
      setIsExiting(true); // Trigger smooth exit
    }, 2200); 

    // 2. Unmount after animation finishes
    const exitTimer = setTimeout(() => {
      onFinish();
    }, 3000); // 2200 + 800ms exit

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${
        isExiting ? 'animate-splash-exit-smooth' : ''
      } ${
        isLight ? 'bg-[#f0f2f5]' : 'bg-black'
      }`}
    >
      {/* Background Blobs (Soft & Breathing) */}
      <div className={`absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse ${
        isLight ? 'bg-purple-300' : 'bg-purple-900'
      }`}></div>
      <div className={`absolute bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse delay-1000 ${
        isLight ? 'bg-cyan-300' : 'bg-cyan-900'
      }`}></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Icon with Shimmer */}
        <div className="relative group mb-8 animate-elastic-pop">
           <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden relative ${
            isLight 
              ? 'bg-gradient-to-br from-white to-cyan-50 shadow-cyan-500/20' 
              : 'bg-gradient-to-br from-[#18181b] to-black border border-white/10 shadow-cyan-500/20'
          }`}>
             {/* Shimmer Effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer"></div>
             
             <Wallet 
              size={52} 
              strokeWidth={1.5}
              className={`relative z-10 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} 
            />
           </div>
        </div>

        {/* App Name & Tagline (Staggered Reveal) */}
        <div className="text-center">
          <h1 
            className={`text-5xl font-black tracking-tight mb-3 animate-text-reveal ${isLight ? 'text-black' : 'text-white'}`}
            style={{ animationDelay: '0.3s' }}
          >
            Sakuku
          </h1>
          <p 
            className={`text-xs font-medium tracking-[0.3em] uppercase opacity-50 animate-text-reveal ${isLight ? 'text-black' : 'text-white'}`}
            style={{ animationDelay: '0.5s' }}
          >
            Manage Your Wallet
          </p>
        </div>
      </div>
    </div>
  );
};