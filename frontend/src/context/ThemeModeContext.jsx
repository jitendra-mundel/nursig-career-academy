import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeModeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.body.dataset.theme = mode;
  }, [mode]);

  const toggleMode = () => {
    setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
  };

  const value = {
    mode,
    setMode,
    toggleMode,
  };

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};