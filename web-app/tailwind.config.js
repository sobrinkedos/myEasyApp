import { tokens } from './src/design-system/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Habilita modo escuro via classe
  theme: {
    extend: {
      colors: tokens.colors,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      fontFamily: tokens.fontFamily,
      spacing: tokens.spacing,
      boxShadow: tokens.boxShadow,
      borderRadius: tokens.borderRadius,
      borderWidth: tokens.borderWidth,
      transitionDuration: tokens.transitionDuration,
      transitionTimingFunction: tokens.transitionTimingFunction,
      screens: tokens.screens,
    },
  },
  plugins: [],
};
