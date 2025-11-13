import { closureDocumentRepository } from '@/repositories/closure-document.repository';
import { cashSessionRepository } from '@/repositories/cash-session.repository';
import { cashTransactionRepository } from '@/repositories/cash-transaction.repository';
import { cashCountRepository } from '@/repositories/cash-count.repository';
import { ClosureSummary, ClosureDetails } from '@/models/closure-document.model';
import logger from '@/utils/logger';

export interface ListClosuresFilters {
  startDate?: Date;
  endDate?: Date;
  operatorId?: string;
  cashRegisterId?: string;
  status?: 'normal' | 'warning' | 'alert';
  page?: number;
  limit?: number;
}

export interface PaginatedClosures {
  data: ClosureSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalClosures: number;
    normalCount: number;
    warningCount: number;
    alertCount: number;
    totalDifference: number;
  };
}

export class ClosureHistoryService {
  async listClosures(filters: ListClosuresFilters): Promise<PaginatedClosures> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Fetch closed sessions directly instead of documents
      const sessions = await cashSessionRepository.findMany({
        status: 'CLOSED' as any,
        operatorId: filters.operatorId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        limit,
      });

      // Transform to summary format
      const summaries: ClosureSummary[] = sessions.sessions.map((session: any) => {
        const differencePercent = session.expectedAmount > 0 
          ? Math.abs((Number(session.difference) / Number(session.expectedAmount)) * 100)
          : 0;
        const status = this.calculateStatus(differencePercent);

        // Try to find document for this session
        const documentNumber = `Sessão ${session.id.substring(0, 8)}`;

        return {
          id: session.id,
          documentNumber,
          date: session.closedAt || session.openedAt,
          operator: session.operator.name,
          cashRegister: session.cashRegister.name,
          expectedAmount: Number(session.expectedAmount || 0),
          countedAmount: Number(session.countedAmount || 0),
          difference: Number(session.difference || 0),
          differencePercent: Number(differencePercent.toFixed(2)),
          status,
        };
      });

      const total = sessions.total;

      // Filter by status if specified
      let filteredSummaries = summaries;
      if (filters.status) {
        filteredSummaries = summaries.filter((s) => s.status === filters.status);
      }

      // Calculate statistics
      const statistics = this.calculateStatistics(summaries);

      return {
        data: filteredSummaries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statistics,
      };
    } catch (error) {
      logger.error('Error listing closures:', error);
      throw error;
    }
  }

  async getClosureDetails(sessionId: string): Promise<ClosureDetails> {
    try {
      // Try to find session first
      const session = await cashSessionRepository.findById(sessionId);
      if (!session) {
        throw new Error('Cash session not found');
      }

      // Fetch transactions
      const transactions = await cashTransactionRepository.findBySessionId(sessionId);
      
      // Fetch counts
      const counts = await cashCountRepository.findBySessionId(sessionId);

      // Calculate financial summary
      const cashSales = transactions
        .filter((t: any) => t.type === 'SALE' && t.paymentMethod === 'CASH')
        .reduce((sum, t: any) => sum + Number(t.amount), 0);

      const cardSales = transactions
        .filter((t: any) => t.type === 'SALE' && (t.paymentMethod === 'DEBIT' || t.paymentMethod === 'CREDIT'))
        .reduce((sum, t: any) => sum + Number(t.amount), 0);

      const pixSales = transactions
        .filter((t: any) => t.type === 'SALE' && t.paymentMethod === 'PIX')
        .reduce((sum, t: any) => sum + Number(t.amount), 0);

      const withdrawals = transactions
        .filter((t: any) => t.type === 'WITHDRAWAL')
        .reduce((sum, t: any) => sum + Number(t.amount), 0);

      const supplies = transactions
        .filter((t: any) => t.type === 'SUPPLY')
        .reduce((sum, t: any) => sum + Number(t.amount), 0);

      const salesTotal = cashSales + cardSales + pixSales;
      const expectedCash = Number(session.openingAmount) + cashSales - withdrawals + supplies;
      const countedAmount = Number(session.countedAmount || 0);
      const difference = countedAmount - expectedCash;
      const differencePercent = expectedCash > 0 ? (difference / expectedCash) * 100 : 0;

      // Calculate duration
      const duration = session.closedAt 
        ? `${Math.floor((new Date(session.closedAt).getTime() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60))}h`
        : '0h';

      // Check if document exists
      const document = await closureDocumentRepository.findBySessionId(sessionId);

      return {
        session: {
          id: session.id,
          cashRegister: (session as any).cashRegister.name,
          operator: (session as any).operator.name,
          openedAt: session.openedAt,
          closedAt: session.closedAt || new Date(),
          duration,
        },
        financial: {
          openingAmount: Number(session.openingAmount),
          salesTotal,
          cashSales,
          cardSales,
          pixSales,
          withdrawals,
          supplies,
          expectedCash,
          countedAmount,
          difference,
          differencePercent: Number(differencePercent.toFixed(2)),
        },
        transactions: transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          paymentMethod: t.paymentMethod,
          amount: Number(t.amount),
          description: t.description,
          timestamp: t.timestamp,
        })),
        counts: counts.map((c: any) => ({
          denomination: Number(c.denomination),
          quantity: c.quantity,
          total: Number(c.total),
        })),
        document: document ? {
          id: document.id,
          documentNumber: document.documentNumber,
          generatedAt: document.generatedAt,
          pdfUrl: document.pdfUrl,
          downloadCount: document.downloadCount,
        } : null,
      };
    } catch (error) {
      logger.error('Error getting closure details:', error);
      throw error;
    }
  }

  private calculateStatus(differencePercent: number): 'normal' | 'warning' | 'alert' {
    const absDiff = Math.abs(differencePercent);
    if (absDiff > 1) return 'alert';
    if (absDiff > 0.5) return 'warning';
    return 'normal';
  }

  private calculateStatistics(summaries: ClosureSummary[]): {
    totalClosures: number;
    normalCount: number;
    warningCount: number;
    alertCount: number;
    totalDifference: number;
  } {
    return {
      totalClosures: summaries.length,
      normalCount: summaries.filter((s) => s.status === 'normal').length,
      warningCount: summaries.filter((s) => s.status === 'warning').length,
      alertCount: summaries.filter((s) => s.status === 'alert').length,
      totalDifference: summaries.reduce((sum, s) => sum + s.difference, 0),
    };
  }
}

export const closureHistoryService = new ClosureHistoryService();
