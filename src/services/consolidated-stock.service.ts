import prisma from '@/config/database';
import { Decimal } from '@prisma/client/runtime/library';

export interface ConsolidatedStockItem {
  id: string;
  type: 'ingredient' | 'stock_item';
  name: string;
  description?: string;
  currentQuantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  status: string;
  category?: string;
  barcode?: string;
  sku?: string;
  location?: string;
  minimumQuantity: number;
  maximumQuantity?: number;
}

export interface ConsolidatedStockSummary {
  totalItems: number;
  totalIngredients: number;
  totalStockItems: number;
  totalValue: number;
  ingredientsValue: number;
  stockItemsValue: number;
  lowStockCount: number;
  expiringCount: number;
}

export interface ConsolidatedStockResponse {
  ingredients: ConsolidatedStockItem[];
  stockItems: ConsolidatedStockItem[];
  summary: ConsolidatedStockSummary;
}

export class ConsolidatedStockService {
  /**
   * Get all stock items (ingredients + stock items) consolidated
   */
  async getAll(establishmentId: string, filters?: {
    type?: 'ingredient' | 'stock_item' | 'all';
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ConsolidatedStockResponse> {
    const includeIngredients = !filters?.type || filters.type === 'ingredient' || filters.type === 'all';
    const includeStockItems = !filters?.type || filters.type === 'stock_item' || filters.type === 'all';

    // Fetch ingredients
    const ingredients = includeIngredients ? await prisma.ingredient.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { barcode: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
    }) : [];

    // Fetch stock items
    const stockItems = includeStockItems ? await prisma.stockItem.findMany({
      where: {
        establishmentId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { barcode: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
    }) : [];

    // Transform ingredients
    const consolidatedIngredients: ConsolidatedStockItem[] = ingredients.map(ing => ({
      id: ing.id,
      type: 'ingredient' as const,
      name: ing.name,
      description: ing.description || undefined,
      currentQuantity: Number(ing.currentQuantity),
      unit: ing.unit,
      unitCost: Number(ing.averageCost),
      totalValue: Number(ing.currentQuantity) * Number(ing.averageCost),
      status: ing.status,
      barcode: ing.barcode || undefined,
      sku: ing.sku || undefined,
      location: ing.location || undefined,
      minimumQuantity: Number(ing.minimumQuantity),
      maximumQuantity: ing.maximumQuantity ? Number(ing.maximumQuantity) : undefined,
    }));

    // Transform stock items
    const consolidatedStockItems: ConsolidatedStockItem[] = stockItems.map(item => ({
      id: item.id,
      type: 'stock_item' as const,
      name: item.name,
      description: item.description || undefined,
      currentQuantity: Number(item.currentQuantity),
      unit: item.unit,
      unitCost: Number(item.costPrice),
      totalValue: Number(item.currentQuantity) * Number(item.costPrice),
      status: item.status,
      category: item.category,
      barcode: item.barcode || undefined,
      sku: item.sku || undefined,
      location: item.location || undefined,
      minimumQuantity: Number(item.minimumQuantity),
      maximumQuantity: item.maximumQuantity ? Number(item.maximumQuantity) : undefined,
    }));

    // Calculate summary
    const ingredientsValue = consolidatedIngredients.reduce((sum, item) => sum + item.totalValue, 0);
    const stockItemsValue = consolidatedStockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = [
      ...consolidatedIngredients.filter(i => i.status === 'baixo'),
      ...consolidatedStockItems.filter(i => i.status === 'baixo'),
    ].length;
    const expiringCount = [
      ...consolidatedIngredients.filter(i => i.status === 'vencendo'),
      ...consolidatedStockItems.filter(i => i.status === 'vencendo'),
    ].length;

    const summary: ConsolidatedStockSummary = {
      totalItems: consolidatedIngredients.length + consolidatedStockItems.length,
      totalIngredients: consolidatedIngredients.length,
      totalStockItems: consolidatedStockItems.length,
      totalValue: ingredientsValue + stockItemsValue,
      ingredientsValue,
      stockItemsValue,
      lowStockCount,
      expiringCount,
    };

    return {
      ingredients: consolidatedIngredients,
      stockItems: consolidatedStockItems,
      summary,
    };
  }

  /**
   * Get total stock value for a specific date (for CMV calculation)
   */
  async getStockValueAtDate(establishmentId: string, date: Date): Promise<{
    ingredientsValue: number;
    stockItemsValue: number;
    totalValue: number;
  }> {
    // For ingredients: sum of (currentQuantity * averageCost)
    const ingredients = await prisma.ingredient.findMany({
      where: {
        createdAt: { lte: date },
      },
      select: {
        currentQuantity: true,
        averageCost: true,
      },
    });

    const ingredientsValue = ingredients.reduce(
      (sum, ing) => sum + Number(ing.currentQuantity) * Number(ing.averageCost),
      0
    );

    // For stock items: sum of (currentQuantity * costPrice)
    const stockItems = await prisma.stockItem.findMany({
      where: {
        establishmentId,
        createdAt: { lte: date },
      },
      select: {
        currentQuantity: true,
        costPrice: true,
      },
    });

    const stockItemsValue = stockItems.reduce(
      (sum, item) => sum + Number(item.currentQuantity) * Number(item.costPrice),
      0
    );

    return {
      ingredientsValue,
      stockItemsValue,
      totalValue: ingredientsValue + stockItemsValue,
    };
  }

  /**
   * Get purchases value for a period (for CMV calculation)
   */
  async getPurchasesInPeriod(establishmentId: string, startDate: Date, endDate: Date): Promise<{
    ingredientsPurchases: number;
    stockItemsPurchases: number;
    totalPurchases: number;
  }> {
    // Ingredients purchases (from StockTransaction with type 'purchase')
    const ingredientTransactions = await prisma.stockTransaction.findMany({
      where: {
        type: 'purchase',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalValue: true,
      },
    });

    const ingredientsPurchases = ingredientTransactions.reduce(
      (sum, tx) => sum + (tx.totalValue ? Number(tx.totalValue) : 0),
      0
    );

    // Stock items purchases (from StockMovement with type 'entrada')
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        type: 'entrada',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        stockItem: {
          establishmentId,
        },
      },
      select: {
        totalCost: true,
      },
    });

    const stockItemsPurchases = stockMovements.reduce(
      (sum, mov) => sum + (mov.totalCost ? Number(mov.totalCost) : 0),
      0
    );

    return {
      ingredientsPurchases,
      stockItemsPurchases,
      totalPurchases: ingredientsPurchases + stockItemsPurchases,
    };
  }

  /**
   * Get low stock items (both ingredients and stock items)
   */
  async getLowStockItems(establishmentId: string): Promise<ConsolidatedStockItem[]> {
    const { ingredients, stockItems } = await this.getAll(establishmentId, { status: 'baixo' });
    return [...ingredients, ...stockItems];
  }

  /**
   * Get expiring items (both ingredients and stock items)
   */
  async getExpiringItems(establishmentId: string): Promise<ConsolidatedStockItem[]> {
    const { ingredients, stockItems } = await this.getAll(establishmentId, { status: 'vencendo' });
    return [...ingredients, ...stockItems];
  }

  /**
   * Search items by barcode or SKU
   */
  async searchByCode(establishmentId: string, code: string): Promise<ConsolidatedStockItem | null> {
    // Try to find in ingredients
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { barcode: code },
          { sku: code },
        ],
      },
    });

    if (ingredient) {
      return {
        id: ingredient.id,
        type: 'ingredient',
        name: ingredient.name,
        description: ingredient.description || undefined,
        currentQuantity: Number(ingredient.currentQuantity),
        unit: ingredient.unit,
        unitCost: Number(ingredient.averageCost),
        totalValue: Number(ingredient.currentQuantity) * Number(ingredient.averageCost),
        status: ingredient.status,
        barcode: ingredient.barcode || undefined,
        sku: ingredient.sku || undefined,
        location: ingredient.location || undefined,
        minimumQuantity: Number(ingredient.minimumQuantity),
        maximumQuantity: ingredient.maximumQuantity ? Number(ingredient.maximumQuantity) : undefined,
      };
    }

    // Try to find in stock items
    const stockItem = await prisma.stockItem.findFirst({
      where: {
        establishmentId,
        OR: [
          { barcode: code },
          { sku: code },
        ],
      },
    });

    if (stockItem) {
      return {
        id: stockItem.id,
        type: 'stock_item',
        name: stockItem.name,
        description: stockItem.description || undefined,
        currentQuantity: Number(stockItem.currentQuantity),
        unit: stockItem.unit,
        unitCost: Number(stockItem.costPrice),
        totalValue: Number(stockItem.currentQuantity) * Number(stockItem.costPrice),
        status: stockItem.status,
        category: stockItem.category,
        barcode: stockItem.barcode || undefined,
        sku: stockItem.sku || undefined,
        location: stockItem.location || undefined,
        minimumQuantity: Number(stockItem.minimumQuantity),
        maximumQuantity: stockItem.maximumQuantity ? Number(stockItem.maximumQuantity) : undefined,
      };
    }

    return null;
  }
}
