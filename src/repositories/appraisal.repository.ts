import prisma from '@/config/database';
import { StockAppraisal, StockAppraisalItem, Prisma } from '@prisma/client';

export interface CreateAppraisalDTO {
  date: Date;
  type: string;
  userId: string;
  notes?: string;
}

export interface UpdateAppraisalDTO {
  date?: Date;
  type?: string;
  notes?: string;
  totalTheoretical?: number;
  totalPhysical?: number;
  totalDifference?: number;
  accuracy?: number;
  status?: string;
  completedAt?: Date;
}

export interface AppraisalFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
  userId?: string;
}

export interface CreateAppraisalItemDTO {
  ingredientId: string;
  theoreticalQuantity: number;
  unitCost: number;
}

export interface UpdateAppraisalItemDTO {
  physicalQuantity?: number;
  reason?: string;
  notes?: string;
}

export type AppraisalWithItems = StockAppraisal & {
  items: (StockAppraisalItem & {
    ingredient: {
      id: string;
      name: string;
      unit: string;
    };
  })[];
  user: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export class AppraisalRepository {
  async create(data: CreateAppraisalDTO): Promise<StockAppraisal> {
    return prisma.stockAppraisal.create({
      data: {
        date: data.date,
        type: data.type,
        userId: data.userId,
        notes: data.notes,
        status: 'pending',
      },
    });
  }

  async findAll(filters?: AppraisalFilters): Promise<AppraisalWithItems[]> {
    const where: Prisma.StockAppraisalWhereInput = {};

    if (filters) {
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }
    }

    return prisma.stockAppraisal.findMany({
      where,
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string): Promise<AppraisalWithItems | null> {
    return prisma.stockAppraisal.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateAppraisalDTO): Promise<StockAppraisal> {
    return prisma.stockAppraisal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.stockAppraisal.delete({
      where: { id },
    });
  }

  async addItem(
    appraisalId: string,
    data: CreateAppraisalItemDTO
  ): Promise<StockAppraisalItem> {
    return prisma.stockAppraisalItem.create({
      data: {
        appraisalId,
        ingredientId: data.ingredientId,
        theoreticalQuantity: data.theoreticalQuantity,
        unitCost: data.unitCost,
      },
    });
  }

  async updateItem(
    appraisalId: string,
    ingredientId: string,
    data: UpdateAppraisalItemDTO
  ): Promise<StockAppraisalItem> {
    // Calculate difference and percentage if physicalQuantity is provided
    const item = await prisma.stockAppraisalItem.findUnique({
      where: {
        appraisalId_ingredientId: {
          appraisalId,
          ingredientId,
        },
      },
    });

    if (!item) {
      throw new Error('Appraisal item not found');
    }

    const updateData: Prisma.StockAppraisalItemUpdateInput = {
      ...data,
    };

    if (data.physicalQuantity !== undefined) {
      const difference = data.physicalQuantity - Number(item.theoreticalQuantity);
      const differencePercentage =
        Number(item.theoreticalQuantity) > 0
          ? (difference / Number(item.theoreticalQuantity)) * 100
          : 0;
      const totalDifference = difference * Number(item.unitCost);

      updateData.difference = difference;
      updateData.differencePercentage = differencePercentage;
      updateData.totalDifference = totalDifference;
    }

    return prisma.stockAppraisalItem.update({
      where: {
        appraisalId_ingredientId: {
          appraisalId,
          ingredientId,
        },
      },
      data: updateData,
    });
  }

  async removeItem(appraisalId: string, ingredientId: string): Promise<void> {
    await prisma.stockAppraisalItem.delete({
      where: {
        appraisalId_ingredientId: {
          appraisalId,
          ingredientId,
        },
      },
    });
  }

  async findItemsByAppraisalId(appraisalId: string): Promise<StockAppraisalItem[]> {
    return prisma.stockAppraisalItem.findMany({
      where: { appraisalId },
      include: {
        ingredient: true,
      },
    });
  }
}
