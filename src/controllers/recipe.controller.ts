import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '@/services/recipe.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const recipeIngredientSchema = z.object({
  ingredientId: z.string().uuid('ID de ingrediente inválido'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  notes: z.string().optional(),
});

const createRecipeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  yield: z.number().positive('Rendimento deve ser maior que zero'),
  yieldUnit: z.string().min(1, 'Unidade de rendimento é obrigatória'),
  preparationTime: z.number().int().positive().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Adicione pelo menos um ingrediente'),
});

const updateRecipeSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  yield: z.number().positive().optional(),
  yieldUnit: z.string().min(1).optional(),
  preparationTime: z.number().int().positive().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateIngredientSchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export class RecipeController {
  private service: RecipeService;

  constructor() {
    this.service = new RecipeService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, isActive, search } = req.query;

      const filters: any = {};

      if (category) {
        filters.category = category as string;
      }

      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      if (search) {
        filters.search = search as string;
      }

      const recipes = await this.service.getAll(filters);

      res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const recipe = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createRecipeSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const recipe = await this.service.create(validation.data);

      res.status(201).json({
        success: true,
        data: recipe,
        message: 'Receita criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateRecipeSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const recipe = await this.service.update(id, validation.data);

      res.status(200).json({
        success: true,
        data: recipe,
        message: 'Receita atualizada com sucesso',
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
        message: 'Receita excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  calculateCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const cost = await this.service.calculateAndUpdateCosts(id);

      res.status(200).json({
        success: true,
        data: cost,
        message: 'Custo calculado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  addIngredient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = recipeIngredientSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      await this.service.addIngredient(id, validation.data);

      res.status(200).json({
        success: true,
        message: 'Ingrediente adicionado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  updateIngredient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, ingredientId } = req.params;
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

      await this.service.updateIngredient(id, ingredientId, validation.data);

      res.status(200).json({
        success: true,
        message: 'Ingrediente atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  removeIngredient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, ingredientId } = req.params;
      await this.service.removeIngredient(id, ingredientId);

      res.status(200).json({
        success: true,
        message: 'Ingrediente removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  duplicate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim().length < 3) {
        throw new ValidationError('Nome inválido', {
          name: ['Nome deve ter no mínimo 3 caracteres'],
        });
      }

      const recipe = await this.service.duplicate(id, name);

      res.status(201).json({
        success: true,
        data: recipe,
        message: 'Receita duplicada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
