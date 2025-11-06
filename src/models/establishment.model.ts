import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  street: z.string().min(3, 'Rua deve ter no mínimo 3 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, 'Bairro deve ter no mínimo 3 caracteres'),
  city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

// Tax settings schema
export const taxSettingsSchema = z.object({
  taxRegime: z.enum(['simples', 'presumido', 'real'], {
    errorMap: () => ({ message: 'Regime tributário inválido' }),
  }),
  icmsRate: z.number().min(0).max(100, 'Taxa ICMS deve estar entre 0 e 100'),
  issRate: z.number().min(0).max(100, 'Taxa ISS deve estar entre 0 e 100'),
  pisRate: z.number().min(0).max(100, 'Taxa PIS deve estar entre 0 e 100'),
  cofinsRate: z.number().min(0).max(100, 'Taxa COFINS deve estar entre 0 e 100'),
});

// Create establishment schema
export const createEstablishmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
  address: addressSchema,
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  logoUrl: z.string().url('URL da logo inválida').optional(),
  taxSettings: taxSettingsSchema,
});

// Update establishment schema (all fields optional)
export const updateEstablishmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  cnpj: z.string().regex(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
  address: addressSchema.optional(),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  logoUrl: z.string().url('URL da logo inválida').optional(),
  taxSettings: taxSettingsSchema.optional(),
});

// TypeScript types
export type Address = z.infer<typeof addressSchema>;
export type TaxSettings = z.infer<typeof taxSettingsSchema>;
export type CreateEstablishmentDTO = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentDTO = z.infer<typeof updateEstablishmentSchema>;
