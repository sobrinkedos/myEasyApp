import { Request, Response, NextFunction } from 'express';
import { TableService } from '@/services/table.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createTableSchema = z.object({
  number: z.number().int().positive('Número da mesa deve ser positivo'),
  capacity: z.number().int().positive('Capacidade deve ser positiva'),
});

const updateTableSchema = z.object({
  capacity: z.number().int().positive().optional(),
  status: z.enum(['available', 'occupied', 'reserved']).optional(),
  isActive: z.boolean().optional(),
});

export class TableController {
  private service: TableService;

  constructor() {
    this.service = new TableService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tables = await this.service.getAll();

      res.status(200).json({
        success: true,
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const table = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: table,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createTableSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const table = await this.service.create(validation.data);

      res.status(201).json({
        success: true,
        data: table,
        message: 'Mesa criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateTableSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const table = await this.service.update(id, validation.data);

      res.status(200).json({
        success: true,
        data: table,
        message: 'Mesa atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      res.status(200).json({
        success: true,
        message: 'Mesa removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
