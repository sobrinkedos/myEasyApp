import clsx, { ClassValue } from 'clsx';

/**
 * Utility para combinar classes CSS
 * Wrapper em torno do clsx para facilitar o uso
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
