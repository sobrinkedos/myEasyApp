import {
  StockRepository,
  CreateStockTransactionDTO,
  StockTransactionFilters,
  PaginatedStockTransactions,
} from '@/repositories/stock.repository';
import { IngredientRepository } from '@/repositories/ingredient.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { StockTransaction } from '@prisma/client';
import prisma from '@/config/database';

export class StockService {
  private repository: StockRepository;
  private ingredientRepository: IngredientRepository;

  constructor() {
    this.repository = new StockRepository();
    this.ingredientRepository = new IngredientRepository();
  }

  async createTransaction(
    data: Omit<CreateStockTransactionDTO, 'userId'>,
    userId: string
  ): Promise<StockTransaction> {
    // Validate ingredient exists
    const ingredient = await this.ingredientRepository.findById(data.ingredientId);

    if (!ingredient) {
      throw new NotFoundError('Insumo');
    }

    // Validate quantity
    if (data.quantity <= 0) {
      throw new ValidationError('Quantidade inválida', {
        quantity: ['Quantidade deve ser maior que zero'],
      });
    }

    // Calculate new quantity
    let newQuantity = Number(ingredient.currentQuantity);

    if (data.type === 'in') {
      newQuantity += data.quantity;
    } else if (data.type === 'out') {
      newQuantity -= data.quantity;

      // Check if there's enough stock
      if (newQuantity < 0) {
        throw new ValidationError('Quantidade insuficiente em estoque', {
          quantity: [
            `Estoque atual: ${ingredient.currentQuantity} ${ingredient.unit}. Tentando retirar: ${data.quantity} ${ingredient.unit}`,
          ],
        });
      }
    } else if (data.type === 'adjustment') {
      newQuantity = data.quantity;
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create stock transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          ...data,
          userId,
        },
        include: {
          ingredient: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update ingredient quantity
      await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          currentQuantity: newQuantity,
          status: this.calculateStatus(newQuantity, Number(ingredient.minimumQuantity)),
        },
      });

      return transaction;
    });

    return result;
  }

  async getTransactions(filters: StockTransactionFilters): Promise<PaginatedStockTransactions> {
    return this.repository.findTransactions(filters);
  }

  async getTransactionsByIngredient(ingredientId: string): Promise<StockTransaction[]> {
    // Validate ingredient exists
    const ingredient = await this.ingredientRepository.findById(ingredientId);

    if (!ingredient) {
      throw new NotFoundError('Insumo');
    }

    return this.repository.findByIngredient(ingredientId);
  }

  private calculateStatus(currentQuantity: number, minimumQuantity: number): string {
    if (currentQuantity === 0) return 'out_of_stock';
    if (currentQuantity <= minimumQuantity) return 'low';
    return 'normal';
  }
}
