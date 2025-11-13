import { PrismaClient } from '@prisma/client';
import { CashClosureDocument } from '@/models/closure-document.model';

const prisma = new PrismaClient();

export class ClosureDocumentRepository {
  async create(data: {
    cashSessionId: string;
    documentNumber: string;
    generatedBy: string;
    pdfUrl: string;
    hash: string;
    metadata: any;
  }): Promise<CashClosureDocument> {
    return prisma.cashClosureDocument.create({
      data,
    }) as Promise<CashClosureDocument>;
  }

  async findById(id: string): Promise<CashClosureDocument | null> {
    return prisma.cashClosureDocument.findUnique({
      where: { id },
      include: {
        cashSession: {
          include: {
            operator: true,
            cashRegister: true,
          },
        },
        generator: true,
      },
    }) as Promise<CashClosureDocument | null>;
  }

  async findBySessionId(cashSessionId: string): Promise<CashClosureDocument | null> {
    return prisma.cashClosureDocument.findUnique({
      where: { cashSessionId },
      include: {
        cashSession: {
          include: {
            operator: true,
            cashRegister: true,
          },
        },
        generator: true,
      },
    }) as Promise<CashClosureDocument | null>;
  }

  async findByDocumentNumber(documentNumber: string): Promise<CashClosureDocument | null> {
    return prisma.cashClosureDocument.findUnique({
      where: { documentNumber },
    }) as Promise<CashClosureDocument | null>;
  }

  async findMany(filters: {
    startDate?: Date;
    endDate?: Date;
    operatorId?: string;
    cashRegisterId?: string;
    skip?: number;
    take?: number;
  }): Promise<CashClosureDocument[]> {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.generatedAt = {};
      if (filters.startDate) {
        where.generatedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.generatedAt.lte = filters.endDate;
      }
    }

    if (filters.operatorId) {
      where.cashSession = {
        operatorId: filters.operatorId,
      };
    }

    if (filters.cashRegisterId) {
      where.cashSession = {
        ...where.cashSession,
        cashRegisterId: filters.cashRegisterId,
      };
    }

    return prisma.cashClosureDocument.findMany({
      where,
      include: {
        cashSession: {
          include: {
            operator: true,
            cashRegister: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
      skip: filters.skip,
      take: filters.take,
    }) as Promise<CashClosureDocument[]>;
  }

  async count(filters: {
    startDate?: Date;
    endDate?: Date;
    operatorId?: string;
    cashRegisterId?: string;
  }): Promise<number> {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.generatedAt = {};
      if (filters.startDate) {
        where.generatedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.generatedAt.lte = filters.endDate;
      }
    }

    if (filters.operatorId) {
      where.cashSession = {
        operatorId: filters.operatorId,
      };
    }

    if (filters.cashRegisterId) {
      where.cashSession = {
        ...where.cashSession,
        cashRegisterId: filters.cashRegisterId,
      };
    }

    return prisma.cashClosureDocument.count({ where });
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await prisma.cashClosureDocument.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
        lastDownloadAt: new Date(),
      },
    });
  }

  async getNextDocumentNumber(establishmentId: string): Promise<string> {
    // Get the latest document number for this establishment
    const latestDoc = await prisma.cashClosureDocument.findFirst({
      where: {
        cashSession: {
          cashRegister: {
            establishmentId,
          },
        },
      },
      orderBy: {
        documentNumber: 'desc',
      },
    });

    if (!latestDoc) {
      return `${establishmentId.substring(0, 8).toUpperCase()}-00001`;
    }

    // Extract number from document number (format: PREFIX-00001)
    const parts = latestDoc.documentNumber.split('-');
    const currentNumber = parseInt(parts[parts.length - 1], 10);
    const nextNumber = currentNumber + 1;

    return `${establishmentId.substring(0, 8).toUpperCase()}-${nextNumber.toString().padStart(5, '0')}`;
  }
}

export const closureDocumentRepository = new ClosureDocumentRepository();
