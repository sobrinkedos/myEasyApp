import prisma from '@/config/database';
import { CashCount } from '@prisma/client';

export interface CreateCashCountDTO {
  denomination: number;
  quantity: number;
  total: number;
}

export class CashCountRepository {
  async createMany(sessionId: string, counts: CreateCashCountDTO[]): Promise<CashCount[]> {
    const data = counts.map((count) => ({
      cashSessionId: sessionId,
      ...count,
    }));

    await prisma.cashCount.createMany({
      data,
    });

    return this.findBySession(sessionId);
  }

  async findBySession(sessionId: string): Promise<CashCount[]> {
    return prisma.cashCount.findMany({
      where: { cashSessionId: sessionId },
      orderBy: { denomination: 'desc' },
    });
  }

  async calculateTotal(sessionId: string): Promise<number> {
    const counts = await this.findBySession(sessionId);
    return counts.reduce((sum, count) => sum + Number(count.total), 0);
  }

  async findBySessionId(sessionId: string): Promise<CashCount[]> {
    return this.findBySession(sessionId);
  }
}

export const cashCountRepository = new CashCountRepository();
