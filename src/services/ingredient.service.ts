import {
  IngredientRepository,
  CreateIngredientDTO,
  UpdateIngredientDTO,
} from '@/repositories/ingredient.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { Ingredient } from '@prisma/client';
import prisma from '@/config/database';

const VALID_UNITS = ['kg', 'g', 'l', 'ml', 'un'];

export class IngredientService {
  private repository: IngredientRepository;

  constructor() {
    this.repository = new IngredientRepository();
  }

  async getAll(): Promise<Ingredient[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Ingredient> {
    const ingredient = await this.repository.findById(id);

    if (!ingredient) {
      throw new NotFoundError('Insumo');
    }

    return ingredient;
  }

  async create(data: CreateIngredientDTO): Promise<Ingredient> {
    // Validate unit
    if (!VALID_UNITS.includes(data.unit)) {
      throw new ValidationError('Unidade de medida inválida', {
        unit: [`Unidade deve ser uma das seguintes: ${VALID_UNITS.join(', ')}`],
      });
    }

    return this.repository.create(data);
  }

  async update(id: string, data: UpdateIngredientDTO): Promise<Ingredient> {
    // Check if ingredient exists
    await this.getById(id);

    // Validate unit if provided
    if (data.unit && !VALID_UNITS.includes(data.unit)) {
      throw new ValidationError('Unidade de medida inválida', {
        unit: [`Unidade deve ser uma das seguintes: ${VALID_UNITS.join(', ')}`],
      });
    }

    return this.repository.update(id, data);
  }

  async linkToProduct(ingredientId: string, productId: string, quantity: number): Promise<void> {
    // Validate ingredient exists
    await this.getById(ingredientId);

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Produto');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new ValidationError('Quantidade inválida', {
        quantity: ['Quantidade deve ser maior que zero'],
      });
    }

    // Create or update link
    await prisma.productIngredient.upsert({
      where: {
        productId_ingredientId: {
          productId,
          ingredientId,
        },
      },
      create: {
        productId,
        ingredientId,
        quantity,
      },
      update: {
        quantity,
      },
    });
  }
}
