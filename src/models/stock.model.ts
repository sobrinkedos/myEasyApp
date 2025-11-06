import { z } from 'zod';

// Stock Item schemas
export const createStockItemSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  currentQuantity: z.number().min(0, 'Quantidade não pode ser negativa').default(0),
  minimumQuantity: z.number().min(0, 'Quantidade mínima não pode ser negativa').default(0),
  maximumQuantity: z.number().min(0, 'Quantidade máxima não pode ser negativa').optional(),
  costPrice: z.number().min(0, 'Preço de custo não pode ser negativo'),
  salePrice: z.number().min(0, 'Preço de venda não pode ser negativo'),
  supplier: z.string().optional(),
  location: z.string().optional(),
  expirationDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updateStockItemSchema = createStockItemSchema.partial();

// Stock Movement schemas
export const createStockMovementSchema = z.object({
  stockItemId: z.string().uuid('ID do item inválido'),
  type: z.enum(['entrada', 'saida', 'ajuste', 'perda', 'devolucao', 'transferencia'], {
    errorMap: () => ({ message: 'Tipo de movimentação inválido' }),
  }),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  costPrice: z.number().min(0, 'Preço não pode ser negativo').optional(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

// Query schemas
export const stockItemQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// TypeScript types
export type CreateStockItemDTO = z.infer<typeof createStockItemSchema>;
export type UpdateStockItemDTO = z.infer<typeof updateStockItemSchema>;
export type CreateStockMovementDTO = z.infer<typeof createStockMovementSchema>;
export type StockItemQuery = z.infer<typeof stockItemQuerySchema>;

// Categories
export const STOCK_CATEGORIES = [
  'Bebidas Alcoólicas',
  'Bebidas Não Alcoólicas',
  'Salgadinhos',
  'Doces',
  'Congelados',
  'Outros',
] as const;

// Units
export const STOCK_UNITS = [
  'un',  // Unidade
  'cx',  // Caixa
  'pct', // Pacote
  'kg',  // Quilograma
  'l',   // Litro
  'ml',  // Mililitro
] as const;

// Movement types
export const MOVEMENT_TYPES = [
  'entrada',       // Compra
  'saida',         // Venda
  'ajuste',        // Ajuste de inventário
  'perda',         // Perda/quebra
  'devolucao',     // Devolução
  'transferencia', // Transferência
] as const;

// Status
export const STOCK_STATUS = [
  'normal',   // Estoque normal
  'baixo',    // Abaixo do mínimo
  'zerado',   // Sem estoque
  'vencendo', // Próximo do vencimento
  'vencido',  // Vencido
] as const;
