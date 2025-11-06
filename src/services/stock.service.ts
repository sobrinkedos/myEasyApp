import { StockRepository } from '@/repositories/stock.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { StockItem, StockMovement } from '@prisma/client';
import prisma from '@/config/database';
import type { CreateStockItemDTO, UpdateStockItemDTO, CreateStockMovementDTO } from '@/models/stock.model';

export class StockService {
  private repository: StockRepository;

  constructor() {
    this.repository = new StockRepository();
  }

  // Stock Items
  async getAll(establishmentId: string, filters?: any) {
    return this.repository.findAll(establishmentId, filters);
  }

  async getById(id: string, establishmentId: string): Promise<StockItem> {
    const item = await this.repository.findById(id, establishmentId);

    if (!item) {
      throw new NotFoundError('Item de estoque');
    }

    return item;
  }

  async create(data: CreateStockItemDTO, establishmentId: string, userId: string): Promise<StockItem> {
    // Check for duplicate barcode
    if (data.barcode) {
      const existing = await this.repository.findByBarcode(data.barcode, establishmentId);
      if (existing) {
        throw new ConflictError('Código de barras já cadastrado');
      }
    }

    // Check for duplicate SKU
    if (data.sku) {
      const existing = await this.repository.findBySku(data.sku, establishmentId);
      if (existing) {
        throw new ConflictError('SKU já cadastrado');
      }
    }

    // Calculate initial status
    const status = this.calculateStatus(data.currentQuantity, data.minimumQuantity, data.expirationDate);

    const item = await this.repository.create({
      ...data,
      establishmentId,
      status,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'create',
        resource: 'stock_item',
        resourceId: item.id,
        newState: item,
        ipAddress: 'system',
      },
    });

    return item;
  }

  async update(id: string, data: UpdateStockItemDTO, establishmentId: string, userId: string): Promise<StockItem> {
    const item = await this.getById(id, establishmentId);

    // Check for duplicate barcode
    if (data.barcode && data.barcode !== item.barcode) {
      const existing = await this.repository.findByBarcode(data.barcode, establishmentId);
      if (existing && existing.id !== id) {
        throw new ConflictError('Código de barras já cadastrado');
      }
    }

    // Check for duplicate SKU
    if (data.sku && data.sku !== item.sku) {
      const existing = await this.repository.findBySku(data.sku, establishmentId);
      if (existing && existing.id !== id) {
        throw new ConflictError('SKU já cadastrado');
      }
    }

    const updated = await this.repository.update(id, data);

    // Update status if needed
    await this.updateItemStatus(updated);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'update',
        resource: 'stock_item',
        resourceId: id,
        previousState: item,
        newState: updated,
        ipAddress: 'system',
      },
    });

    return updated;
  }

  async delete(id: string, establishmentId: string, userId: string): Promise<void> {
    const item = await this.getById(id, establishmentId);

    await this.repository.delete(id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'delete',
        resource: 'stock_item',
        resourceId: id,
        previousState: item,
        ipAddress: 'system',
      },
    });
  }

  // Stock Movements
  async createMovement(data: CreateStockMovementDTO, establishmentId: string, userId: string): Promise<StockMovement> {
    const item = await this.getById(data.stockItemId, establishmentId);

    // Calculate new quantity
    let newQuantity = Number(item.currentQuantity);
    
    switch (data.type) {
      case 'entrada':
      case 'devolucao':
        newQuantity += data.quantity;
        break;
      case 'saida':
      case 'perda':
        newQuantity -= data.quantity;
        if (newQuantity < 0) {
          throw new ValidationError('Quantidade insuficiente em estoque', {
            currentQuantity: [String(item.currentQuantity)],
            requested: [String(data.quantity)],
          });
        }
        break;
      case 'ajuste':
        newQuantity = data.quantity;
        break;
      case 'transferencia':
        newQuantity -= data.quantity;
        if (newQuantity < 0) {
          throw new ValidationError('Quantidade insuficiente para transferência', {
            currentQuantity: [String(item.currentQuantity)],
            requested: [String(data.quantity)],
          });
        }
        break;
    }

    // Create movement
    const movement = await this.repository.createMovement({
      ...data,
      userId,
    });

    // Update item quantity
    await this.repository.updateQuantity(data.stockItemId, newQuantity);

    // Update item status
    const updatedItem = await this.repository.findById(data.stockItemId, establishmentId);
    if (updatedItem) {
      await this.updateItemStatus(updatedItem);
    }

    return movement;
  }

  async getMovements(stockItemId: string, establishmentId: string): Promise<StockMovement[]> {
    await this.getById(stockItemId, establishmentId);
    return this.repository.findMovements(stockItemId);
  }

  async getAllMovements(establishmentId: string, filters?: any) {
    return this.repository.findAllMovements(establishmentId, filters);
  }

  // Dashboard
  async getStats(establishmentId: string) {
    return this.repository.getStats(establishmentId);
  }

  async getLowStockItems(establishmentId: string): Promise<StockItem[]> {
    const { items } = await this.repository.findAll(establishmentId, { status: 'baixo' });
    return items;
  }

  async getExpiringItems(establishmentId: string): Promise<StockItem[]> {
    const { items } = await this.repository.findAll(establishmentId, { status: 'vencendo' });
    return items;
  }

  // Helper methods
  private calculateStatus(currentQuantity: number, minimumQuantity: number, expirationDate?: string): string {
    // Check expiration
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expDate < now) {
        return 'vencido';
      }
      if (expDate <= thirtyDaysFromNow) {
        return 'vencendo';
      }
    }

    // Check quantity
    if (currentQuantity === 0) {
      return 'zerado';
    }
    if (currentQuantity <= minimumQuantity) {
      return 'baixo';
    }

    return 'normal';
  }

  private async updateItemStatus(item: StockItem): Promise<void> {
    const status = this.calculateStatus(
      Number(item.currentQuantity),
      Number(item.minimumQuantity),
      item.expirationDate?.toISOString()
    );

    if (status !== item.status) {
      await this.repository.updateStatus(item.id, status);
    }
  }
}
