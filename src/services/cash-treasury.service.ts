import { CashTransferRepository, CreateCashTransferDTO, ConfirmReceiptDTO } from '@/repositories/cash-transfer.repository';
import { CashSessionRepository } from '@/repositories/cash-session.repository';
import { BusinessError, NotFoundError } from '@/utils/errors';
import { CashTransfer, CashSessionStatus } from '@prisma/client';
import logger from '@/utils/logger';

export class CashTreasuryService {
  private transferRepository: CashTransferRepository;
  private sessionRepository: CashSessionRepository;

  constructor() {
    this.transferRepository = new CashTransferRepository();
    this.sessionRepository = new CashSessionRepository();
  }

  async transferToTreasury(sessionId: string, notes?: string): Promise<CashTransfer> {
    // 1. Get session and validate
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão de caixa');
    }

    if (session.status !== CashSessionStatus.CLOSED) {
      throw new BusinessError('Sessão deve estar fechada antes da transferência');
    }

    // 2. Calculate transfer amount (excluding opening amount that stays)
    const transferAmount = Number(session.countedAmount || 0) - Number(session.openingAmount);

    // 3. Validate transfer amount
    if (transferAmount < 0) {
      throw new BusinessError('Não é possível transferir valor negativo');
    }

    // 4. Create transfer record
    const transfer = await this.transferRepository.create({
      cashSessionId: sessionId,
      transferredBy: session.operatorId,
      expectedAmount: transferAmount,
      notes,
    });

    // 5. Update session status
    await this.sessionRepository.update(sessionId, {
      status: CashSessionStatus.TRANSFERRED,
      transferredAt: new Date(),
    });

    // 6. Log audit
    logger.info('Cash transferred to treasury', {
      sessionId,
      transferId: transfer.id,
      amount: transferAmount,
      operatorId: session.operatorId,
    });

    // TODO: Notify treasury

    return transfer;
  }

  async confirmReceipt(transferId: string, data: ConfirmReceiptDTO): Promise<CashTransfer> {
    const transfer = await this.transferRepository.confirmReceipt(transferId, data);

    // Update session status
    await this.sessionRepository.update(transfer.cashSessionId, {
      status: CashSessionStatus.RECEIVED,
      receivedAt: new Date(),
      treasurerUserId: data.receivedBy,
    });

    logger.info('Transfer receipt confirmed', {
      transferId,
      receivedBy: data.receivedBy,
      receivedAmount: data.receivedAmount,
      difference: transfer.difference,
    });

    return transfer;
  }

  async listPendingTransfers(): Promise<CashTransfer[]> {
    return this.transferRepository.findPending();
  }

  async getDailyConsolidation(date: Date) {
    return this.transferRepository.getDailyConsolidation(date);
  }
}
