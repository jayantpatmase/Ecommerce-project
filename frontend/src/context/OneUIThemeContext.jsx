import React, { createContext, useContext, useState, useEffect } from 'react';

const OneUIThemeContext = createContext();

export function OneUIThemeProvider({ children }) {
  // Default to phone frame on desktop screens (>= 1200px) so the user instantly sees the requested mobile phone theme!
  const [isPhoneFrame, setIsPhoneFrame] = useState(() => {
    const saved = localStorage.getItem('oneui_phone_frame');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  const togglePhoneFrame = () => {
    setIsPhoneFrame((prev) => {
      const next = !prev;
      localStorage.setItem('oneui_phone_frame', String(next));
      return next;
    });
  };

  return (
    <OneUIThemeContext.Provider value={{ isPhoneFrame, togglePhoneFrame, setIsPhoneFrame }}>
      {children}
    </OneUIThemeContext.Provider>
  );
}

export function useOneUITheme() {
  const context = useContext(OneUIThemeContext);
  if (!context) {
    throw new Error('useOneUITheme must be used within OneUIThemeProvider');
  }
  return context;
}
