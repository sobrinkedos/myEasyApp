/**
 * Counter Order Validation Schemas
 * Schemas de validação Zod para Pedidos Balcão
 */

import { z } from 'zod';
import { CounterOrderStatus } from './counter-order.model';

// Schema para item do pedido
export const CreateCounterOrderItemSchema = z.object({
  productId: z.string().uuid({
    message: 'ID do produto deve ser um UUID válido',
  }),
  quantity: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(
      z
        .number()
        .int({ message: 'Quantidade deve ser um número inteiro' })
        .min(1, { message: 'Quantidade mínima é 1' })
        .max(99, { message: 'Quantidade máxima é 99' })
    ),
  notes: z
    .string()
    .max(200, { message: 'Observações devem ter no máximo 200 caracteres' })
    .optional(),
});

// Schema para criação de pedido balcão
export const CreateCounterOrderSchema = z.object({
  customerName: z
    .string()
    .max(100, { message: 'Nome do cliente deve ter no máximo 100 caracteres' })
    .optional(),
  notes: z
    .string()
    .max(500, { message: 'Observações devem ter no máximo 500 caracteres' })
    .optional(),
  items: z
    .array(CreateCounterOrderItemSchema)
    .min(1, { message: 'Pedido deve ter pelo menos 1 item' })
    .max(50, { message: 'Pedido pode ter no máximo 50 itens' }),
});

// Schema para atualização de status
export const UpdateCounterOrderStatusSchema = z.object({
  status: z.enum(
    [
      CounterOrderStatus.PENDENTE,
      CounterOrderStatus.PREPARANDO,
      CounterOrderStatus.PRONTO,
      CounterOrderStatus.ENTREGUE,
    ],
    {
      errorMap: () => ({
        message: 'Status inválido. Use: PENDENTE, PREPARANDO, PRONTO ou ENTREGUE',
      }),
    }
  ),
});

// Schema para cancelamento de pedido
export const CancelCounterOrderSchema = z.object({
  reason: z
    .string()
    .min(1, { message: 'Motivo do cancelamento é obrigatório' })
    .max(200, { message: 'Motivo deve ter no máximo 200 caracteres' }),
});

// Schema para filtros de listagem
export const ListCounterOrdersQuerySchema = z.object({
  status: z
    .enum([
      CounterOrderStatus.AGUARDANDO_PAGAMENTO,
      CounterOrderStatus.PENDENTE,
      CounterOrderStatus.PREPARANDO,
      CounterOrderStatus.PRONTO,
      CounterOrderStatus.ENTREGUE,
      CounterOrderStatus.CANCELADO,
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('50'),
});

// Schema para parâmetros de métricas
export const GetMetricsQuerySchema = z.object({
  startDate: z.string().datetime({
    message: 'Data inicial deve estar no formato ISO 8601',
  }),
  endDate: z.string().datetime({
    message: 'Data final deve estar no formato ISO 8601',
  }),
});

// Tipos inferidos dos schemas
export type CreateCounterOrderInput = z.infer<typeof CreateCounterOrderSchema>;
export type CreateCounterOrderItemInput = z.infer<typeof CreateCounterOrderItemSchema>;
export type UpdateCounterOrderStatusInput = z.infer<typeof UpdateCounterOrderStatusSchema>;
export type CancelCounterOrderInput = z.infer<typeof CancelCounterOrderSchema>;
export type ListCounterOrdersQuery = z.infer<typeof ListCounterOrdersQuerySchema>;
export type GetMetricsQuery = z.infer<typeof GetMetricsQuerySchema>;
