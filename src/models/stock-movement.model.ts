import { z } from 'zod';

// Stock Movement Types
export const stockMovementTypes = ['purchase', 'usage', 'adjustment', 'waste', 'sale', 'return'] as const;

// Create Stock Movement Schema
export const createStockMovementSchema = z.object({
  stockItemId: z.string().min(1, 'ID do item é obrigatório'),
  type: z.enum(stockMovementTypes, {
    errorMap: () => ({ message: 'Tipo deve ser: purchase, usage, adjustment, waste, sale ou return' }),
  }),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  costPrice: z.number().positive('Preço de custo deve ser positivo').optional(),
  totalCost: z.number().positive('Custo total deve ser positivo').optional(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

// Update Stock Movement Schema
export const updateStockMovementSchema = createStockMovementSchema.partial();

// Stock Movement Response Schema
export const stockMovementResponseSchema = z.object({
  id: z.string(),
  stockItemId: z.string(),
  type: z.enum(stockMovementTypes),
  quantity: z.number(),
  costPrice: z.number().nullable(),
  totalCost: z.number().nullable(),
  reason: z.string().nullable(),
  reference: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  stockItem: z.object({
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
export type CreateStockMovementData = z.infer<typeof createStockMovementSchema>;
export type UpdateStockMovementData = z.infer<typeof updateStockMovementSchema>;
export type StockMovementResponse = z.infer<typeof stockMovementResponseSchema>;

// Bulk Create Schema
export const bulkCreateStockMovementSchema = z.object({
  movements: z.array(createStockMovementSchema).min(1, 'Pelo menos uma movimentação é obrigatória'),
});

export type BulkCreateStockMovementData = z.infer<typeof bulkCreateStockMovementSchema>;
