import { CashTransactionRepository, CreateCashTransactionDTO } from '@/repositories/cash-transaction.repository';
import { CashSessionRepository } from '@/repositories/cash-session.repository';
import { BusinessError, NotFoundError, ValidationError } from '@/utils/errors';
import { CashTransaction, CashSessionStatus, TransactionType, PaymentMethod } from '@prisma/client';
import logger from '@/utils/logger';

const WITHDRAWAL_AUTHORIZATION_LIMIT = 200;

export interface WithdrawalDTO {
  amount: number;
  reason: string;
  authorizedBy?: string;
}

export interface SupplyDTO {
  amount: number;
  reason: string;
  authorizedBy?: string;
}

export interface SaleDTO {
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  changeGiven?: number;
}

export class CashTransactionService {
  private transactionRepository: CashTransactionRepository;
  private sessionRepository: CashSessionRepository;

  constructor() {
    this.transactionRepository = new CashTransactionRepository();
    this.sessionRepository = new CashSessionRepository();
  }

  async recordSale(sessionId: string, data: SaleDTO, userId: string): Promise<CashTransaction> {
    // Validate session is OPEN
    await this.validateSessionOpen(sessionId);

    const transaction = await this.transactionRepository.create({
      cashSessionId: sessionId,
      type: TransactionType.SALE,
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      saleId: data.saleId,
      userId,
      description: 'Venda',
      metadata: data.changeGiven ? { changeGiven: data.changeGiven } : undefined,
    });

    logger.info('Sale recorded', {
      sessionId,
      transactionId: transaction.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
    });

    return transaction;
  }

  async recordWithdrawal(sessionId: string, data: WithdrawalDTO, userId: string): Promise<CashTransaction> {
    // 1. Get session and validate
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }

    if (session.status !== CashSessionStatus.OPEN) {
      throw new BusinessError('Sessão não está aberta');
    }

    // 2. Get current balance
    const balance = await this.transactionRepository.getSessionBalance(sessionId);

    // 3. Validate withdrawal amount
    const remainingCash = balance.expectedCash - data.amount;
    if (remainingCash < Number(session.openingAmount)) {
      throw new BusinessError('Sangria deixaria saldo abaixo do valor de abertura');
    }

    // 4. Check authorization if needed
    if (data.amount > WITHDRAWAL_AUTHORIZATION_LIMIT && !data.authorizedBy) {
      throw new ValidationError('Autorização obrigatória para sangrias acima de R$ 200');
    }

    // 5. Record transaction
    const transaction = await this.transactionRepository.create({
      cashSessionId: sessionId,
      type: TransactionType.WITHDRAWAL,
      amount: -data.amount, // Negative for withdrawal
      description: data.reason,
      userId,
      metadata: data.authorizedBy ? { authorizedBy: data.authorizedBy } : undefined,
    });

    // 6. Log audit
    logger.info('Withdrawal recorded', {
      sessionId,
      transactionId: transaction.id,
      amount: data.amount,
      reason: data.reason,
    });

    return transaction;
  }

  async recordSupply(sessionId: string, data: SupplyDTO, userId: string): Promise<CashTransaction> {
    // Validate session is OPEN
    await this.validateSessionOpen(sessionId);

    // Validate amount
    if (data.amount <= 0) {
      throw new ValidationError('Valor de suprimento deve ser maior que zero');
    }

    const transaction = await this.transactionRepository.create({
      cashSessionId: sessionId,
      type: TransactionType.SUPPLY,
      amount: data.amount,
      description: data.reason,
      userId,
      metadata: data.authorizedBy ? { authorizedBy: data.authorizedBy } : undefined,
    });

    logger.info('Supply recorded', {
      sessionId,
      transactionId: transaction.id,
      amount: data.amount,
      reason: data.reason,
    });

    return transaction;
  }

  async cancelTransaction(transactionId: string, reason: string, supervisorId: string): Promise<void> {
    await this.transactionRepository.cancel(transactionId);

    logger.info('Transaction cancelled', {
      transactionId,
      reason,
      supervisorId,
    });
  }

  async getSessionBalance(sessionId: string) {
    return this.transactionRepository.getSessionBalance(sessionId);
  }

  async getSessionTransactions(sessionId: string): Promise<CashTransaction[]> {
    return this.transactionRepository.findBySession(sessionId);
  }

  private async validateSessionOpen(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }

    if (session.status !== CashSessionStatus.OPEN) {
      throw new BusinessError('Sessão não está aberta');
    }
  }
}
