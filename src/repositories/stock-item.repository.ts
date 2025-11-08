import prisma from '@/config/database';
import { StockItem } from '@prisma/client';

export class StockItemRepository {
  async findById(id: string): Promise<StockItem | null> {
    return prisma.stockItem.findUnique({
      where: { id },
    });
  }
}
