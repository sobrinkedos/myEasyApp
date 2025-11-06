import prisma from '@/config/database';
import { StockItem, StockMovement, Prisma } from '@prisma/client';
import type { CreateStockItemDTO, UpdateStockItemDTO, CreateStockMovementDTO } from '@/models/stock.model';

export class StockRepository {
  // Stock Items
  async findAll(establishmentId: string, filters?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: StockItem[]; total: number }> {
    const where: Prisma.StockItemWhereInput = {
      establishmentId,
      isActive: true,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.stockItem.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string, establishmentId: string): Promise<StockItem | null> {
    return prisma.stockItem.findFirst({
      where: { id, establishmentId },
    });
  }

  async findByBarcode(barcode: string, establishmentId: string): Promise<StockItem | null> {
    return prisma.stockItem.findFirst({
      where: { barcode, establishmentId },
    });
  }

  async findBySku(sku: string, establishmentId: string): Promise<StockItem | null> {
    return prisma.stockItem.findFirst({
      where: { sku, establishmentId },
    });
  }

  async create(data: CreateStockItemDTO & { establishmentId: string }): Promise<StockItem> {
    return prisma.stockItem.create({
      data: {
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });
  }

  async update(id: string, data: UpdateStockItemDTO): Promise<StockItem> {
    return prisma.stockItem.update({
      where: { id },
      data: {
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      },
    });
  }

  async delete(id: string): Promise<StockItem> {
    return prisma.stockItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateQuantity(id: string, quantity: number): Promise<StockItem> {
    return prisma.stockItem.update({
      where: { id },
      data: { currentQuantity: quantity },
    });
  }

  async updateStatus(id: string, status: string): Promise<StockItem> {
    return prisma.stockItem.update({
      where: { id },
      data: { status },
    });
  }

  // Stock Movements
  async createMovement(data: CreateStockMovementDTO & { userId: string }): Promise<StockMovement> {
    const totalCost = data.costPrice && data.quantity 
      ? data.costPrice * data.quantity 
      : null;

    return prisma.stockMovement.create({
      data: {
        ...data,
        totalCost,
      },
    });
  }

  async findMovements(stockItemId: string, limit = 50): Promise<StockMovement[]> {
    return prisma.stockMovement.findMany({
      where: { stockItemId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
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

  async findAllMovements(establishmentId: string, filters?: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ movements: any[]; total: number }> {
    const where: any = {
      stockItem: {
        establishmentId,
      },
    };

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
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total };
  }

  // Dashboard stats
  async getStats(establishmentId: string): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    expiringSoon: number;
  }> {
    const items = await prisma.stockItem.findMany({
      where: { establishmentId, isActive: true },
    });

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => {
      return sum + (Number(item.currentQuantity) * Number(item.costPrice));
    }, 0);
    const lowStockItems = items.filter(item => 
      Number(item.currentQuantity) <= Number(item.minimumQuantity)
    ).length;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoon = items.filter(item => 
      item.expirationDate && 
      item.expirationDate <= thirtyDaysFromNow &&
      item.expirationDate > new Date()
    ).length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      expiringSoon,
    };
  }
}
