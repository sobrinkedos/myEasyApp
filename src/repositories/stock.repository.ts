import prisma from '@/config/database';
import { StockTransaction, Prisma } from '@prisma/client';

export interface CreateStockTransactionDTO {
  ingredientId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  userId: string;
}

export interface StockTransactionFilters {
  ingredientId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedStockTransactions {
  data: StockTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class StockRepository {
  async createTransaction(data: CreateStockTransactionDTO): Promise<StockTransaction> {
    return prisma.stockTransaction.create({
      data,
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
  }

  async findTransactions(
    filters: StockTransactionFilters
  ): Promise<PaginatedStockTransactions> {
    const { ingredientId, type, startDate, endDate, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.StockTransactionWhereInput = {
      ...(ingredientId && { ingredientId }),
      ...(type && { type }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [data, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIngredient(ingredientId: string): Promise<StockTransaction[]> {
    return prisma.stockTransaction.findMany({
      where: { ingredientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
