import { PrismaClient } from '@prisma/client';
import { CreateStockMovementData, UpdateStockMovementData } from '@/models/stock-movement.model';

const prisma = new PrismaClient();

export class StockMovementRepository {
  async create(data: CreateStockMovementData & { userId: string }) {
    return prisma.stockMovement.create({
      data: {
        ...data,
        totalCost: data.totalCost || (data.costPrice && data.quantity ? data.quantity * data.costPrice : undefined),
      },
      include: {
        stockItem: {
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

  async createMany(movements: (CreateStockMovementData & { userId: string })[]) {
    const movementsWithTotalCost = movements.map(movement => ({
      ...movement,
      totalCost: movement.totalCost || (movement.costPrice && movement.quantity ? movement.quantity * movement.costPrice : undefined),
    }));

    return prisma.stockMovement.createMany({
      data: movementsWithTotalCost,
    });
  }

  async findAll(filters?: {
    stockItemId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.stockItemId) {
      where.stockItemId = filters.stockItemId;
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

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          stockItem: {
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
      prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.stockMovement.findUnique({
      where: { id },
      include: {
        stockItem: {
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

  async findByStockItem(stockItemId: string, limit?: number) {
    return prisma.stockMovement.findMany({
      where: { stockItemId },
      include: {
        stockItem: {
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

  async update(id: string, data: UpdateStockMovementData) {
    return prisma.stockMovement.update({
      where: { id },
      data: {
        ...data,
        totalCost: data.totalCost || (data.costPrice && data.quantity ? data.quantity * data.costPrice : undefined),
      },
      include: {
        stockItem: {
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
    return prisma.stockMovement.delete({
      where: { id },
    });
  }

  async getTotalPurchasesByPeriod(startDate: Date, endDate: Date) {
    const result = await prisma.stockMovement.aggregate({
      where: {
        type: 'purchase',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalCost: true,
      },
    });

    return Number(result._sum.totalCost || 0);
  }

  async getPurchasesByStockItemAndPeriod(stockItemId: string, startDate: Date, endDate: Date) {
    return prisma.stockMovement.findMany({
      where: {
        stockItemId,
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
