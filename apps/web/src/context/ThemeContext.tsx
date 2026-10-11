'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyThemeClass(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem('farmlink_theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') {
          setThemeState(saved);
          applyThemeClass(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setThemeState('dark');
          applyThemeClass('dark');
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyThemeClass(t);
    try {
      localStorage.setItem('farmlink_theme', t);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
