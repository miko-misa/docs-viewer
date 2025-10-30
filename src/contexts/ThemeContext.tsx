'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
}

const STORAGE_KEY = 'docs-viewer-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', next);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored);
      setThemeState(stored);
      return;
    }

    const attribute = root.getAttribute('data-theme');
    if (attribute === 'light' || attribute === 'dark') {
      setThemeState(attribute);
    } else {
      const prefersDark = media.matches;
      const initial = prefersDark ? 'dark' : 'light';
      applyTheme(initial);
      setThemeState(initial);
    }

    const handleChange = (event: MediaQueryListEvent) => {
      const persisted = window.localStorage.getItem(STORAGE_KEY);
      if (persisted === 'light' || persisted === 'dark') {
        return;
      }
      const nextTheme: Theme = event.matches ? 'dark' : 'light';
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
