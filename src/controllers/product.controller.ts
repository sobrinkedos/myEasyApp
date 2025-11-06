import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createProductSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative('Preço deve ser maior ou igual a zero'),
  categoryId: z.string().uuid('ID de categoria inválido'),
  recipeId: z.string().uuid().optional(),
  targetMargin: z.number().min(0).max(100).optional(),
  preparationTime: z.number().int().positive().optional(),
  imageUrl: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  recipeId: z.string().uuid().optional().nullable(),
  suggestedPrice: z.number().optional(),
  targetMargin: z.number().min(0).max(100).optional(),
  currentMargin: z.number().optional(),
  markup: z.number().optional(),
  preparationTime: z.number().int().positive().optional(),
  salesCount: z.number().int().optional(),
  revenue: z.number().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class ProductController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive === 'false' ? false : true;

      const result = await this.service.getAll({
        page,
        limit,
        categoryId,
        isActive,
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

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createProductSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const product = await this.service.create(validation.data);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Produto criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateProductSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const product = await this.service.update(id, validation.data);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Produto atualizado com sucesso',
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
        message: 'Produto removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
