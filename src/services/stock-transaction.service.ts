import { StockTransactionRepository } from '@/repositories/stock-transaction.repository';
import { IngredientService } from '@/services/ingredient.service';
import { CMVService } from '@/services/cmv.service';
import { CreateStockTransactionData, UpdateStockTransactionData, BulkCreateStockTransactionData } from '@/models/stock-transaction.model';
import { NotFoundError } from '@/utils/errors';

export class StockTransactionService {
  private repository: StockTransactionRepository;
  private ingredientService: IngredientService;
  private cmvService: CMVService;

  constructor() {
    this.repository = new StockTransactionRepository();
    this.ingredientService = new IngredientService();
    this.cmvService = new CMVService();
  }

  async create(data: CreateStockTransactionData, userId: string) {
    // Validate ingredient exists
    await this.ingredientService.getById(data.ingredientId);

    // Calculate total value if not provided
    if (!data.totalValue && data.unitCost) {
      data.totalValue = data.quantity * data.unitCost;
    }

    // Create transaction
    const transaction = await this.repository.create({ ...data, userId });

    // Update ingredient stock based on transaction type
    await this.updateIngredientStock(data.ingredientId, data.type, data.quantity, data.unitCost);

    // Update CMV period if applicable (purchase type)
    if (data.type === 'purchase') {
      await this.updateCMVPeriod(data.totalValue || 0, new Date());
    }

    return transaction;
  }

  async createBulk(data: BulkCreateStockTransactionData, userId: string) {
    const transactions = data.transactions.map(transaction => ({
      ...transaction,
      userId,
      totalValue: transaction.totalValue || (transaction.unitCost && transaction.quantity ? transaction.quantity * transaction.unitCost : undefined),
    }));

    // Create all transactions
    await this.repository.createMany(transactions);

    // Update ingredient stocks and CMV
    for (const transaction of data.transactions) {
      await this.updateIngredientStock(
        transaction.ingredientId,
        transaction.type,
        transaction.quantity,
        transaction.unitCost
      );

      if (transaction.type === 'purchase') {
        const totalValue = transaction.totalValue || (transaction.unitCost && transaction.quantity ? transaction.quantity * transaction.unitCost : 0);
        await this.updateCMVPeriod(totalValue, new Date());
      }
    }

    return { success: true, count: transactions.length };
  }

  async getAll(filters?: {
    ingredientId?: string;
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
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundError('Transação de estoque');
    }
    return transaction;
  }

  async getByIngredient(ingredientId: string, limit?: number) {
    // Validate ingredient exists
    await this.ingredientService.getById(ingredientId);
    return this.repository.findByIngredient(ingredientId, limit);
  }

  async update(id: string, data: UpdateStockTransactionData) {
    // Check if transaction exists
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    // Check if transaction exists
    const transaction = await this.getById(id);

    // Reverse the stock movement
    const reverseQuantity = transaction.type === 'purchase' || transaction.type === 'adjustment' 
      ? -Number(transaction.quantity) 
      : Number(transaction.quantity);

    await this.updateIngredientStock(
      transaction.ingredientId,
      transaction.type,
      reverseQuantity,
      Number(transaction.unitCost || 0)
    );

    // Reverse CMV if it was a purchase
    if (transaction.type === 'purchase' && transaction.totalValue) {
      await this.updateCMVPeriod(-Number(transaction.totalValue), transaction.createdAt);
    }

    return this.repository.delete(id);
  }

  private async updateIngredientStock(
    ingredientId: string,
    type: string,
    quantity: number,
    unitCost?: number
  ) {
    const ingredient = await this.ingredientService.getById(ingredientId);
    const currentQuantity = Number(ingredient.currentQuantity || 0);
    const currentCost = Number(ingredient.averageCost || 0);

    let newQuantity = currentQuantity;
    let newAverageCost = currentCost;

    switch (type) {
      case 'purchase':
        newQuantity = currentQuantity + quantity;
        if (unitCost && newQuantity > 0) {
          // Calculate weighted average cost
          const totalValue = (currentQuantity * currentCost) + (quantity * unitCost);
          newAverageCost = totalValue / newQuantity;
        }
        break;

      case 'usage':
      case 'waste':
        newQuantity = Math.max(0, currentQuantity - quantity);
        // Average cost remains the same for usage/waste
        break;

      case 'adjustment':
        newQuantity = currentQuantity + quantity; // quantity can be negative for adjustments
        if (unitCost && newQuantity > 0) {
          newAverageCost = unitCost;
        }
        break;
    }

    await this.ingredientService.update(ingredientId, {
      currentQuantity: newQuantity,
      averageCost: newAverageCost,
    });
  }

  private async updateCMVPeriod(purchaseValue: number, transactionDate: Date) {
    try {
      // Find open CMV period that includes this date
      const openPeriods = await this.cmvService.getAll({ status: 'open' });
      
      if (openPeriods && openPeriods.length > 0) {
        for (const period of openPeriods) {
          const startDate = new Date(period.startDate);
          const endDate = new Date(period.endDate);
          
          if (transactionDate >= startDate && transactionDate <= endDate) {
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
      // Log error but don't fail the transaction
      console.error('Error updating CMV period:', error);
    }
  }

  async getPurchasesByPeriod(startDate: string, endDate: string) {
    return this.repository.getTotalPurchasesByPeriod(new Date(startDate), new Date(endDate));
  }
}
