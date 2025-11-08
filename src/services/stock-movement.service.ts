import { StockMovementRepository } from '@/repositories/stock-movement.repository';
import { StockService } from '@/services/stock.service';
import { CMVService } from '@/services/cmv.service';
import { CreateStockMovementData, UpdateStockMovementData, BulkCreateStockMovementData } from '@/models/stock-movement.model';
import { NotFoundError } from '@/utils/errors';

export class StockMovementService {
  private repository: StockMovementRepository;
  private stockService: StockService;
  private cmvService: CMVService;

  constructor() {
    this.repository = new StockMovementRepository();
    this.stockService = new StockService();
    this.cmvService = new CMVService();
  }

  async create(data: CreateStockMovementData, userId: string) {
    // Validate stock item exists
    await this.stockService.getById(data.stockItemId);

    // Calculate total cost if not provided
    if (!data.totalCost && data.costPrice) {
      data.totalCost = data.quantity * data.costPrice;
    }

    // Create movement
    const movement = await this.repository.create({ ...data, userId });

    // Update stock item quantity based on movement type
    await this.updateStockItemQuantity(data.stockItemId, data.type, data.quantity, data.costPrice);

    // Update CMV period if applicable (purchase type)
    if (data.type === 'purchase') {
      await this.updateCMVPeriod(data.totalCost || 0, new Date());
    }

    return movement;
  }

  async createBulk(data: BulkCreateStockMovementData, userId: string) {
    const movements = data.movements.map(movement => ({
      ...movement,
      userId,
      totalCost: movement.totalCost || (movement.costPrice && movement.quantity ? movement.quantity * movement.costPrice : undefined),
    }));

    // Create all movements
    await this.repository.createMany(movements);

    // Update stock items and CMV
    for (const movement of data.movements) {
      await this.updateStockItemQuantity(
        movement.stockItemId,
        movement.type,
        movement.quantity,
        movement.costPrice
      );

      if (movement.type === 'purchase') {
        const totalCost = movement.totalCost || (movement.costPrice && movement.quantity ? movement.quantity * movement.costPrice : 0);
        await this.updateCMVPeriod(totalCost, new Date());
      }
    }

    return { success: true, count: movements.length };
  }

  async getAll(filters?: {
    stockItemId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const processedFilters = {
      ...filters,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    return this.repository.findAll(processedFilters);
  }

  async getById(id: string) {
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new NotFoundError('Movimentação de estoque');
    }
    return movement;
  }

  async getByStockItem(stockItemId: string, limit?: number) {
    // Validate stock item exists
    await this.stockService.getById(stockItemId);
    return this.repository.findByStockItem(stockItemId, limit);
  }

  async update(id: string, data: UpdateStockMovementData) {
    // Check if movement exists
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    // Check if movement exists
    const movement = await this.getById(id);

    // Reverse the stock movement
    const reverseQuantity = movement.type === 'purchase' || movement.type === 'adjustment' || movement.type === 'return'
      ? -Number(movement.quantity) 
      : Number(movement.quantity);

    await this.updateStockItemQuantity(
      movement.stockItemId,
      movement.type,
      reverseQuantity,
      Number(movement.costPrice || 0)
    );

    // Reverse CMV if it was a purchase
    if (movement.type === 'purchase' && movement.totalCost) {
      await this.updateCMVPeriod(-Number(movement.totalCost), movement.createdAt);
    }

    return this.repository.delete(id);
  }

  private async updateStockItemQuantity(
    stockItemId: string,
    type: string,
    quantity: number,
    costPrice?: number
  ) {
    const stockItem = await this.stockService.getById(stockItemId);
    const currentQuantity = Number(stockItem.currentQuantity || 0);
    const currentCost = Number(stockItem.costPrice || 0);

    let newQuantity = currentQuantity;
    let newCostPrice = currentCost;

    switch (type) {
      case 'purchase':
      case 'return':
        newQuantity = currentQuantity + quantity;
        if (costPrice && newQuantity > 0) {
          // Calculate weighted average cost
          const totalValue = (currentQuantity * currentCost) + (quantity * costPrice);
          newCostPrice = totalValue / newQuantity;
        }
        break;

      case 'usage':
      case 'waste':
      case 'sale':
        newQuantity = Math.max(0, currentQuantity - quantity);
        // Cost price remains the same for usage/waste/sale
        break;

      case 'adjustment':
        newQuantity = currentQuantity + quantity; // quantity can be negative for adjustments
        if (costPrice && newQuantity > 0) {
          newCostPrice = costPrice;
        }
        break;
    }

    await this.stockService.update(stockItemId, {
      currentQuantity: newQuantity,
      costPrice: newCostPrice,
    });
  }

  private async updateCMVPeriod(purchaseValue: number, movementDate: Date) {
    try {
      // Find open CMV period that includes this date
      const openPeriods = await this.cmvService.getAll({ status: 'open' });
      
      if (openPeriods && openPeriods.length > 0) {
        for (const period of openPeriods) {
          const startDate = new Date(period.startDate);
          const endDate = new Date(period.endDate);
          
          if (movementDate >= startDate && movementDate <= endDate) {
            // Update period purchases
            const currentPurchases = Number(period.purchases || 0);
            const newPurchases = currentPurchases + purchaseValue;
            
            await this.cmvService.update(period.id, {
              purchases: newPurchases,
            });
            break;
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the movement
      console.error('Error updating CMV period:', error);
    }
  }

  async getPurchasesByPeriod(startDate: string, endDate: string) {
    return this.repository.getTotalPurchasesByPeriod(new Date(startDate), new Date(endDate));
  }
}
