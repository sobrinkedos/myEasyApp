import { z } from 'zod';

/**
 * Schema para abertura de sessão de caixa
 */
export const OpenSessionSchema = z.object({
  cashRegisterId: z.string().uuid('ID do caixa inválido'),
  openingAmount: z
    .number()
    .positive('Valor de abertura deve ser positivo')
    .min(50, 'Valor mínimo de abertura é R$ 50,00')
    .max(500, 'Valor máximo de abertura é R$ 500,00'),
});

/**
 * Schema para fechamento de sessão de caixa
 */
export const CloseSessionSchema = z.object({
  countedAmount: z.number().positive('Valor contado deve ser positivo'),
  counts: z.array(
    z.object({
      denomination: z.number().positive('Denominação deve ser positiva'),
      quantity: z.number().int().nonnegative('Quantidade deve ser não-negativa'),
      total: z.number().nonnegative('Total deve ser não-negativo'),
    })
  ),
  notes: z.string().optional(),
});

/**
 * Schema para reabertura de sessão
 */
export const ReopenSessionSchema = z.object({
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
});

/**
 * Schema para registro de sangria
 */
export const WithdrawalSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  reason: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres'),
  authorizedBy: z.string().uuid('ID do autorizador inválido').optional(),
});

/**
 * Schema para registro de suprimento
 */
export const SupplySchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  reason: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres'),
  authorizedBy: z.string().uuid('ID do autorizador inválido').optional(),
});

/**
 * Schema para contagem de caixa
 */
export const CashCountSchema = z.object({
  counts: z.array(
    z.object({
      denomination: z.number().positive(),
      quantity: z.number().int().nonnegative(),
      total: z.number().nonnegative(),
    })
  ),
});

/**
 * Schema para transferência para tesouraria
 */
export const TransferSchema = z.object({
  notes: z.string().optional(),
});

/**
 * Schema para confirmação de recebimento
 */
export const ReceiptSchema = z.object({
  receivedAmount: z.number().positive('Valor recebido deve ser positivo'),
  notes: z.string().optional(),
});

/**
 * Schema para cancelamento de transação
 */
export const CancelTransactionSchema = z.object({
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
});

// Type exports
export type OpenSessionDTO = z.infer<typeof OpenSessionSchema>;
export type CloseSessionDTO = z.infer<typeof CloseSessionSchema>;
export type ReopenSessionDTO = z.infer<typeof ReopenSessionSchema>;
export type WithdrawalDTO = z.infer<typeof WithdrawalSchema>;
export type SupplyDTO = z.infer<typeof SupplySchema>;
export type CashCountDTO = z.infer<typeof CashCountSchema>;
export type TransferDTO = z.infer<typeof TransferSchema>;
export type ReceiptDTO = z.infer<typeof ReceiptSchema>;
export type CancelTransactionDTO = z.infer<typeof CancelTransactionSchema>;
