import { z } from 'zod';

// Appraisal schemas
export const createAppraisalSchema = z.object({
  date: z.string().datetime('Data inválida'),
  type: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Tipo deve ser daily, weekly ou monthly' }),
  }),
  notes: z.string().max(500, 'Observações não podem exceder 500 caracteres').optional(),
  includeIngredients: z.boolean().optional().default(true),
  includeStockItems: z.boolean().optional().default(false),
});

export const updateAppraisalSchema = z.object({
  date: z.string().datetime('Data inválida').optional(),
  type: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Tipo deve ser daily, weekly ou monthly' }),
  }).optional(),
  notes: z.string().max(500, 'Observações não podem exceder 500 caracteres').optional(),
});

// Appraisal Item schemas
export const addItemSchema = z.object({
  ingredientId: z.string().uuid('ID do ingrediente inválido'),
  theoreticalQuantity: z.number().nonnegative('Quantidade teórica não pode ser negativa'),
  unitCost: z.number().nonnegative('Custo unitário não pode ser negativo'),
});

export const updateItemSchema = z.object({
  physicalQuantity: z.number().nonnegative('Quantidade física não pode ser negativa').optional(),
  reason: z.string().max(200, 'Motivo não pode exceder 200 caracteres').optional(),
  notes: z.string().max(500, 'Observações não podem exceder 500 caracteres').optional(),
});

// Query schemas
export const appraisalQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  status: z.enum(['pending', 'completed', 'approved']).optional(),
  userId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/, 'Página deve ser um número').optional(),
  limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').optional(),
});

// Approve schema
export const approveAppraisalSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
});

// Complete schema
export const completeAppraisalSchema = z.object({
  // Sem campos adicionais necessários, apenas validação de estado
});

// TypeScript types
export type CreateAppraisalDTO = z.infer<typeof createAppraisalSchema>;
export type UpdateAppraisalDTO = z.infer<typeof updateAppraisalSchema>;
export type AddItemDTO = z.infer<typeof addItemSchema>;
export type UpdateItemDTO = z.infer<typeof updateItemSchema>;
export type AppraisalQuery = z.infer<typeof appraisalQuerySchema>;
export type ApproveAppraisalDTO = z.infer<typeof approveAppraisalSchema>;
export type CompleteAppraisalDTO = z.infer<typeof completeAppraisalSchema>;

// Constants
export const APPRAISAL_TYPES = ['daily', 'weekly', 'monthly'] as const;
export const APPRAISAL_STATUSES = ['pending', 'completed', 'approved'] as const;
export const ACCURACY_THRESHOLDS = {
  green: 95,
  yellow: 90,
  red: 0,
} as const;
