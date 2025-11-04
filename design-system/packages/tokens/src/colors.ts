/**
 * Design Tokens - Colors
 * Paleta de cores do Restaurant Design System
 */

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export const primary: ColorScale = {
  50: '#FFF4ED',
  100: '#FFE6D5',
  200: '#FFC9AA',
  300: '#FFA574',
  400: '#FF7A4D',
  500: '#FF7A4D',
  600: '#E65A2E',
  700: '#CC4419',
  800: '#A33515',
  900: '#7A2810',
};

export const secondary: ColorScale = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
};

export const neutral: Record<number, string> = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
};

export const feedback = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const orderStatus = {
  pending: '#F59E0B',
  preparing: '#3B82F6',
  ready: '#22C55E',
  delivered: '#737373',
  cancelled: '#EF4444',
};

export const tableStatus = {
  available: '#22C55E',
  occupied: '#EF4444',
  reserved: '#3B82F6',
};

export const colors = {
  primary,
  secondary,
  neutral,
  feedback,
  orderStatus,
  tableStatus,
};
