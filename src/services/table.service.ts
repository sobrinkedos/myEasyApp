import { TableRepository, CreateTableDTO, UpdateTableDTO } from '@/repositories/table.repository';
import { ConflictError, NotFoundError } from '@/utils/errors';
import { Table } from '@prisma/client';

export class TableService {
  private repository: TableRepository;

  constructor() {
    this.repository = new TableRepository();
  }

  async getAll(): Promise<Table[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Table> {
    const table = await this.repository.findById(id);

    if (!table) {
      throw new NotFoundError('Mesa');
    }

    return table;
  }

  async create(data: CreateTableDTO): Promise<Table> {
    // Check if table number already exists
    const existing = await this.repository.findByNumber(data.number);

    if (existing) {
      throw new ConflictError('Mesa já existe');
    }

    return this.repository.create(data);
  }

  async update(id: string, data: UpdateTableDTO): Promise<Table> {
    // Check if table exists
    await this.getById(id);

    return this.repository.update(id, data);
  }

  async updateStatus(id: string, status: 'available' | 'occupied' | 'reserved'): Promise<Table> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    // Check if table exists
    await this.getById(id);

    await this.repository.delete(id);
  }
}
