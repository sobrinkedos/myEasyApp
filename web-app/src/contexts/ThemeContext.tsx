import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, themes, applyThemeVariables } from '../design-system/theme';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'app-theme';

/**
 * Detecta a preferência de tema do sistema operacional
 */
const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

/**
 * Obtém o tema salvo no localStorage ou usa a preferência do sistema
 */
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme;
  }

  return getSystemTheme();
};

/**
 * ThemeProvider
 * Gerencia o estado do tema e fornece funções para alterá-lo
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // Aplicar tema quando mudar
  useEffect(() => {
    const currentTheme = themes[theme];
    applyThemeVariables(currentTheme);
  }, [theme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Só atualiza se não houver preferência salva
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Adicionar listener (compatível com navegadores antigos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  /**
   * Define o tema e persiste no localStorage
   */
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
