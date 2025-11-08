import { Request, Response, NextFunction } from 'express';
import { CashTransactionService } from '@/services/cash-transaction.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';
import { PaymentMethod } from '@prisma/client';

const withdrawalSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  reason: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres'),
  authorizedBy: z.string().uuid().optional(),
});

const supplySchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  reason: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres'),
  authorizedBy: z.string().uuid().optional(),
});

const cancelTransactionSchema = z.object({
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
});

export class CashTransactionController {
  private service: CashTransactionService;

  constructor() {
    this.service = new CashTransactionService();
  }

  recordWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = withdrawalSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const transaction = await this.service.recordWithdrawal(id, validation.data, req.user!.userId);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Sangria registrada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  recordSupply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = supplySchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const transaction = await this.service.recordSupply(id, validation.data, req.user!.userId);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Suprimento registrado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getSessionTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const transactions = await this.service.getSessionTransactions(id);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  getSessionBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const balance = await this.service.getSessionBalance(id);

      res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = cancelTransactionSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      await this.service.cancelTransaction(id, validation.data.reason, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Transação cancelada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
