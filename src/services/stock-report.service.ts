import prisma from '@/config/database';
import { Ingredient } from '@prisma/client';

export interface StockReport {
  ingredient: Ingredient;
  totalIn: number;
  totalOut: number;
  currentQuantity: number;
}

export interface StockMovementReport {
  startDate: Date;
  endDate: Date;
  transactions: any[];
  summary: {
    totalIn: number;
    totalOut: number;
    totalTransactions: number;
  };
}

export class StockReportService {
  async getCurrentStockReport(): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getLowStockReport(): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({
      where: {
        status: {
          in: ['low', 'out_of_stock'],
        },
      },
      orderBy: { currentQuantity: 'asc' },
    });
  }

  async getMovementReport(startDate: Date, endDate: Date): Promise<StockMovementReport> {
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalIn = transactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + Number(t.quantity), 0);

    const totalOut = transactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + Number(t.quantity), 0);

    return {
      startDate,
      endDate,
      transactions,
      summary: {
        totalIn,
        totalOut,
        totalTransactions: transactions.length,
      },
    };
  }

  async getStockValue(): Promise<{ totalValue: number; ingredients: any[] }> {
    const ingredients = await prisma.ingredient.findMany();

    const ingredientsWithValue = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      currentQuantity: Number(ing.currentQuantity),
      averageCost: Number(ing.averageCost),
      totalValue: Number(ing.currentQuantity) * Number(ing.averageCost),
      unit: ing.unit,
    }));

    const totalValue = ingredientsWithValue.reduce((sum, ing) => sum + ing.totalValue, 0);

    return {
      totalValue,
      ingredients: ingredientsWithValue,
    };
  }
}
