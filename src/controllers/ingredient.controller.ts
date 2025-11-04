import { Request, Response, NextFunction } from 'express';
import { IngredientService } from '@/services/ingredient.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createIngredientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'un'], {
    errorMap: () => ({ message: 'Unidade inválida' }),
  }),
  currentQuantity: z.number().nonnegative('Quantidade deve ser maior ou igual a zero'),
  minimumQuantity: z.number().nonnegative('Quantidade mínima deve ser maior ou igual a zero'),
  averageCost: z.number().nonnegative('Custo médio deve ser maior ou igual a zero'),
});

const updateIngredientSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'un']).optional(),
  currentQuantity: z.number().nonnegative().optional(),
  minimumQuantity: z.number().nonnegative().optional(),
  averageCost: z.number().nonnegative().optional(),
});

const linkProductSchema = z.object({
  productId: z.string().uuid('ID de produto inválido'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
});

export class IngredientController {
  private service: IngredientService;

  constructor() {
    this.service = new IngredientService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ingredients = await this.service.getAll();

      res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ingredient = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createIngredientSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const ingredient = await this.service.create(validation.data);

      res.status(201).json({
        success: true,
        data: ingredient,
        message: 'Insumo criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateIngredientSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const ingredient = await this.service.update(id, validation.data);

      res.status(200).json({
        success: true,
        data: ingredient,
        message: 'Insumo atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  linkToProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = linkProductSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      await this.service.linkToProduct(id, validation.data.productId, validation.data.quantity);

      res.status(200).json({
        success: true,
        message: 'Insumo vinculado ao produto com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
