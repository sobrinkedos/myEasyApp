import { Request, Response, NextFunction } from 'express';
import { StockService } from '@/services/stock.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createTransactionSchema = z.object({
  ingredientId: z.string().uuid('ID de insumo inválido'),
  type: z.enum(['in', 'out', 'adjustment'], {
    errorMap: () => ({ message: 'Tipo inválido. Use: in, out ou adjustment' }),
  }),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  reason: z.string().max(200).optional(),
});

export class StockController {
  private service: StockService;

  constructor() {
    this.service = new StockService();
  }

  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createTransactionSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user!.userId;
      const transaction = await this.service.createTransaction(validation.data, userId);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transação de estoque registrada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ingredientId = req.query.ingredientId as string;
      const type = req.query.type as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.service.getTransactions({
        ingredientId,
        type,
        startDate,
        endDate,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactionsByIngredient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ingredientId } = req.params;
      const transactions = await this.service.getTransactionsByIngredient(ingredientId);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };
}
