import { CommandRepository, CreateCommandDTO, UpdateCommandDTO } from '@/repositories/command.repository';
import { TableService } from '@/services/table.service';
import { ConflictError, NotFoundError, BadRequestError } from '@/utils/errors';
import { Command } from '@prisma/client';
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

  constructor() {
    this.repository = new CommandRepository();
    this.tableService = new TableService();
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
    const command = await this.getById(id);

    // Validate command is open
    if (command.status !== 'open') {
      throw new BadRequestError('Comanda já está fechada');
    }

    // Check if all orders are delivered
    const pendingOrders = command.orders?.filter(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled'
    );

    if (pendingOrders && pendingOrders.length > 0) {
      throw new BadRequestError(
        `Existem ${pendingOrders.length} pedidos não entregues`
      );
    }

    // Calculate totals
    const subtotal = command.orders
      ?.filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.subtotal), 0) || 0;

    const serviceCharge = (subtotal * serviceChargePercentage) / 100;
    const total = subtotal + serviceCharge;

    // Update command
    const closedCommand = await this.repository.update(id, {
      status: 'closed',
      subtotal,
      serviceCharge,
      total,
      closedAt: new Date(),
    });

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return closedCommand;
  }
}
