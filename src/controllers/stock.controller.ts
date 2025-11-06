import { Request, Response, NextFunction } from 'express';
import { StockService } from '@/services/stock.service';
import { ValidationError } from '@/utils/errors';
import {
  createStockItemSchema,
  updateStockItemSchema,
  createStockMovementSchema,
  stockItemQuerySchema,
} from '@/models/stock.model';

export class StockController {
  private service: StockService;

  constructor() {
    this.service = new StockService();
  }

  // Stock Items
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;
      
      const validation = stockItemQuerySchema.safeParse(req.query);
      if (!validation.success) {
        throw new ValidationError('Parâmetros inválidos', {});
      }

      const filters = {
        category: validation.data.category,
        status: validation.data.status,
        search: validation.data.search,
        page: validation.data.page ? parseInt(validation.data.page) : undefined,
        limit: validation.data.limit ? parseInt(validation.data.limit) : undefined,
      };

      const result = await this.service.getAll(establishmentId, filters);

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: filters.page || 1,
          limit: filters.limit || 50,
          pages: Math.ceil(result.total / (filters.limit || 50)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const establishmentId = req.user!.establishmentId;

      const item = await this.service.getById(id, establishmentId);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createStockItemSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const establishmentId = req.user!.establishmentId;
      const userId = req.user!.userId;

      const item = await this.service.create(validation.data, establishmentId, userId);

      res.status(201).json({
        success: true,
        data: item,
        message: 'Item criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateStockItemSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const establishmentId = req.user!.establishmentId;
      const userId = req.user!.userId;

      const item = await this.service.update(id, validation.data, establishmentId, userId);

      res.status(200).json({
        success: true,
        data: item,
        message: 'Item atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const establishmentId = req.user!.establishmentId;
      const userId = req.user!.userId;

      await this.service.delete(id, establishmentId, userId);

      res.status(200).json({
        success: true,
        message: 'Item excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  // Stock Movements
  createMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createStockMovementSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const establishmentId = req.user!.establishmentId;
      const userId = req.user!.userId;

      const movement = await this.service.createMovement(validation.data, establishmentId, userId);

      res.status(201).json({
        success: true,
        data: movement,
        message: 'Movimentação registrada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const establishmentId = req.user!.establishmentId;

      const movements = await this.service.getMovements(id, establishmentId);

      res.status(200).json({
        success: true,
        data: movements,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;
      
      const filters = {
        type: req.query.type as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await this.service.getAllMovements(establishmentId, filters);

      res.status(200).json({
        success: true,
        data: result.movements,
        pagination: {
          total: result.total,
          page: filters.page || 1,
          limit: filters.limit || 50,
          pages: Math.ceil(result.total / (filters.limit || 50)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Dashboard
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;

      const stats = await this.service.getStats(establishmentId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStockItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;

      const items = await this.service.getLowStockItems(establishmentId);

      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  getExpiringItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;

      const items = await this.service.getExpiringItems(establishmentId);

      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };
}
