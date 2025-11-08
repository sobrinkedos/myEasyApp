import { z } from 'zod';

// Stock Transaction Types
export const stockTransactionTypes = ['purchase', 'usage', 'adjustment', 'waste'] as const;

// Create Stock Transaction Schema
export const createStockTransactionSchema = z.object({
  ingredientId: z.string().min(1, 'ID do ingrediente é obrigatório'),
  type: z.enum(stockTransactionTypes, {
    errorMap: () => ({ message: 'Tipo deve ser: purchase, usage, adjustment ou waste' }),
  }),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unitCost: z.number().positive('Custo unitário deve ser positivo').optional(),
  totalValue: z.number().positive('Valor total deve ser positivo').optional(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

// Update Stock Transaction Schema
export const updateStockTransactionSchema = createStockTransactionSchema.partial();

// Stock Transaction Response Schema
export const stockTransactionResponseSchema = z.object({
  id: z.string(),
  ingredientId: z.string(),
  type: z.enum(stockTransactionTypes),
  quantity: z.number(),
  unitCost: z.number().nullable(),
  totalValue: z.number().nullable(),
  reason: z.string().nullable(),
  reference: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  ingredient: z.object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
  }).optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

// Types
export type CreateStockTransactionData = z.infer<typeof createStockTransactionSchema>;
export type UpdateStockTransactionData = z.infer<typeof updateStockTransactionSchema>;
export type StockTransactionResponse = z.infer<typeof stockTransactionResponseSchema>;

// Bulk Create Schema
export const bulkCreateStockTransactionSchema = z.object({
  transactions: z.array(createStockTransactionSchema).min(1, 'Pelo menos uma transação é obrigatória'),
});

export type BulkCreateStockTransactionData = z.infer<typeof bulkCreateStockTransactionSchema>;
