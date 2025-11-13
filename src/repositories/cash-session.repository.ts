import prisma from '@/config/database';
import { CashSession, CashSessionStatus, Prisma } from '@prisma/client';

export interface CreateCashSessionDTO {
  cashRegisterId: string;
  operatorId: string;
  openingAmount: number;
}

export interface UpdateCashSessionDTO {
  expectedAmount?: number;
  countedAmount?: number;
  difference?: number;
  status?: CashSessionStatus;
  closedAt?: Date;
  transferredAt?: Date;
  receivedAt?: Date;
  treasurerUserId?: string;
  notes?: string;
  reopenReason?: string;
}

export interface SessionFilters {
  status?: CashSessionStatus;
  operatorId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class CashSessionRepository {
  async create(data: CreateCashSessionDTO): Promise<CashSession> {
    return prisma.cashSession.create({
      data: {
        ...data,
        status: CashSessionStatus.OPEN,
      },
      include: {
        cashRegister: true,
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<CashSession | null> {
    return prisma.cashSession.findUnique({
      where: { id },
      include: {
        cashRegister: true,
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        treasurer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          orderBy: { timestamp: 'desc' },
        },
        counts: true,
        transfer: true,
      },
    });
  }

  async findActiveByOperator(operatorId: string): Promise<CashSession | null> {
    return prisma.cashSession.findFirst({
      where: {
        operatorId,
        status: CashSessionStatus.OPEN,
      },
      include: {
        cashRegister: true,
        transactions: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: UpdateCashSessionDTO): Promise<CashSession> {
    return prisma.cashSession.update({
      where: { id },
      data,
      include: {
        cashRegister: true,
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        treasurer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findMany(filters: SessionFilters): Promise<{
    sessions: CashSession[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, operatorId, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: Prisma.CashSessionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) {
        where.openedAt.gte = startDate;
      }
      if (endDate) {
        where.openedAt.lte = endDate;
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        include: {
          cashRegister: true,
          operator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          treasurer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashSession.count({ where }),
    ]);

    return {
      sessions,
      total,
      page,
      limit,
    };
  }
}

export const cashSessionRepository = new CashSessionRepository();
