import { z } from 'zod';

export const listClosuresQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  operatorId: z.string().uuid().optional(),
  cashRegisterId: z.string().uuid().optional(),
  status: z.enum(['normal', 'warning', 'alert']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const exportClosuresQuerySchema = z.object({
  format: z.enum(['excel', 'csv']),
  startDate: z.string(),
  endDate: z.string(),
});

export type ListClosuresQuery = z.infer<typeof listClosuresQuerySchema>;
export type ExportClosuresQuery = z.infer<typeof exportClosuresQuerySchema>;
