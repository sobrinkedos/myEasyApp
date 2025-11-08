import { IngredientRepository } from '@/repositories/ingredient.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { StockTransactionRepository } from '@/repositories/stock-transaction.repository';
import { Order } from '@prisma/client';
import { BadRequestError } from '@/utils/errors';

export interface StockDeductionItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  productName: string;
}

export interface InsufficientStockItem {
  ingredientId: string;
  ingredientName: string;
  required: number;
  available: number;
}

export interface StockDeductionResult {
  success: boolean;
  deductedItems: StockDeductionItem[];
  insufficientItems: InsufficientStockItem[];
}

export class StockIntegrationService {
  private ingredientRepository: IngredientRepository;
  private productRepository: ProductRepository;
  private stockTransactionRepository: StockTransactionRepository;

  constructor() {
    this.ingredientRepository = new IngredientRepository();
    this.productRepository = new ProductRepository();
    this.stockTransactionRepository = new StockTransactionRepository();
  }

  async checkStockAvailability(order: any): Promise<StockDeductionResult> {
    const deductionItems: StockDeductionItem[] = [];
    const insufficientItems: InsufficientStockItem[] = [];

    // For each item in the order
    for (const orderItem of order.items) {
      const product = await this.productRepository.findById(orderItem.productId);

      if (!product) {
        continue;
      }

      // Check if product has a recipe
      if (product.recipe && product.recipe.ingredients) {
        // Use recipe ingredients
        for (const recipeIngredient of product.recipe.ingredients) {
          const requiredQuantity = Number(recipeIngredient.quantity) * orderItem.quantity;
          const ingredient = await this.ingredientRepository.findById(
            recipeIngredient.ingredientId
          );

          if (!ingredient) {
            continue;
          }

          const availableQuantity = Number(ingredient.currentQuantity);

          if (availableQuantity < requiredQuantity) {
            insufficientItems.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              required: requiredQuantity,
              available: availableQuantity,
            });
          } else {
            deductionItems.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              quantity: requiredQuantity,
              productName: product.name,
            });
          }
        }
      } else if (product.ingredients && product.ingredients.length > 0) {
        // Use direct product ingredients
        for (const productIngredient of product.ingredients) {
          const requiredQuantity = Number(productIngredient.quantity) * orderItem.quantity;
          const ingredient = await this.ingredientRepository.findById(
            productIngredient.ingredientId
          );

          if (!ingredient) {
            continue;
          }

          const availableQuantity = Number(ingredient.currentQuantity);

          if (availableQuantity < requiredQuantity) {
            insufficientItems.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              required: requiredQuantity,
              available: availableQuantity,
            });
          } else {
            deductionItems.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              quantity: requiredQuantity,
              productName: product.name,
            });
          }
        }
      }
    }

    return {
      success: insufficientItems.length === 0,
      deductedItems,
      insufficientItems,
    };
  }

  async deductStockForOrder(order: any, userId: string): Promise<StockDeductionResult> {
    // First check availability
    const availabilityCheck = await this.checkStockAvailability(order);

    if (!availabilityCheck.success) {
      return availabilityCheck;
    }

    // Group deductions by ingredient to avoid multiple transactions for same ingredient
    const deductionMap = new Map<string, StockDeductionItem>();

    for (const item of availabilityCheck.deductedItems) {
      const existing = deductionMap.get(item.ingredientId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        deductionMap.set(item.ingredientId, { ...item });
      }
    }

    // Deduct stock and create transactions
    const transactions = [];

    for (const [ingredientId, deduction] of deductionMap) {
      const ingredient = await this.ingredientRepository.findById(ingredientId);

      if (!ingredient) {
        continue;
      }

      // Update ingredient quantity
      const newQuantity = Number(ingredient.currentQuantity) - deduction.quantity;
      await this.ingredientRepository.updateQuantity(ingredientId, newQuantity);

      // Create stock transaction
      transactions.push({
        ingredientId,
        type: 'out',
        quantity: deduction.quantity,
        reason: `Pedido ${order.id} - ${deduction.productName}`,
        userId,
        unitCost: Number(ingredient.averageCost),
      });
    }

    // Create all transactions
    if (transactions.length > 0) {
      await this.stockTransactionRepository.createMany(transactions);
    }

    return {
      success: true,
      deductedItems: Array.from(deductionMap.values()),
      insufficientItems: [],
    };
  }
}
