/* context/PrivacyContext.tsx */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakuku_privacy_mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('sakuku_privacy_mode', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
