import { IngredientRepository } from '@/repositories/ingredient.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { StockItemRepository } from '@/repositories/stock-item.repository';
import { StockTransactionRepository } from '@/repositories/stock-transaction.repository';
import { StockMovementRepository } from '@/repositories/stock-movement.repository';
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

export interface StockItemDeduction {
  stockItemId: string;
  stockItemName: string;
  quantity: number;
}

export interface InsufficientStockItemResale {
  stockItemId: string;
  stockItemName: string;
  required: number;
  available: number;
}

export interface StockDeductionResult {
  success: boolean;
  deductedItems: StockDeductionItem[];
  insufficientItems: InsufficientStockItem[];
  deductedStockItems: StockItemDeduction[];
  insufficientStockItems: InsufficientStockItemResale[];
}

export class StockIntegrationService {
  private ingredientRepository: IngredientRepository;
  private productRepository: ProductRepository;
  private stockItemRepository: StockItemRepository;
  private stockTransactionRepository: StockTransactionRepository;
  private stockMovementRepository: StockMovementRepository;

  constructor() {
    this.ingredientRepository = new IngredientRepository();
    this.productRepository = new ProductRepository();
    this.stockItemRepository = new StockItemRepository();
    this.stockTransactionRepository = new StockTransactionRepository();
    this.stockMovementRepository = new StockMovementRepository();
  }

  async checkStockAvailability(order: any): Promise<StockDeductionResult> {
    const deductionItems: StockDeductionItem[] = [];
    const insufficientItems: InsufficientStockItem[] = [];
    const deductedStockItems: StockItemDeduction[] = [];
    const insufficientStockItems: InsufficientStockItemResale[] = [];

    console.log('StockIntegration - Verificando disponibilidade:', {
      orderId: order.id,
      itemsCount: order.items?.length || 0,
    });

    // For each item in the order
    for (const orderItem of order.items) {
      // Determinar o ID do produto a ser verificado
      let productIdToCheck = orderItem.productId;
      
      console.log('StockIntegration - Processando item:', {
        productId: productIdToCheck,
        stockItemId: orderItem.stockItemId,
        quantity: orderItem.quantity,
      });
      
      // Se for um OrderItem (comanda), pode ter stockItemId separado
      if (orderItem.stockItemId) {
        console.log('StockIntegration - Item é stock item (revenda), verificando estoque');
        
        const stockItem = await this.stockItemRepository.findById(orderItem.stockItemId);
        
        if (!stockItem) {
          console.log('StockIntegration - Stock item não encontrado:', orderItem.stockItemId);
          continue;
        }

        const requiredQuantity = orderItem.quantity;
        const availableQuantity = Number(stockItem.currentQuantity);

        console.log('StockIntegration - Verificando stock item:', {
          stockItemName: stockItem.name,
          required: requiredQuantity,
          available: availableQuantity,
          sufficient: availableQuantity >= requiredQuantity,
        });

        if (availableQuantity < requiredQuantity) {
          insufficientStockItems.push({
            stockItemId: stockItem.id,
            stockItemName: stockItem.name,
            required: requiredQuantity,
            available: availableQuantity,
          });
        } else {
          deductedStockItems.push({
            stockItemId: stockItem.id,
            stockItemName: stockItem.name,
            quantity: requiredQuantity,
          });
        }
        
        continue;
      }

      if (!productIdToCheck) {
        console.log('StockIntegration - Item sem productId, pulando');
        continue;
      }

      // Tentar buscar como produto manufaturado
      const product = await this.productRepository.findById(productIdToCheck);

      if (!product) {
        console.log('StockIntegration - Produto não encontrado como manufaturado, tentando como stock item');
        
        // Tentar buscar como stock item
        const stockItem = await this.stockItemRepository.findById(productIdToCheck);
        
        if (!stockItem) {
          console.log('StockIntegration - Produto não encontrado nem como manufaturado nem como stock item');
          continue;
        }

        const requiredQuantity = orderItem.quantity;
        const availableQuantity = Number(stockItem.currentQuantity);

        console.log('StockIntegration - Verificando stock item (via productId):', {
          stockItemName: stockItem.name,
          required: requiredQuantity,
          available: availableQuantity,
          sufficient: availableQuantity >= requiredQuantity,
        });

        if (availableQuantity < requiredQuantity) {
          insufficientStockItems.push({
            stockItemId: stockItem.id,
            stockItemName: stockItem.name,
            required: requiredQuantity,
            available: availableQuantity,
          });
        } else {
          deductedStockItems.push({
            stockItemId: stockItem.id,
            stockItemName: stockItem.name,
            quantity: requiredQuantity,
          });
        }
        
        continue;
      }

      console.log('StockIntegration - Produto encontrado:', {
        productId: product.id,
        productName: product.name,
        hasRecipe: !!product.recipe,
        hasDirectIngredients: product.ingredients?.length > 0,
        recipeIngredientsCount: product.recipe?.ingredients?.length || 0,
        directIngredientsCount: product.ingredients?.length || 0,
      });

      // Check if product has a recipe
      if (product.recipe && product.recipe.ingredients) {
        console.log('StockIntegration - Usando ingredientes da receita');
        // Use recipe ingredients
        for (const recipeIngredient of product.recipe.ingredients) {
          const requiredQuantity = Number(recipeIngredient.quantity) * orderItem.quantity;
          const ingredient = await this.ingredientRepository.findById(
            recipeIngredient.ingredientId
          );

          if (!ingredient) {
            console.log('StockIntegration - Ingrediente da receita não encontrado:', recipeIngredient.ingredientId);
            continue;
          }

          const availableQuantity = Number(ingredient.currentQuantity);

          console.log('StockIntegration - Verificando ingrediente da receita:', {
            ingredientName: ingredient.name,
            required: requiredQuantity,
            available: availableQuantity,
            sufficient: availableQuantity >= requiredQuantity,
          });

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
        console.log('StockIntegration - Usando ingredientes diretos do produto');
        // Use direct product ingredients
        for (const productIngredient of product.ingredients) {
          const requiredQuantity = Number(productIngredient.quantity) * orderItem.quantity;
          const ingredient = await this.ingredientRepository.findById(
            productIngredient.ingredientId
          );

          if (!ingredient) {
            console.log('StockIntegration - Ingrediente direto não encontrado:', productIngredient.ingredientId);
            continue;
          }

          const availableQuantity = Number(ingredient.currentQuantity);

          console.log('StockIntegration - Verificando ingrediente direto:', {
            ingredientName: ingredient.name,
            required: requiredQuantity,
            available: availableQuantity,
            sufficient: availableQuantity >= requiredQuantity,
          });

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
      } else {
        console.log('StockIntegration - Produto sem receita e sem ingredientes diretos');
      }
    }

    console.log('StockIntegration - Resultado da verificação:', {
      success: insufficientItems.length === 0 && insufficientStockItems.length === 0,
      deductedItemsCount: deductionItems.length,
      insufficientItemsCount: insufficientItems.length,
      deductedStockItemsCount: deductedStockItems.length,
      insufficientStockItemsCount: insufficientStockItems.length,
      deductedItems: deductionItems.map(i => `${i.ingredientName}: ${i.quantity}`),
      insufficientItems: insufficientItems.map(i => `${i.ingredientName}: ${i.required} (disponível: ${i.available})`),
      deductedStockItems: deductedStockItems.map(i => `${i.stockItemName}: ${i.quantity}`),
      insufficientStockItems: insufficientStockItems.map(i => `${i.stockItemName}: ${i.required} (disponível: ${i.available})`),
    });

    return {
      success: insufficientItems.length === 0 && insufficientStockItems.length === 0,
      deductedItems: deductionItems,
      insufficientItems,
      deductedStockItems,
      insufficientStockItems,
    };
  }

  async deductStockForOrder(order: any, userId: string): Promise<StockDeductionResult> {
    console.log('StockIntegration - Iniciando dedução de estoque:', {
      orderId: order.id,
      userId,
    });

    // First check availability
    const availabilityCheck = await this.checkStockAvailability(order);

    if (!availabilityCheck.success) {
      console.log('StockIntegration - Estoque insuficiente, abortando dedução');
      return availabilityCheck;
    }

    console.log('StockIntegration - Estoque suficiente, prosseguindo com dedução');

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

    console.log('StockIntegration - Ingredientes agrupados para dedução:', {
      count: deductionMap.size,
      items: Array.from(deductionMap.values()).map(i => `${i.ingredientName}: ${i.quantity}`),
    });

    // Group stock item deductions
    const stockItemDeductionMap = new Map<string, StockItemDeduction>();

    for (const item of availabilityCheck.deductedStockItems) {
      const existing = stockItemDeductionMap.get(item.stockItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        stockItemDeductionMap.set(item.stockItemId, { ...item });
      }
    }

    console.log('StockIntegration - Stock items agrupados para dedução:', {
      count: stockItemDeductionMap.size,
      items: Array.from(stockItemDeductionMap.values()).map(i => `${i.stockItemName}: ${i.quantity}`),
    });

    // Deduct ingredient stock and create transactions
    const transactions = [];

    for (const [ingredientId, deduction] of deductionMap) {
      const ingredient = await this.ingredientRepository.findById(ingredientId);

      if (!ingredient) {
        console.log('StockIntegration - Ingrediente não encontrado ao deduzir:', ingredientId);
        continue;
      }

      // Update ingredient quantity
      const oldQuantity = Number(ingredient.currentQuantity);
      const newQuantity = oldQuantity - deduction.quantity;
      
      console.log('StockIntegration - Atualizando quantidade de ingrediente:', {
        ingredientName: ingredient.name,
        oldQuantity,
        deduction: deduction.quantity,
        newQuantity,
      });

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

    // Create all ingredient transactions
    if (transactions.length > 0) {
      console.log('StockIntegration - Criando transações de ingredientes:', transactions.length);
      await this.stockTransactionRepository.createMany(transactions);
      console.log('StockIntegration - Transações de ingredientes criadas com sucesso');
    } else {
      console.log('StockIntegration - Nenhuma transação de ingrediente para criar');
    }

    // Deduct stock item quantities and create movements
    const movements = [];

    for (const [stockItemId, deduction] of stockItemDeductionMap) {
      const stockItem = await this.stockItemRepository.findById(stockItemId);

      if (!stockItem) {
        console.log('StockIntegration - Stock item não encontrado ao deduzir:', stockItemId);
        continue;
      }

      // Update stock item quantity
      const oldQuantity = Number(stockItem.currentQuantity);
      const newQuantity = oldQuantity - deduction.quantity;
      
      console.log('StockIntegration - Atualizando quantidade de stock item:', {
        stockItemName: stockItem.name,
        oldQuantity,
        deduction: deduction.quantity,
        newQuantity,
      });

      await this.stockItemRepository.updateQuantity(stockItemId, newQuantity);

      // Create stock movement
      movements.push({
        stockItemId,
        type: 'sale',
        quantity: deduction.quantity,
        costPrice: Number(stockItem.costPrice),
        reason: `Pedido ${order.id}`,
        userId,
      });
    }

    // Create all stock movements
    if (movements.length > 0) {
      console.log('StockIntegration - Criando movimentações de stock items:', movements.length);
      await this.stockMovementRepository.createMany(movements);
      console.log('StockIntegration - Movimentações de stock items criadas com sucesso');
    } else {
      console.log('StockIntegration - Nenhuma movimentação de stock item para criar');
    }

    return {
      success: true,
      deductedItems: Array.from(deductionMap.values()),
      insufficientItems: [],
      deductedStockItems: Array.from(stockItemDeductionMap.values()),
      insufficientStockItems: [],
    };
  }
}
