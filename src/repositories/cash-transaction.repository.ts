import prisma from '@/config/database';
import { CashTransaction, TransactionType, PaymentMethod, Prisma } from '@prisma/client';

export interface CreateCashTransactionDTO {
  cashSessionId: string;
  type: TransactionType;
  paymentMethod?: PaymentMethod;
  amount: number;
  description?: string;
  saleId?: string;
  userId: string;
  metadata?: any;
}

export interface SessionBalance {
  openingAmount: number;
  salesTotal: number;
  cashSales: number;
  cardSales: number;
  pixSales: number;
  withdrawals: number;
  supplies: number;
  expectedCash: number;
  currentBalance: number;
}

export class CashTransactionRepository {
  async create(data: CreateCashTransactionDTO): Promise<CashTransaction> {
    return prisma.cashTransaction.create({
      data,
      include: {
        cashSession: true,
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

  async findBySession(sessionId: string): Promise<CashTransaction[]> {
    return prisma.cashTransaction.findMany({
      where: { cashSessionId: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getSessionBalance(sessionId: string): Promise<SessionBalance> {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      select: { openingAmount: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const transactions = await prisma.cashTransaction.findMany({
      where: { cashSessionId: sessionId },
    });

    let salesTotal = 0;
    let cashSales = 0;
    let cardSales = 0;
    let pixSales = 0;
    let withdrawals = 0;
    let supplies = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.SALE) {
        salesTotal += amount;
        if (transaction.paymentMethod === PaymentMethod.CASH) {
          cashSales += amount;
        } else if (
          transaction.paymentMethod === PaymentMethod.DEBIT ||
          transaction.paymentMethod === PaymentMethod.CREDIT
        ) {
          cardSales += amount;
        } else if (transaction.paymentMethod === PaymentMethod.PIX) {
          pixSales += amount;
        }
      } else if (transaction.type === TransactionType.WITHDRAWAL) {
        withdrawals += Math.abs(amount);
      } else if (transaction.type === TransactionType.SUPPLY) {
        supplies += amount;
      }
    });

    const openingAmount = Number(session.openingAmount);
    const expectedCash = openingAmount + cashSales - withdrawals + supplies;
    const currentBalance = openingAmount + salesTotal - withdrawals + supplies;

    return {
      openingAmount,
      salesTotal,
      cashSales,
      cardSales,
      pixSales,
      withdrawals,
      supplies,
      expectedCash,
      currentBalance,
    };
  }

  async getTransactionsByType(
    sessionId: string,
    type: TransactionType
  ): Promise<CashTransaction[]> {
    return prisma.cashTransaction.findMany({
      where: {
        cashSessionId: sessionId,
        type,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async cancel(transactionId: string): Promise<void> {
    // Soft delete by updating metadata
    await prisma.cashTransaction.update({
      where: { id: transactionId },
      data: {
        metadata: {
          cancelled: true,
          cancelledAt: new Date(),
        },
      },
    });
  }
}
