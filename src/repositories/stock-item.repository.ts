import prisma from '@/config/database';
import { StockItem } from '@prisma/client';

export class StockItemRepository {
  async findById(id: string): Promise<StockItem | null> {
    return prisma.stockItem.findUnique({
      where: { id },
    });
  }

  async updateQuantity(id: string, newQuantity: number): Promise<StockItem> {
    return prisma.stockItem.update({
      where: { id },
      data: { currentQuantity: newQuantity },
    });
  }
}
