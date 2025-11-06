import prisma from '@/config/database';
import { Recipe, RecipeIngredient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateRecipeDTO {
  name: string;
  description?: string;
  category: string;
  yield: number;
  yieldUnit: string;
  preparationTime?: number;
  instructions?: string;
  imageUrl?: string;
  ingredients: CreateRecipeIngredientDTO[];
}

export interface CreateRecipeIngredientDTO {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface UpdateRecipeDTO {
  name?: string;
  description?: string;
  category?: string;
  yield?: number;
  yieldUnit?: string;
  preparationTime?: number;
  instructions?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredient: {
      id: string;
      name: string;
      unit: string;
      averageCost: Decimal;
      imageUrl: string | null;
    };
  })[];
}

export class RecipeRepository {
  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<RecipeWithIngredients[]> {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
                averageCost: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            ingredient: {
              name: 'asc',
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<RecipeWithIngredients | null> {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
                averageCost: true,
                imageUrl: true,
                currentQuantity: true,
                status: true,
              },
            },
          },
          orderBy: {
            ingredient: {
              name: 'asc',
            },
          },
        },
      },
    });
  }

  async create(data: CreateRecipeDTO): Promise<Recipe> {
    const { ingredients, ...recipeData } = data;

    return prisma.recipe.create({
      data: {
        ...recipeData,
        yield: new Decimal(data.yield),
        totalCost: 0,
        costPerPortion: 0,
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: new Decimal(ing.quantity),
            unit: ing.unit,
            cost: 0, // Will be calculated after
            notes: ing.notes,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateRecipeDTO): Promise<Recipe> {
    const updateData: any = { ...data };

    if (data.yield !== undefined) {
      updateData.yield = new Decimal(data.yield);
    }

    // Increment version on update
    updateData.version = {
      increment: 1,
    };

    return prisma.recipe.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Recipe> {
    return prisma.recipe.delete({
      where: { id },
    });
  }

  async addIngredient(
    recipeId: string,
    ingredient: CreateRecipeIngredientDTO
  ): Promise<RecipeIngredient> {
    return prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId: ingredient.ingredientId,
        quantity: new Decimal(ingredient.quantity),
        unit: ingredient.unit,
        cost: 0, // Will be calculated
        notes: ingredient.notes,
      },
    });
  }

  async updateIngredient(
    recipeId: string,
    ingredientId: string,
    data: { quantity?: number; unit?: string; notes?: string }
  ): Promise<RecipeIngredient> {
    const updateData: any = { ...data };

    if (data.quantity !== undefined) {
      updateData.quantity = new Decimal(data.quantity);
    }

    return prisma.recipeIngredient.update({
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
      data: updateData,
    });
  }

  async removeIngredient(recipeId: string, ingredientId: string): Promise<void> {
    await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
    });
  }

  async updateCosts(
    recipeId: string,
    totalCost: number,
    costPerPortion: number
  ): Promise<Recipe> {
    return prisma.recipe.update({
      where: { id: recipeId },
      data: {
        totalCost: new Decimal(totalCost),
        costPerPortion: new Decimal(costPerPortion),
      },
    });
  }

  async updateIngredientCost(
    recipeId: string,
    ingredientId: string,
    cost: number
  ): Promise<RecipeIngredient> {
    return prisma.recipeIngredient.update({
      where: {
        recipeId_ingredientId: {
          recipeId,
          ingredientId,
        },
      },
      data: {
        cost: new Decimal(cost),
      },
    });
  }

  async getRecipesByIngredient(ingredientId: string): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      where: {
        ingredients: {
          some: {
            ingredientId,
          },
        },
      },
    });
  }
}
