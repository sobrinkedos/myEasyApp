import prisma from '@/config/database';
import { CashTransfer, CashSessionStatus } from '@prisma/client';

export interface CreateCashTransferDTO {
  cashSessionId: string;
  transferredBy: string;
  expectedAmount: number;
  notes?: string;
}

export interface ConfirmReceiptDTO {
  receivedBy: string;
  receivedAmount: number;
  notes?: string;
}

export interface DailyConsolidation {
  date: string;
  totalSessions: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  totalWithdrawals: number;
  totalSupplies: number;
  totalTransferred: number;
  totalBreaks: number;
  sessions: Array<{
    id: string;
    operator: string;
    openedAt: Date;
    closedAt: Date | null;
    expectedAmount: number;
    countedAmount: number;
    difference: number;
  }>;
}

export class CashTransferRepository {
  async create(data: CreateCashTransferDTO): Promise<CashTransfer> {
    return prisma.cashTransfer.create({
      data,
      include: {
        cashSession: {
          include: {
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            cashRegister: true,
          },
        },
        transferrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findPending(): Promise<CashTransfer[]> {
    return prisma.cashTransfer.findMany({
      where: {
        receivedAt: null,
        cashSession: {
          status: CashSessionStatus.TRANSFERRED,
        },
      },
      include: {
        cashSession: {
          include: {
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            cashRegister: true,
          },
        },
        transferrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { transferredAt: 'asc' },
    });
  }

  async confirmReceipt(transferId: string, data: ConfirmReceiptDTO): Promise<CashTransfer> {
    const transfer = await prisma.cashTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new Error('Transfer not found');
    }

    const difference = data.receivedAmount - Number(transfer.expectedAmount);

    return prisma.cashTransfer.update({
      where: { id: transferId },
      data: {
        receivedBy: data.receivedBy,
        receivedAmount: data.receivedAmount,
        difference,
        receivedAt: new Date(),
        notes: data.notes,
      },
      include: {
        cashSession: {
          include: {
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            cashRegister: true,
          },
        },
        transferrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getDailyConsolidation(date: Date): Promise<DailyConsolidation> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await prisma.cashSession.findMany({
      where: {
        openedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        operator: {
          select: {
            name: true,
          },
        },
        transactions: true,
      },
    });

    let totalSales = 0;
    let totalCash = 0;
    let totalCard = 0;
    let totalPix = 0;
    let totalWithdrawals = 0;
    let totalSupplies = 0;
    let totalTransferred = 0;
    let totalBreaks = 0;

    const sessionSummaries = sessions.map((session) => {
      const transactions = session.transactions;

      let sessionSales = 0;
      let sessionCash = 0;
      let sessionCard = 0;
      let sessionPix = 0;
      let sessionWithdrawals = 0;
      let sessionSupplies = 0;

      transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);

        if (transaction.type === 'SALE') {
          sessionSales += amount;
          if (transaction.paymentMethod === 'CASH') {
            sessionCash += amount;
          } else if (transaction.paymentMethod === 'DEBIT' || transaction.paymentMethod === 'CREDIT') {
            sessionCard += amount;
          } else if (transaction.paymentMethod === 'PIX') {
            sessionPix += amount;
          }
        } else if (transaction.type === 'WITHDRAWAL') {
          sessionWithdrawals += Math.abs(amount);
        } else if (transaction.type === 'SUPPLY') {
          sessionSupplies += amount;
        }
      });

      totalSales += sessionSales;
      totalCash += sessionCash;
      totalCard += sessionCard;
      totalPix += sessionPix;
      totalWithdrawals += sessionWithdrawals;
      totalSupplies += sessionSupplies;

      const expectedAmount = Number(session.expectedAmount || 0);
      const countedAmount = Number(session.countedAmount || 0);
      const difference = Number(session.difference || 0);

      if (session.status === CashSessionStatus.TRANSFERRED || session.status === CashSessionStatus.RECEIVED) {
        totalTransferred += countedAmount - Number(session.openingAmount);
      }

      totalBreaks += Math.abs(difference);

      return {
        id: session.id,
        operator: session.operator.name,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        expectedAmount,
        countedAmount,
        difference,
      };
    });

    return {
      date: date.toISOString().split('T')[0],
      totalSessions: sessions.length,
      totalSales,
      totalCash,
      totalCard,
      totalPix,
      totalWithdrawals,
      totalSupplies,
      totalTransferred,
      totalBreaks,
      sessions: sessionSummaries,
    };
  }
}
