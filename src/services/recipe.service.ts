import {
  RecipeRepository,
  CreateRecipeDTO,
  UpdateRecipeDTO,
  RecipeWithIngredients,
  CreateRecipeIngredientDTO,
} from '@/repositories/recipe.repository';
import { IngredientRepository } from '@/repositories/ingredient.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { Recipe } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface RecipeCost {
  totalCost: number;
  costPerPortion: number;
  ingredients: {
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
}

export class RecipeService {
  private repository: RecipeRepository;
  private ingredientRepository: IngredientRepository;

  constructor() {
    this.repository = new RecipeRepository();
    this.ingredientRepository = new IngredientRepository();
  }

  async getAll(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<RecipeWithIngredients[]> {
    return this.repository.findAll(filters);
  }

  async getById(id: string): Promise<RecipeWithIngredients> {
    const recipe = await this.repository.findById(id);

    if (!recipe) {
      throw new NotFoundError('Receita');
    }

    return recipe;
  }

  async create(data: CreateRecipeDTO): Promise<Recipe> {
    // Validate ingredients exist
    for (const ing of data.ingredients) {
      const ingredient = await this.ingredientRepository.findById(ing.ingredientId);
      if (!ingredient) {
        throw new NotFoundError(`Ingrediente ${ing.ingredientId}`);
      }
    }

    // Validate yield
    if (data.yield <= 0) {
      throw new ValidationError('Rendimento inválido', {
        yield: ['Rendimento deve ser maior que zero'],
      });
    }

    // Create recipe
    const recipe = await this.repository.create(data);

    // Calculate costs
    await this.calculateAndUpdateCosts(recipe.id);

    // Return updated recipe
    return this.repository.findById(recipe.id) as Promise<Recipe>;
  }

  async update(id: string, data: UpdateRecipeDTO & { ingredients?: CreateRecipeIngredientDTO[] }): Promise<Recipe> {
    // Check if recipe exists
    await this.getById(id);

    // Validate yield if provided
    if (data.yield !== undefined && data.yield <= 0) {
      throw new ValidationError('Rendimento inválido', {
        yield: ['Rendimento deve ser maior que zero'],
      });
    }

    // Extract ingredients from data
    const { ingredients, ...recipeData } = data;

    // Update recipe basic data
    const recipe = await this.repository.update(id, recipeData);

    // Update ingredients if provided
    if (ingredients && ingredients.length > 0) {
      // Remove all existing ingredients
      const existingRecipe = await this.getById(id);
      for (const ing of existingRecipe.ingredients) {
        await this.repository.removeIngredient(id, ing.ingredientId);
      }

      // Add new ingredients
      for (const ingredient of ingredients) {
        // Validate ingredient exists
        const ing = await this.ingredientRepository.findById(ingredient.ingredientId);
        if (!ing) {
          throw new NotFoundError(`Ingrediente ${ingredient.ingredientId}`);
        }

        // Validate quantity
        if (ingredient.quantity <= 0) {
          throw new ValidationError('Quantidade inválida', {
            quantity: ['Quantidade deve ser maior que zero'],
          });
        }

        await this.repository.addIngredient(id, ingredient);
      }

      // Recalculate costs
      await this.calculateAndUpdateCosts(id);
    } else if (data.yield !== undefined) {
      // Recalculate costs if yield changed
      await this.calculateAndUpdateCosts(id);
    }

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    // Check if recipe exists
    await this.getById(id);

    // Check if recipe is used in products
    // TODO: Implement check when Product service is ready

    await this.repository.delete(id);
  }

  async addIngredient(
    recipeId: string,
    ingredient: CreateRecipeIngredientDTO
  ): Promise<void> {
    // Check if recipe exists
    await this.getById(recipeId);

    // Check if ingredient exists
    const ing = await this.ingredientRepository.findById(ingredient.ingredientId);
    if (!ing) {
      throw new NotFoundError('Ingrediente');
    }

    // Validate quantity
    if (ingredient.quantity <= 0) {
      throw new ValidationError('Quantidade inválida', {
        quantity: ['Quantidade deve ser maior que zero'],
      });
    }

    // Add ingredient
    await this.repository.addIngredient(recipeId, ingredient);

    // Recalculate costs
    await this.calculateAndUpdateCosts(recipeId);
  }

  async updateIngredient(
    recipeId: string,
    ingredientId: string,
    data: { quantity?: number; unit?: string; notes?: string }
  ): Promise<void> {
    // Check if recipe exists
    await this.getById(recipeId);

    // Validate quantity if provided
    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new ValidationError('Quantidade inválida', {
        quantity: ['Quantidade deve ser maior que zero'],
      });
    }

    // Update ingredient
    await this.repository.updateIngredient(recipeId, ingredientId, data);

    // Recalculate costs if quantity changed
    if (data.quantity !== undefined) {
      await this.calculateAndUpdateCosts(recipeId);
    }
  }

  async removeIngredient(recipeId: string, ingredientId: string): Promise<void> {
    // Check if recipe exists
    await this.getById(recipeId);

    // Remove ingredient
    await this.repository.removeIngredient(recipeId, ingredientId);

    // Recalculate costs
    await this.calculateAndUpdateCosts(recipeId);
  }

  async calculateCost(recipeId: string): Promise<RecipeCost> {
    const recipe = await this.getById(recipeId);

    let totalCost = 0;
    const ingredientCosts = [];

    for (const recipeIng of recipe.ingredients) {
      const ingredient = recipeIng.ingredient;
      const quantity = Number(recipeIng.quantity);
      const unitCost = Number(ingredient.averageCost);

      // Convert units if necessary (simplified - assumes same unit)
      // TODO: Implement unit conversion
      const cost = quantity * unitCost;

      totalCost += cost;

      ingredientCosts.push({
        ingredientId: ingredient.id,
        name: ingredient.name,
        quantity,
        unit: recipeIng.unit,
        unitCost,
        totalCost: cost,
      });
    }

    const yieldValue = Number(recipe.yield);
    const costPerPortion = yieldValue > 0 ? totalCost / yieldValue : 0;

    return {
      totalCost,
      costPerPortion,
      ingredients: ingredientCosts,
    };
  }

  async calculateAndUpdateCosts(recipeId: string): Promise<RecipeCost> {
    const cost = await this.calculateCost(recipeId);

    // Update recipe costs
    await this.repository.updateCosts(recipeId, cost.totalCost, cost.costPerPortion);

    // Update individual ingredient costs
    const recipe = await this.getById(recipeId);
    for (const ing of cost.ingredients) {
      await this.repository.updateIngredientCost(recipeId, ing.ingredientId, ing.totalCost);
    }

    return cost;
  }

  async duplicate(id: string, newName: string): Promise<Recipe> {
    const original = await this.getById(id);

    const newRecipe: CreateRecipeDTO = {
      name: newName,
      description: original.description || undefined,
      category: original.category,
      yield: Number(original.yield),
      yieldUnit: original.yieldUnit,
      preparationTime: original.preparationTime || undefined,
      instructions: original.instructions || undefined,
      imageUrl: original.imageUrl || undefined,
      ingredients: original.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: Number(ing.quantity),
        unit: ing.unit,
        notes: ing.notes || undefined,
      })),
    };

    return this.create(newRecipe);
  }

  async updateCostsForIngredient(ingredientId: string): Promise<void> {
    // Find all recipes that use this ingredient
    const recipes = await this.repository.getRecipesByIngredient(ingredientId);

    // Recalculate costs for each recipe
    for (const recipe of recipes) {
      await this.calculateAndUpdateCosts(recipe.id);
    }
  }
}
