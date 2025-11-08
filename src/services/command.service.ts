import { CommandRepository, CreateCommandDTO, UpdateCommandDTO } from '@/repositories/command.repository';
import { TableService } from '@/services/table.service';
import { CashTransactionService } from '@/services/cash-transaction.service';
import { CashSessionService } from '@/services/cash-session.service';
import { ConflictError, NotFoundError, BadRequestError } from '@/utils/errors';
import { Command, PaymentMethod } from '@prisma/client';
import { cacheService } from '@/utils/cache';

export interface OpenCommandDTO {
  tableId?: string;
  numberOfPeople: number;
  type: 'table' | 'counter';
  customerName?: string;
  customerPhone?: string;
}

export interface CommandFilters {
  status?: 'open' | 'closed' | 'paid';
  waiterId?: string;
  tableId?: string;
  startDate?: Date;
  endDate?: Date;
}

const OPEN_COMMANDS_CACHE_KEY = 'commands:open';
const CACHE_TTL = 120; // 2 minutos

export class CommandService {
  private repository: CommandRepository;
  private tableService: TableService;
  private cashTransactionService: CashTransactionService;
  private cashSessionService: CashSessionService;

  constructor() {
    this.repository = new CommandRepository();
    this.tableService = new TableService();
    this.cashTransactionService = new CashTransactionService();
    this.cashSessionService = new CashSessionService();
  }

  async getAll(
    filters?: CommandFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{ commands: Command[]; total: number; page: number; totalPages: number }> {
    const { commands, total } = await this.repository.findAll(filters, { page, limit });

    return {
      commands,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<Command> {
    const command = await this.repository.findById(id);

    if (!command) {
      throw new NotFoundError('Comanda');
    }

    return command;
  }

  async getOpen(): Promise<Command[]> {
    // Try to get from cache
    const cached = await cacheService.get<Command[]>(OPEN_COMMANDS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Get from database
    const commands = await this.repository.findOpen();

    // Cache result
    await cacheService.set(OPEN_COMMANDS_CACHE_KEY, commands, CACHE_TTL);

    return commands;
  }

  async getByWaiter(waiterId: string): Promise<Command[]> {
    return this.repository.findByWaiter(waiterId);
  }

  async openCommand(data: OpenCommandDTO, userId: string): Promise<Command> {
    // Validate table if provided
    if (data.tableId) {
      const table = await this.tableService.getById(data.tableId);

      // Check if table already has an open command
      const existingCommand = await this.repository.findOpenByTable(data.tableId);
      if (existingCommand) {
        throw new ConflictError('Mesa já possui comanda aberta');
      }

      // Update table status to occupied
      await this.tableService.updateStatus(data.tableId, 'occupied');
    }

    // Generate unique code
    const codeNumber = await this.repository.getNextCodeNumber();
    const code = `CMD${codeNumber.toString().padStart(3, '0')}`;

    // Create command
    const command = await this.repository.create({
      ...data,
      code,
      waiterId: userId,
    });

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return command;
  }

  async closeCounterCommand(id: string): Promise<Command> {
    const command = await this.getById(id);

    // Only counter commands can be auto-closed
    if (command.type !== 'counter') {
      throw new BadRequestError('Apenas comandas de balcão podem ser fechadas automaticamente');
    }

    // Close command with default service charge (0% for counter)
    return this.closeCommand(id, 0);
  }

  async update(id: string, data: UpdateCommandDTO): Promise<Command> {
    // Check if command exists
    await this.getById(id);

    const command = await this.repository.update(id, data);

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return command;
  }

  async closeCommand(
    id: string,
    serviceChargePercentage: number = 10
  ): Promise<Command> {
    try {
      const command = await this.getById(id);

      // Validate command is open
      if (command.status !== 'open') {
        throw new BadRequestError('Comanda já está fechada');
      }

      // Check if all orders are delivered
      const orders = (command as any).orders || [];
      const pendingOrders = orders.filter(
        (order: any) => order.status !== 'delivered' && order.status !== 'cancelled'
      );

      if (pendingOrders.length > 0) {
        throw new BadRequestError(
          `Existem ${pendingOrders.length} pedidos não entregues`
        );
      }

      // Calculate totals
      const subtotal = orders
        .filter((order: any) => order.status !== 'cancelled')
        .reduce((sum: number, order: any) => sum + Number(order.subtotal), 0);

      const serviceCharge = (subtotal * serviceChargePercentage) / 100;
      const total = subtotal + serviceCharge;

      // Update command to pending_payment (waiting for cashier)
      const closedCommand = await this.repository.update(id, {
        status: 'pending_payment',
        subtotal,
        serviceCharge,
        total,
        closedAt: new Date(),
      });

      // Invalidate cache
      await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

      return closedCommand;
    } catch (error) {
      console.error('Error closing command:', error);
      throw error;
    }
  }

  async confirmPayment(
    id: string,
    paymentMethod: string,
    amount: number,
    userId: string
  ): Promise<Command> {
    const command = await this.getById(id);

    // Validate command is pending payment
    if (command.status !== 'pending_payment') {
      throw new BadRequestError('Comanda não está pendente de pagamento');
    }

    // Validate payment method
    const validPaymentMethods = Object.values(PaymentMethod);
    if (!validPaymentMethods.includes(paymentMethod as PaymentMethod)) {
      throw new BadRequestError('Forma de pagamento inválida');
    }

    // Get active cash session for the user
    const activeSession = await this.cashSessionService.getActiveSession(userId);
    if (!activeSession) {
      throw new BadRequestError('Nenhuma sessão de caixa aberta para registrar o pagamento');
    }

    // Register cash transaction
    await this.cashTransactionService.recordSale(
      activeSession.id,
      {
        saleId: command.id,
        amount,
        paymentMethod: paymentMethod as PaymentMethod,
      },
      userId
    );

    // Update command to closed
    const paidCommand = await this.repository.update(id, {
      status: 'closed',
    });

    // Free table if it's a table command
    if (paidCommand.tableId) {
      await this.tableService.updateStatus(paidCommand.tableId, 'available');
    }

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return paidCommand;
  }
}
