import { Request, Response, NextFunction } from 'express';
import { CashTreasuryService } from '@/services/cash-treasury.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const transferSchema = z.object({
  notes: z.string().optional(),
});

const confirmReceiptSchema = z.object({
  receivedAmount: z.number().positive('Valor recebido deve ser positivo'),
  notes: z.string().optional(),
});

export class CashTreasuryController {
  private service: CashTreasuryService;

  constructor() {
    this.service = new CashTreasuryService();
  }

  transferToTreasury = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = transferSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const transfer = await this.service.transferToTreasury(id, validation.data.notes);

      res.status(201).json({
        success: true,
        data: transfer,
        message: 'Transferência para tesouraria realizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  listPendingTransfers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfers = await this.service.listPendingTransfers();

      res.status(200).json({
        success: true,
        data: transfers,
      });
    } catch (error) {
      next(error);
    }
  };

  confirmReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = confirmReceiptSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const transfer = await this.service.confirmReceipt(id, {
        receivedBy: req.user!.userId,
        receivedAmount: validation.data.receivedAmount,
        notes: validation.data.notes,
      });

      res.status(200).json({
        success: true,
        data: transfer,
        message: 'Recebimento confirmado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getDailyConsolidation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query;
      const consolidationDate = date ? new Date(date as string) : new Date();

      const consolidation = await this.service.getDailyConsolidation(consolidationDate);

      res.status(200).json({
        success: true,
        data: consolidation,
      });
    } catch (error) {
      next(error);
    }
  };
}
