import { PrismaClient } from '@prisma/client';
import { CreateStockTransactionData, UpdateStockTransactionData } from '@/models/stock-transaction.model';

const prisma = new PrismaClient();

export class StockTransactionRepository {
  async create(data: CreateStockTransactionData & { userId: string }) {
    return prisma.stockTransaction.create({
      data: {
        ...data,
        totalValue: data.totalValue || (data.unitCost && data.quantity ? data.quantity * data.unitCost : null),
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
    });
  }

  async createMany(transactions: (CreateStockTransactionData & { userId: string })[]) {
    const transactionsWithTotalValue = transactions.map(transaction => ({
      ...transaction,
      totalValue: transaction.totalValue || (transaction.unitCost && transaction.quantity ? transaction.quantity * transaction.unitCost : null),
    }));

    return prisma.stockTransaction.createMany({
      data: transactionsWithTotalValue,
    });
  }

  async findAll(filters?: {
    ingredientId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.ingredientId) {
      where.ingredientId = filters.ingredientId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.stockTransaction.findUnique({
      where: { id },
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
    });
  }

  async findByIngredient(ingredientId: string, limit?: number) {
    return prisma.stockTransaction.findMany({
      where: { ingredientId },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async update(id: string, data: UpdateStockTransactionData) {
    return prisma.stockTransaction.update({
      where: { id },
      data: {
        ...data,
        totalValue: data.totalValue || (data.unitCost && data.quantity ? data.quantity * data.unitCost : undefined),
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
    });
  }

  async delete(id: string) {
    return prisma.stockTransaction.delete({
      where: { id },
    });
  }

  async getTotalPurchasesByPeriod(startDate: Date, endDate: Date) {
    const result = await prisma.stockTransaction.aggregate({
      where: {
        type: 'purchase',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalValue: true,
      },
    });

    return Number(result._sum.totalValue || 0);
  }

  async getPurchasesByIngredientAndPeriod(ingredientId: string, startDate: Date, endDate: Date) {
    return prisma.stockTransaction.findMany({
      where: {
        ingredientId,
        type: 'purchase',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
