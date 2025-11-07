import { z } from 'zod';

// CMV Period schemas
export const createPeriodSchema = z.object({
  startDate: z.string().datetime('Data inicial inválida'),
  endDate: z.string().datetime('Data final inválida'),
  type: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Tipo deve ser daily, weekly ou monthly' }),
  }),
});

export const updatePeriodSchema = z.object({
  startDate: z.string().datetime('Data inicial inválida').optional(),
  endDate: z.string().datetime('Data final inválida').optional(),
  type: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Tipo deve ser daily, weekly ou monthly' }),
  }).optional(),
});

// Close Period schema
export const closePeriodSchema = z.object({
  closingAppraisalId: z.string().uuid('ID da conferência inválido').optional(),
});

// Register Purchase schema
export const registerPurchaseSchema = z.object({
  amount: z.number().nonnegative('Valor de compra não pode ser negativo'),
});

// Query schemas
export const periodQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  status: z.enum(['open', 'closed']).optional(),
  page: z.string().regex(/^\d+$/, 'Página deve ser um número').optional(),
  limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').optional(),
});

// TypeScript types
export type CreatePeriodDTO = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodDTO = z.infer<typeof updatePeriodSchema>;
export type ClosePeriodDTO = z.infer<typeof closePeriodSchema>;
export type RegisterPurchaseDTO = z.infer<typeof registerPurchaseSchema>;
export type PeriodQuery = z.infer<typeof periodQuerySchema>;

// Constants
export const PERIOD_TYPES = ['daily', 'weekly', 'monthly'] as const;
export const PERIOD_STATUSES = ['open', 'closed'] as const;
export const CMV_THRESHOLDS = {
  excellent: 30,
  good: 35,
  acceptable: 40,
  high: 45,
} as const;

