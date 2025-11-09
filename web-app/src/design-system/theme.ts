/**
 * Theme Configuration
 * Configurações de temas claro e escuro
 */

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
}

// Tema Claro (Padrão)
export const lightTheme: Theme = {
  mode: 'light',
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e5e5e5',
  },
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#a3a3a3',
  },
  border: '#e5e5e5',
};

// Tema Escuro
export const darkTheme: Theme = {
  mode: 'dark',
  background: {
    primary: '#0a0a0a',
    secondary: '#171717',
    tertiary: '#262626',
  },
  text: {
    primary: '#fafafa',
    secondary: '#a3a3a3',
    tertiary: '#737373',
  },
  border: '#262626',
};

// Mapa de temas
export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

// CSS Variables para cada tema
export const getCSSVariables = (theme: Theme): Record<string, string> => ({
  '--bg-primary': theme.background.primary,
  '--bg-secondary': theme.background.secondary,
  '--bg-tertiary': theme.background.tertiary,
  '--text-primary': theme.text.primary,
  '--text-secondary': theme.text.secondary,
  '--text-tertiary': theme.text.tertiary,
  '--border-color': theme.border,
});

// Aplicar CSS variables no documento
export const applyThemeVariables = (theme: Theme): void => {
  const root = document.documentElement;
  const variables = getCSSVariables(theme);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Adicionar classe do tema no body
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme.mode);
};
