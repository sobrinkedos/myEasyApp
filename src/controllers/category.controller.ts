import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '@/services/category.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createCategorySchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  displayOrder: z.number().int().positive('Ordem deve ser um número positivo'),
});

const updateCategorySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  displayOrder: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.service.getAll();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createCategorySchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const category = await this.service.create(validation.data);

      res.status(201).json({
        success: true,
        data: category,
        message: 'Categoria criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateCategorySchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const category = await this.service.update(id, validation.data);

      res.status(200).json({
        success: true,
        data: category,
        message: 'Categoria atualizada com sucesso',
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
        message: 'Categoria removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
