import prisma from '@/config/database';
import { CMVPeriod, CMVProduct, Prisma } from '@prisma/client';

export interface CreatePeriodDTO {
  startDate: Date;
  endDate: Date;
  type: string;
  openingStock?: number;
}

export interface UpdatePeriodDTO {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  openingStock?: number;
  purchases?: number;
  closingStock?: number;
  cmv?: number;
  revenue?: number;
  cmvPercentage?: number;
  status?: string;
  closedAt?: Date;
}

export interface PeriodFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
}

export interface CreateProductDTO {
  productId: string;
  quantitySold?: number;
  revenue?: number;
  cost?: number;
  cmv?: number;
  margin?: number;
  marginPercentage?: number;
}

export interface UpdateProductDTO {
  quantitySold?: number;
  revenue?: number;
  cost?: number;
  cmv?: number;
  margin?: number;
  marginPercentage?: number;
}

export type PeriodWithProducts = CMVPeriod & {
  products: (CMVProduct & {
    product: {
      id: string;
      name: string;
      price: number;
    };
  })[];
};

export class CMVRepository {
  async create(data: CreatePeriodDTO): Promise<CMVPeriod> {
    return prisma.cMVPeriod.create({
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        openingStock: data.openingStock || 0,
        status: 'open',
      },
    });
  }

  async findAll(filters?: PeriodFilters): Promise<PeriodWithProducts[]> {
    const where: Prisma.CMVPeriodWhereInput = {};

    if (filters) {
      if (filters.startDate || filters.endDate) {
        where.AND = [];
        
        if (filters.startDate) {
          where.AND.push({
            endDate: {
              gte: filters.startDate,
            },
          });
        }
        
        if (filters.endDate) {
          where.AND.push({
            startDate: {
              lte: filters.endDate,
            },
          });
        }
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }
    }

    return prisma.cMVPeriod.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string): Promise<PeriodWithProducts | null> {
    return prisma.cMVPeriod.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdatePeriodDTO): Promise<CMVPeriod> {
    return prisma.cMVPeriod.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.cMVPeriod.delete({
      where: { id },
    });
  }

  async addProduct(periodId: string, data: CreateProductDTO): Promise<CMVProduct> {
    return prisma.cMVProduct.create({
      data: {
        periodId,
        productId: data.productId,
        quantitySold: data.quantitySold || 0,
        revenue: data.revenue || 0,
        cost: data.cost || 0,
        cmv: data.cmv || 0,
        margin: data.margin || 0,
        marginPercentage: data.marginPercentage || 0,
      },
    });
  }

  async updateProduct(
    periodId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<CMVProduct> {
    return prisma.cMVProduct.update({
      where: {
        periodId_productId: {
          periodId,
          productId,
        },
      },
      data,
    });
  }

  async findProductsByPeriodId(periodId: string): Promise<CMVProduct[]> {
    return prisma.cMVProduct.findMany({
      where: { periodId },
      include: {
        product: true,
      },
    });
  }

  async findOpenPeriod(): Promise<CMVPeriod | null> {
    return prisma.cMVPeriod.findFirst({
      where: { status: 'open' },
    });
  }

  async findOverlappingPeriods(
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<CMVPeriod[]> {
    const where: Prisma.CMVPeriodWhereInput = {
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return prisma.cMVPeriod.findMany({ where });
  }
}
