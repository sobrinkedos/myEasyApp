import prisma from '@/config/database';
import { Command } from '@prisma/client';

export interface CreateCommandDTO {
  tableId?: string;
  type: 'table' | 'counter';
  waiterId: string;
  numberOfPeople: number;
  customerName?: string;
  customerPhone?: string;
}

export interface UpdateCommandDTO {
  status?: 'open' | 'closed' | 'paid';
  subtotal?: number;
  serviceCharge?: number;
  total?: number;
  closedAt?: Date;
}

export interface CommandFilters {
  status?: 'open' | 'closed' | 'paid';
  waiterId?: string;
  tableId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export class CommandRepository {
  async findAll(
    filters?: CommandFilters,
    pagination?: PaginationOptions
  ): Promise<{ commands: Command[]; total: number }> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.waiterId) {
      where.waiterId = filters.waiterId;
    }

    if (filters?.tableId) {
      where.tableId = filters.tableId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.openedAt = {};
      if (filters.startDate) {
        where.openedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.openedAt.lte = filters.endDate;
      }
    }

    const [commands, total] = await Promise.all([
      prisma.command.findMany({
        where,
        include: {
          table: true,
          waiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { openedAt: 'desc' },
        skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
        take: pagination?.limit || 50,
      }),
      prisma.command.count({ where }),
    ]);

    return { commands, total };
  }

  async findById(id: string): Promise<Command | null> {
    return prisma.command.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findOpen(): Promise<Command[]> {
    return prisma.command.findMany({
      where: { status: 'open' },
      include: {
        table: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { openedAt: 'asc' },
    });
  }

  async findOpenByTable(tableId: string): Promise<Command | null> {
    return prisma.command.findFirst({
      where: {
        tableId,
        status: 'open',
      },
    });
  }

  async findByWaiter(waiterId: string): Promise<Command[]> {
    return prisma.command.findMany({
      where: { waiterId },
      include: {
        table: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async create(data: CreateCommandDTO & { code: string }): Promise<Command> {
    return prisma.command.create({
      data,
      include: {
        table: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateCommandDTO): Promise<Command> {
    return prisma.command.update({
      where: { id },
      data,
      include: {
        table: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getNextCodeNumber(): Promise<number> {
    const lastCommand = await prisma.command.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    if (!lastCommand) {
      return 1;
    }

    // Extract number from code (e.g., "CMD001" -> 1)
    const match = lastCommand.code.match(/\d+$/);
    if (match) {
      return parseInt(match[0], 10) + 1;
    }

    return 1;
  }
}
