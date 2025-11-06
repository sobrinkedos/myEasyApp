/**
 * CNPJ Validation Utility
 * Implements the official Brazilian CNPJ validation algorithm
 */

/**
 * Normalizes CNPJ by removing all non-digit characters
 * @param cnpj - CNPJ string with or without formatting
 * @returns CNPJ with only digits
 */
export function normalizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Formats CNPJ to standard format: XX.XXX.XXX/XXXX-XX
 * @param cnpj - CNPJ string with only digits
 * @returns Formatted CNPJ string
 */
export function formatCNPJ(cnpj: string): string {
  const normalized = normalizeCNPJ(cnpj);
  
  if (normalized.length !== 14) {
    return cnpj;
  }
  
  return normalized.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Validates CNPJ using the official algorithm
 * @param cnpj - CNPJ string with or without formatting
 * @returns true if CNPJ is valid, false otherwise
 */
export function validateCNPJ(cnpj: string): boolean {
  // Normalize CNPJ (remove formatting)
  const digits = normalizeCNPJ(cnpj);
  
  // Check if has exactly 14 digits
  if (digits.length !== 14) {
    return false;
  }
  
  // Check for known invalid patterns (all digits the same)
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  let weight = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (checkDigit1 !== parseInt(digits[12])) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (checkDigit2 !== parseInt(digits[13])) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a string is a valid CNPJ and throws an error if not
 * @param cnpj - CNPJ string to validate
 * @throws Error if CNPJ is invalid
 */
export function assertValidCNPJ(cnpj: string): void {
  if (!validateCNPJ(cnpj)) {
    throw new Error('CNPJ inválido');
  }
}
