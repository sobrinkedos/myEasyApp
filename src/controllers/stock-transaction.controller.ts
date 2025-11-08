import { Request, Response, NextFunction } from 'express';
import { StockTransactionService } from '@/services/stock-transaction.service';
import { 
  createStockTransactionSchema, 
  updateStockTransactionSchema,
  bulkCreateStockTransactionSchema 
} from '@/models/stock-transaction.model';
import { ValidationError } from '@/utils/errors';

export class StockTransactionController {
  private service: StockTransactionService;

  constructor() {
    this.service = new StockTransactionService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createStockTransactionSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const transaction = await this.service.create(validation.data, userId);

      res.status(201).json({
        success: true,
        message: 'Transação de estoque criada com sucesso',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  createBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = bulkCreateStockTransactionSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const result = await this.service.createBulk(validation.data, userId);

      res.status(201).json({
        success: true,
        message: `${result.count} transações criadas com sucesso`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        ingredientId,
        type,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;

      const filters = {
        ingredientId: ingredientId as string,
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.service.getAll(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const transaction = await this.service.getById(id);

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  getByIngredient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ingredientId } = req.params;
      const { limit } = req.query;

      const transactions = await this.service.getByIngredient(
        ingredientId,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const validation = updateStockTransactionSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const transaction = await this.service.update(id, validation.data);

      res.json({
        success: true,
        message: 'Transação atualizada com sucesso',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      res.json({
        success: true,
        message: 'Transação removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getPurchasesByPeriod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('Datas de início e fim são obrigatórias', {
          startDate: !startDate ? ['Data de início é obrigatória'] : [],
          endDate: !endDate ? ['Data de fim é obrigatória'] : [],
        });
      }

      const total = await this.service.getPurchasesByPeriod(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  };
}
