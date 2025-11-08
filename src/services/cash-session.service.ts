import { CashSessionRepository, CreateCashSessionDTO } from '@/repositories/cash-session.repository';
import { CashTransactionRepository } from '@/repositories/cash-transaction.repository';
import { CashCountRepository, CreateCashCountDTO } from '@/repositories/cash-count.repository';
import { ConflictError, NotFoundError, ValidationError, BusinessError } from '@/utils/errors';
import { CashSession, CashSessionStatus, TransactionType } from '@prisma/client';
import { cacheService } from '@/utils/cache';
import logger from '@/utils/logger';
import prisma from '@/config/database';

const MIN_OPENING_AMOUNT = 50;
const MAX_OPENING_AMOUNT = 500;
const MAX_DIFFERENCE_PERCENT = 1;
const NOTIFICATION_THRESHOLD = 0.5;

export interface CloseSessionDTO {
  countedAmount: number;
  counts: CreateCashCountDTO[];
  notes?: string;
}

export class CashSessionService {
  private sessionRepository: CashSessionRepository;
  private transactionRepository: CashTransactionRepository;
  private countRepository: CashCountRepository;
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'cash-sessions';

  constructor() {
    this.sessionRepository = new CashSessionRepository();
    this.transactionRepository = new CashTransactionRepository();
    this.countRepository = new CashCountRepository();
  }

  async openSession(data: CreateCashSessionDTO): Promise<CashSession> {
    console.log('=== SERVICE: openSession ===');
    console.log('Data received:', data);

    // 1. Validate operator doesn't have open session
    console.log('Checking for existing session...');
    const existingSession = await this.sessionRepository.findActiveByOperator(data.operatorId);
    if (existingSession) {
      console.log('Existing session found:', existingSession.id);
      throw new ConflictError('Operador já possui um caixa aberto');
    }
    console.log('No existing session found');

    // 2. Validate opening amount
    if (data.openingAmount < MIN_OPENING_AMOUNT || data.openingAmount > MAX_OPENING_AMOUNT) {
      throw new ValidationError(
        `Valor de abertura deve estar entre R$ ${MIN_OPENING_AMOUNT} e R$ ${MAX_OPENING_AMOUNT}`
      );
    }

    // 3. Create session
    console.log('Creating session in database...');
    try {
      const session = await this.sessionRepository.create(data);
      console.log('Session created successfully:', session.id);

      // 4. Record opening transaction
      console.log('Recording opening transaction...');
      await this.transactionRepository.create({
        cashSessionId: session.id,
        type: TransactionType.OPENING,
        amount: data.openingAmount,
        userId: data.operatorId,
        description: 'Abertura de caixa',
      });
      console.log('Transaction recorded');

      // 5. Log audit
      logger.info('Cash session opened', {
        sessionId: session.id,
        operatorId: data.operatorId,
        openingAmount: data.openingAmount,
      });

      // Invalidate cache
      await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async closeSession(sessionId: string, data: CloseSessionDTO, userId: string): Promise<CashSession> {
    // 1. Get session and validate
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }

    if (session.status !== CashSessionStatus.OPEN) {
      throw new BusinessError('Sessão não está aberta');
    }

    // 2. Calculate expected amount
    const balance = await this.transactionRepository.getSessionBalance(sessionId);
    const expectedAmount = balance.expectedCash;

    // 3. Record cash counts
    await this.countRepository.createMany(sessionId, data.counts);

    // 4. Calculate difference
    const difference = data.countedAmount - expectedAmount;
    const differencePercent = Math.abs((difference / expectedAmount) * 100);

    // 5. Validate justification if needed
    if (differencePercent > MAX_DIFFERENCE_PERCENT && !data.notes) {
      throw new ValidationError('Justificativa obrigatória para quebra de caixa acima de 1%');
    }

    // 6. Update session
    const updatedSession = await this.sessionRepository.update(sessionId, {
      status: CashSessionStatus.CLOSED,
      expectedAmount,
      countedAmount: data.countedAmount,
      difference,
      closedAt: new Date(),
      notes: data.notes,
    });

    // 7. Notify if significant break
    if (differencePercent > NOTIFICATION_THRESHOLD) {
      logger.warn('Significant cash break detected', {
        sessionId,
        difference,
        percent: differencePercent,
      });
      // TODO: Implement notification service
    }

    // 8. Log audit
    logger.info('Cash session closed', {
      sessionId,
      operatorId: session.operatorId,
      expectedAmount,
      countedAmount: data.countedAmount,
      difference,
    });

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return updatedSession;
  }

  async reopenSession(sessionId: string, reason: string, supervisorId: string): Promise<CashSession> {
    // 1. Get session and validate
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }

    if (session.status !== CashSessionStatus.CLOSED) {
      throw new BusinessError('Apenas sessões fechadas podem ser reabertas');
    }

    // 2. Validate session is within 24h
    if (session.closedAt) {
      const hoursSinceClosed = (Date.now() - session.closedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceClosed > 24) {
        throw new BusinessError('Sessão só pode ser reaberta dentro de 24 horas após fechamento');
      }
    }

    // 3. Update status to REOPENED
    const updatedSession = await this.sessionRepository.update(sessionId, {
      status: CashSessionStatus.REOPENED,
      reopenReason: reason,
    });

    // 4. Log audit
    logger.info('Cash session reopened', {
      sessionId,
      supervisorId,
      reason,
    });

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return updatedSession;
  }

  async getActiveSession(operatorId: string): Promise<CashSession | null> {
    return this.sessionRepository.findActiveByOperator(operatorId);
  }

  async getSessionDetails(sessionId: string): Promise<CashSession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }
    return session;
  }

  async listSessions(filters: any) {
    return this.sessionRepository.findMany(filters);
  }

  async getCashRegisters(establishmentId: string) {
    const registers = await prisma.cashRegister.findMany({
      where: {
        establishmentId,
        isActive: true,
      },
      select: {
        id: true,
        number: true,
        name: true,
        isActive: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return registers;
  }
}
