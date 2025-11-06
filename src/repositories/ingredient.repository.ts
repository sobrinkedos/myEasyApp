import prisma from '@/config/database';
import { Ingredient } from '@prisma/client';

export interface CreateIngredientDTO {
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  averageCost: number;
  supplier?: string;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
}

export interface UpdateIngredientDTO {
  name?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  unit?: string;
  currentQuantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  averageCost?: number;
  supplier?: string;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
}

export class IngredientRepository {
  async findAll(): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Ingredient | null> {
    return prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: CreateIngredientDTO): Promise<Ingredient> {
    return prisma.ingredient.create({
      data: {
        ...data,
        status: this.calculateStatus(data.currentQuantity, data.minimumQuantity),
      },
    });
  }

  async update(id: string, data: UpdateIngredientDTO): Promise<Ingredient> {
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });

    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    const currentQuantity = data.currentQuantity ?? ingredient.currentQuantity;
    const minimumQuantity = data.minimumQuantity ?? ingredient.minimumQuantity;

    return prisma.ingredient.update({
      where: { id },
      data: {
        ...data,
        status: this.calculateStatus(Number(currentQuantity), Number(minimumQuantity)),
      },
    });
  }

  async updateQuantity(id: string, quantity: number): Promise<Ingredient> {
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });

    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    return prisma.ingredient.update({
      where: { id },
      data: {
        currentQuantity: quantity,
        status: this.calculateStatus(quantity, Number(ingredient.minimumQuantity)),
      },
    });
  }

  private calculateStatus(currentQuantity: number, minimumQuantity: number): string {
    if (currentQuantity === 0) return 'out_of_stock';
    if (currentQuantity <= minimumQuantity) return 'low';
    return 'normal';
  }
}
