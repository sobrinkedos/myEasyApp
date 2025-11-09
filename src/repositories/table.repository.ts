import prisma from '@/config/database';
import { Table } from '@prisma/client';

export interface CreateTableDTO {
  number: number;
  capacity: number;
}

export interface UpdateTableDTO {
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
  isActive?: boolean;
}

export class TableRepository {
  async findAll(): Promise<any[]> {
    const tables = await prisma.table.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
      include: {
        commands: {
          where: {
            status: {
              in: ['open', 'pending_payment'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Transformar para incluir dados da comanda ativa
    return tables.map((table) => {
      const activeCommand = table.commands[0];
      return {
        ...table,
        commandId: activeCommand?.id,
        commandNumber: activeCommand?.commandNumber,
        occupiedSince: activeCommand?.createdAt,
        totalAmount: activeCommand?.totalAmount || 0,
        commands: undefined, // Remover array de commands
      };
    });
  }

  async findById(id: string): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { id },
    });
  }

  async findByNumber(number: number): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { number },
    });
  }

  async create(data: CreateTableDTO): Promise<Table> {
    return prisma.table.create({
      data,
    });
  }

  async update(id: string, data: UpdateTableDTO): Promise<Table> {
    return prisma.table.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.table.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
