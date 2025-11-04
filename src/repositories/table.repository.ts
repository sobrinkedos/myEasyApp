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
  async findAll(): Promise<Table[]> {
    return prisma.table.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
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
