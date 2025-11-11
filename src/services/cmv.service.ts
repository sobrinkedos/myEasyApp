import {
  CMVRepository,
  CreatePeriodDTO,
  UpdatePeriodDTO,
  PeriodFilters,
  PeriodWithProducts,
  CreateProductDTO,
  UpdateProductDTO,
} from '@/repositories/cmv.repository';
import { NotFoundError, ValidationError, BusinessRuleError } from '@/utils/errors';
import { CMVPeriod, CMVProduct } from '@prisma/client';
import prisma from '@/config/database';

const VALID_TYPES = ['daily', 'weekly', 'monthly'];
const VALID_STATUSES = ['open', 'closed'];

export class CMVService {
  private repository: CMVRepository;

  constructor() {
    this.repository = new CMVRepository();
  }

  async createPeriod(data: CreatePeriodDTO): Promise<CMVPeriod> {
    // Validate type
    if (!VALID_TYPES.includes(data.type)) {
      throw new ValidationError('Tipo de período inválido', {
        type: [`Tipo deve ser um dos seguintes: ${VALID_TYPES.join(', ')}`],
      });
    }

    // Validate dates
    if (data.startDate >= data.endDate) {
      throw new ValidationError('Datas inválidas', {
        dates: ['Data inicial deve ser anterior à data final'],
      });
    }

    // Check for overlapping periods
    const overlapping = await this.repository.findOverlappingPeriods(
      data.startDate,
      data.endDate
    );

    if (overlapping.length > 0) {
      throw new BusinessRuleError(
        'Já existe um período CMV neste intervalo de datas'
      );
    }

    // Check if there's already an open period
    const openPeriod = await this.repository.findOpenPeriod();
    if (openPeriod) {
      throw new BusinessRuleError(
        'Já existe um período CMV aberto. Feche o período atual antes de criar um novo.'
      );
    }

    // Capture opening stock from the most recent approved appraisal
    const openingStock = await this.captureOpeningStock();

    // Create period
    return this.repository.create({
      ...data,
      openingStock,
    });
  }

  async getAll(filters?: PeriodFilters): Promise<PeriodWithProducts[]> {
    // Validate filters
    if (filters?.type && !VALID_TYPES.includes(filters.type)) {
      throw new ValidationError('Tipo de período inválido', {
        type: [`Tipo deve ser um dos seguintes: ${VALID_TYPES.join(', ')}`],
      });
    }

    if (filters?.status && !VALID_STATUSES.includes(filters.status)) {
      throw new ValidationError('Status inválido', {
        status: [`Status deve ser um dos seguintes: ${VALID_STATUSES.join(', ')}`],
      });
    }

    return this.repository.findAll(filters);
  }

  async getById(id: string): Promise<PeriodWithProducts> {
    const period = await this.repository.findById(id);

    if (!period) {
      throw new NotFoundError('Período CMV');
    }

    return period;
  }

  async update(id: string, data: UpdatePeriodDTO): Promise<CMVPeriod> {
    // Check if period exists
    const period = await this.getById(id);

    // Validate that period is not closed
    if (period.status === 'closed') {
      throw new BusinessRuleError('Período fechado não pode ser editado');
    }

    // Validate type if provided
    if (data.type && !VALID_TYPES.includes(data.type)) {
      throw new ValidationError('Tipo de período inválido', {
        type: [`Tipo deve ser um dos seguintes: ${VALID_TYPES.join(', ')}`],
      });
    }

    // Validate dates if provided
    if (data.startDate || data.endDate) {
      const startDate = data.startDate || period.startDate;
      const endDate = data.endDate || period.endDate;

      if (startDate >= endDate) {
        throw new ValidationError('Datas inválidas', {
          dates: ['Data inicial deve ser anterior à data final'],
        });
      }

      // Check for overlapping periods (excluding current period)
      const overlapping = await this.repository.findOverlappingPeriods(
        startDate,
        endDate,
        id
      );

      if (overlapping.length > 0) {
        throw new BusinessRuleError(
          'Já existe um período CMV neste intervalo de datas'
        );
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Check if period exists
    const period = await this.getById(id);

    // Validate that period is not closed
    if (period.status === 'closed') {
      throw new BusinessRuleError('Período fechado não pode ser excluído');
    }

    await this.repository.delete(id);
  }

  async closePeriod(periodId: string, closingAppraisalId: string): Promise<CMVPeriod> {
    // Get period
    const period = await this.getById(periodId);

    // Validate that period is open
    if (period.status === 'closed') {
      throw new BusinessRuleError('Período já está fechado');
    }

    // Get closing appraisal
    const appraisal = await prisma.stockAppraisal.findUnique({
      where: { id: closingAppraisalId },
    });

    if (!appraisal) {
      throw new NotFoundError('Conferência de estoque');
    }

    if (appraisal.status !== 'approved') {
      throw new BusinessRuleError('Apenas conferências aprovadas podem ser usadas');
    }

    // Use the physical stock value from appraisal as closing stock
    const closingStock = Number(appraisal.totalPhysical);

    // Calculate CMV
    const openingStock = Number(period.openingStock);
    const purchases = Number(period.purchases);
    const cmv = openingStock + purchases - closingStock;

    // Get revenue from orders
    const revenue = await this.calculateRevenue(periodId);

    // Calculate CMV percentage
    const cmvPercentage = revenue > 0 ? (cmv / revenue) * 100 : 0;

    // Update period
    return this.repository.update(periodId, {
      closingStock,
      cmv,
      revenue,
      cmvPercentage,
      status: 'closed',
      closedAt: new Date(),
    });
  }

  async registerPurchase(periodId: string, amount: number): Promise<CMVPeriod> {
    // Check if period exists
    const period = await this.getById(periodId);

    // Validate that period is open
    if (period.status !== 'open') {
      throw new BusinessRuleError('Apenas períodos abertos podem registrar compras');
    }

    // Validate amount
    if (amount < 0) {
      throw new ValidationError('Valor de compra inválido', {
        amount: ['Valor de compra não pode ser negativo'],
      });
    }

    // Add purchase amount to period
    const newPurchases = Number(period.purchases) + amount;

    return this.repository.update(periodId, {
      purchases: newPurchases,
    });
  }

  async capturePurchasesFromTransactions(periodId: string): Promise<number> {
    // Get period
    const period = await this.getById(periodId);

    // Get all purchase transactions within the period
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        type: 'purchase',
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      include: {
        ingredient: {
          select: {
            averageCost: true,
          },
        },
        stockItem: {
          select: {
            costPrice: true,
          },
        },
      },
    });

    // Calculate total purchase value
    const totalPurchases = transactions.reduce((sum, transaction) => {
      let unitCost = 0;
      
      if (transaction.ingredient) {
        unitCost = Number(transaction.ingredient.averageCost);
      } else if (transaction.stockItem) {
        unitCost = Number(transaction.stockItem.costPrice);
      }
      
      const value = Number(transaction.quantity) * unitCost;
      return sum + value;
    }, 0);

    return totalPurchases;
  }

  async getPurchaseHistory(periodId: string): Promise<{
    transactions: Array<{
      id: string;
      ingredientId?: string;
      stockItemId?: string;
      itemName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      date: Date;
    }>;
    totalPurchases: number;
  }> {
    // Get period
    const period = await this.getById(periodId);

    // Get all purchase transactions within the period
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        type: 'purchase',
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            averageCost: true,
          },
        },
        stockItem: {
          select: {
            id: true,
            name: true,
            costPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map transactions to response format
    const mappedTransactions = transactions.map((transaction) => {
      let itemName = '';
      let unitCost = 0;
      
      if (transaction.ingredient) {
        itemName = transaction.ingredient.name;
        unitCost = Number(transaction.ingredient.averageCost);
      } else if (transaction.stockItem) {
        itemName = transaction.stockItem.name;
        unitCost = Number(transaction.stockItem.costPrice);
      }
      
      return {
        id: transaction.id,
        ingredientId: transaction.ingredientId || undefined,
        stockItemId: transaction.stockItemId || undefined,
        itemName,
        quantity: Number(transaction.quantity),
        unitCost,
        totalCost: Number(transaction.quantity) * unitCost,
        date: transaction.createdAt,
      };
    });

    // Calculate total purchases
    const totalPurchases = mappedTransactions.reduce((sum, transaction) => {
      return sum + transaction.totalCost;
    }, 0);

    return {
      transactions: mappedTransactions,
      totalPurchases,
    };
  }

  async calculateCMV(periodId: string): Promise<{
    openingStock: number;
    purchases: number;
    closingStock: number;
    cmv: number;
    revenue: number;
    cmvPercentage: number;
    grossMargin: number;
    grossMarginPercentage: number;
  }> {
    // Get period
    const period = await this.getById(periodId);

    // Note: closingStock can be zero if there's no stock at the end of the period
    // This is valid and should not throw an error

    const openingStock = Number(period.openingStock);
    const purchases = Number(period.purchases);
    const closingStock = Number(period.closingStock);

    // CMV = Estoque Inicial + Compras - Estoque Final
    const cmv = openingStock + purchases - closingStock;

    // Get revenue from orders in the period
    const revenue = await this.calculateRevenue(periodId);

    // CMV % = (CMV / Receita) × 100
    const cmvPercentage = revenue > 0 ? (cmv / revenue) * 100 : 0;

    // Margem Bruta = Receita - CMV
    const grossMargin = revenue - cmv;

    // Margem Bruta % = (Margem Bruta / Receita) × 100
    const grossMarginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

    return {
      openingStock,
      purchases,
      closingStock,
      cmv,
      revenue,
      cmvPercentage,
      grossMargin,
      grossMarginPercentage,
    };
  }

  async calculateCMVPercentage(cmv: number, revenue: number): Promise<number> {
    if (revenue <= 0) {
      return 0;
    }

    return (cmv / revenue) * 100;
  }

  async calculateGrossMargin(revenue: number, cmv: number): Promise<{
    margin: number;
    marginPercentage: number;
  }> {
    const margin = revenue - cmv;
    const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

    return {
      margin,
      marginPercentage,
    };
  }

  async calculateProductCMV(periodId: string): Promise<Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    cmv: number;
    margin: number;
    marginPercentage: number;
    theoreticalMarginPercentage: number;
    marginDifference: number;
  }>> {
    // Get period
    const period = await this.getById(periodId);

    // Get all order items within the period
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
          status: {
            not: 'cancelled',
          },
        },
      },
      include: {
        product: {
          include: {
            recipe: {
              select: {
                costPerPortion: true,
              },
            },
          },
        },
      },
    });

    // Group by product and calculate metrics
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      quantitySold: number;
      revenue: number;
      cost: number;
      theoreticalMarginPercentage: number;
    }>();

    for (const item of orderItems) {
      const productId = item.product.id;
      const existing = productMap.get(productId);

      const quantity = item.quantity;
      const revenue = Number(item.subtotal);
      const costPerPortion = item.product.recipe 
        ? Number(item.product.recipe.costPerPortion)
        : 0;
      const cost = costPerPortion * quantity;
      const theoreticalMargin = item.product.targetMargin 
        ? Number(item.product.targetMargin)
        : 0;

      if (existing) {
        existing.quantitySold += quantity;
        existing.revenue += revenue;
        existing.cost += cost;
      } else {
        productMap.set(productId, {
          productId,
          productName: item.product.name,
          quantitySold: quantity,
          revenue,
          cost,
          theoreticalMarginPercentage: theoreticalMargin,
        });
      }
    }

    // Calculate CMV and margins for each product
    const results = Array.from(productMap.values()).map((product) => {
      const cmv = product.cost;
      const margin = product.revenue - cmv;
      const marginPercentage = product.revenue > 0 
        ? (margin / product.revenue) * 100 
        : 0;
      const marginDifference = marginPercentage - product.theoreticalMarginPercentage;

      return {
        ...product,
        cmv,
        margin,
        marginPercentage,
        marginDifference,
      };
    });

    // Sort by CMV descending (highest cost first)
    results.sort((a, b) => b.cmv - a.cmv);

    return results;
  }

  async saveProductCMV(periodId: string): Promise<void> {
    try {
      // Calculate product CMV
      console.log('[CMV] Calculando CMV por produto...');
      const products = await this.calculateProductCMV(periodId);
      console.log(`[CMV] ${products.length} produtos calculados`);

      // Save each product to the database
      for (const product of products) {
        // Check if product already exists for this period
        const existing = await prisma.cMVProduct.findUnique({
          where: {
            periodId_productId: {
              periodId,
              productId: product.productId,
            },
          },
        });

        if (existing) {
          // Update existing
          await this.repository.updateProduct(periodId, product.productId, {
            quantitySold: product.quantitySold,
            revenue: product.revenue,
            cost: product.cost,
            cmv: product.cmv,
            margin: product.margin,
            marginPercentage: product.marginPercentage,
          });
        } else {
          // Create new
          await this.repository.addProduct(periodId, {
            productId: product.productId,
            quantitySold: product.quantitySold,
            revenue: product.revenue,
            cost: product.cost,
            cmv: product.cmv,
            margin: product.margin,
            marginPercentage: product.marginPercentage,
          });
        }
      }
    } catch (error) {
      console.error('[CMV] Erro em saveProductCMV:', error);
      throw error;
    }
  }

  async getProductRanking(periodId: string): Promise<Array<{
    rank: number;
    productId: string;
    productName: string;
    cmv: number;
    cmvPercentage: number;
  }>> {
    // Get product CMV data
    const products = await this.calculateProductCMV(periodId);

    // Calculate total CMV
    const totalCMV = products.reduce((sum, product) => sum + product.cmv, 0);

    // Create ranking with percentages
    const ranking = products.map((product, index) => ({
      rank: index + 1,
      productId: product.productId,
      productName: product.productName,
      cmv: product.cmv,
      cmvPercentage: totalCMV > 0 ? (product.cmv / totalCMV) * 100 : 0,
    }));

    return ranking;
  }

  async closePeriod(periodId: string, closingAppraisalId?: string): Promise<CMVPeriod> {
    try {
      console.log('[CMV] Iniciando fechamento do período:', periodId);
      
      // Get period
      const period = await this.getById(periodId);
      console.log('[CMV] Período encontrado:', period.id);

      // Validate that period is open
      if (period.status !== 'open') {
        throw new BusinessRuleError('Apenas períodos abertos podem ser fechados');
      }

      // Get closing stock from appraisal or calculate current stock
      let closingStock: number;

      if (closingAppraisalId) {
        console.log('[CMV] Buscando conferência de fechamento:', closingAppraisalId);
        
        // Validate that appraisal exists and is approved
        const appraisal = await prisma.stockAppraisal.findUnique({
          where: { id: closingAppraisalId },
        });

        if (!appraisal) {
          throw new NotFoundError('Conferência de estoque');
        }

        if (appraisal.status !== 'approved') {
          throw new BusinessRuleError(
            'Conferência de estoque deve estar aprovada para fechar o período'
          );
        }

        closingStock = Number(appraisal.totalPhysical);
        console.log('[CMV] Estoque de fechamento:', closingStock);
      } else {
        console.log('[CMV] Buscando última conferência aprovada no período');
        
        // Find the most recent approved appraisal
        const lastAppraisal = await prisma.stockAppraisal.findFirst({
          where: { 
            status: 'approved',
            approvedAt: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
          orderBy: { approvedAt: 'desc' },
        });

        if (!lastAppraisal) {
          throw new BusinessRuleError(
            'É necessário realizar uma conferência de estoque final antes de fechar o período'
          );
        }

        closingStock = Number(lastAppraisal.totalPhysical);
        console.log('[CMV] Estoque de fechamento:', closingStock);
      }

      // Capture purchases from transactions
      console.log('[CMV] Capturando compras...');
      const purchases = await this.capturePurchasesFromTransactions(periodId);
      console.log('[CMV] Compras capturadas:', purchases);

      // Calculate revenue
      console.log('[CMV] Calculando receita...');
      const revenue = await this.calculateRevenue(periodId);
      console.log('[CMV] Receita calculada:', revenue);

      // Calculate CMV
      console.log('[CMV] Calculando CMV...');
      const cmvData = await this.calculateCMV(periodId);
      console.log('[CMV] CMV calculado:', cmvData);

      // Save product CMV data
      console.log('[CMV] Salvando CMV por produto...');
      try {
        await this.saveProductCMV(periodId);
        console.log('[CMV] CMV por produto salvo');
      } catch (error) {
        console.error('[CMV] Erro ao salvar CMV por produto:', error);
        throw new BusinessRuleError(`Erro ao salvar CMV por produto: ${error.message}`);
      }

      // Update period with final values
      console.log('[CMV] Atualizando período...');
      const updatedPeriod = await this.repository.update(periodId, {
        closingStock,
        purchases,
        revenue,
        cmv: cmvData.cmv,
        cmvPercentage: cmvData.cmvPercentage,
        status: 'closed',
        closedAt: new Date(),
      });

      console.log('[CMV] Período fechado com sucesso');
      return updatedPeriod;
    } catch (error) {
      console.error('[CMV] Erro ao fechar período:', error);
      throw error;
    }
  }

  private async calculateRevenue(periodId: string): Promise<number> {
    // Get period
    const period = await this.getById(periodId);

    // Get all orders within the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
        status: {
          not: 'cancelled',
        },
      },
      select: {
        subtotal: true,
      },
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.subtotal);
    }, 0);

    return totalRevenue;
  }

  private async captureOpeningStock(): Promise<number> {
    // Find the most recent approved appraisal
    const lastAppraisal = await prisma.stockAppraisal.findFirst({
      where: { status: 'approved' },
      orderBy: { approvedAt: 'desc' },
      select: { totalPhysical: true },
    });

    if (!lastAppraisal) {
      // If no appraisal exists, calculate current stock value
      const ingredients = await prisma.ingredient.findMany({
        select: {
          currentQuantity: true,
          averageCost: true,
        },
      });

      const totalStock = ingredients.reduce((sum, ingredient) => {
        return sum + Number(ingredient.currentQuantity) * Number(ingredient.averageCost);
      }, 0);

      return totalStock;
    }

    return Number(lastAppraisal.totalPhysical);
  }

  /**
   * Calculate consolidated CMV (Ingredients + Stock Items)
   */
  async calculateConsolidatedCMV(periodId: string, establishmentId: string): Promise<{
    ingredients: {
      openingStock: number;
      purchases: number;
      closingStock: number;
      cmv: number;
      cmvPercentage: number;
    };
    stockItems: {
      openingStock: number;
      purchases: number;
      closingStock: number;
      cmv: number;
      cmvPercentage: number;
    };
    consolidated: {
      openingStock: number;
      purchases: number;
      closingStock: number;
      cmv: number;
      revenue: number;
      cmvPercentage: number;
      grossMargin: number;
      grossMarginPercentage: number;
    };
  }> {
    const period = await this.getById(periodId);

    // Calculate ingredients CMV (existing logic)
    const ingredientsOpeningStock = await this.captureOpeningStockIngredients();
    const ingredientsPurchases = await this.capturePurchasesFromTransactions(periodId);
    const ingredientsClosingStock = await this.captureClosingStockIngredients();
    const ingredientsCMV = ingredientsOpeningStock + ingredientsPurchases - ingredientsClosingStock;

    // Calculate stock items CMV
    const stockItemsOpeningStock = await this.captureOpeningStockItems(establishmentId);
    const stockItemsPurchases = await this.captureStockItemsPurchases(periodId, establishmentId);
    const stockItemsClosingStock = await this.captureClosingStockItems(establishmentId);
    const stockItemsCMV = stockItemsOpeningStock + stockItemsPurchases - stockItemsClosingStock;

    // Calculate consolidated values
    const consolidatedOpeningStock = ingredientsOpeningStock + stockItemsOpeningStock;
    const consolidatedPurchases = ingredientsPurchases + stockItemsPurchases;
    const consolidatedClosingStock = ingredientsClosingStock + stockItemsClosingStock;
    const consolidatedCMV = ingredientsCMV + stockItemsCMV;

    // Get revenue
    const revenue = await this.calculateRevenue(periodId);

    // Calculate percentages
    const ingredientsCMVPercentage = revenue > 0 ? (ingredientsCMV / revenue) * 100 : 0;
    const stockItemsCMVPercentage = revenue > 0 ? (stockItemsCMV / revenue) * 100 : 0;
    const consolidatedCMVPercentage = revenue > 0 ? (consolidatedCMV / revenue) * 100 : 0;
    const grossMargin = revenue - consolidatedCMV;
    const grossMarginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

    // Update period with consolidated values
    await this.repository.update(periodId, {
      openingStockIngredients: ingredientsOpeningStock,
      openingStockItems: stockItemsOpeningStock,
      openingStock: consolidatedOpeningStock,
      purchasesIngredients: ingredientsPurchases,
      purchasesStockItems: stockItemsPurchases,
      purchases: consolidatedPurchases,
      closingStockIngredients: ingredientsClosingStock,
      closingStockItems: stockItemsClosingStock,
      closingStock: consolidatedClosingStock,
      cmvIngredients: ingredientsCMV,
      cmvStockItems: stockItemsCMV,
      cmv: consolidatedCMV,
      revenue,
      cmvPercentage: consolidatedCMVPercentage,
    });

    return {
      ingredients: {
        openingStock: ingredientsOpeningStock,
        purchases: ingredientsPurchases,
        closingStock: ingredientsClosingStock,
        cmv: ingredientsCMV,
        cmvPercentage: ingredientsCMVPercentage,
      },
      stockItems: {
        openingStock: stockItemsOpeningStock,
        purchases: stockItemsPurchases,
        closingStock: stockItemsClosingStock,
        cmv: stockItemsCMV,
        cmvPercentage: stockItemsCMVPercentage,
      },
      consolidated: {
        openingStock: consolidatedOpeningStock,
        purchases: consolidatedPurchases,
        closingStock: consolidatedClosingStock,
        cmv: consolidatedCMV,
        revenue,
        cmvPercentage: consolidatedCMVPercentage,
        grossMargin,
        grossMarginPercentage,
      },
    };
  }

  private async captureOpeningStockIngredients(): Promise<number> {
    const ingredients = await prisma.ingredient.findMany({
      select: {
        currentQuantity: true,
        averageCost: true,
      },
    });

    return ingredients.reduce((sum, ingredient) => {
      return sum + Number(ingredient.currentQuantity) * Number(ingredient.averageCost);
    }, 0);
  }

  private async captureClosingStockIngredients(): Promise<number> {
    return this.captureOpeningStockIngredients();
  }

  private async captureOpeningStockItems(establishmentId: string): Promise<number> {
    const stockItems = await prisma.stockItem.findMany({
      where: { establishmentId, isActive: true },
      select: {
        currentQuantity: true,
        costPrice: true,
      },
    });

    return stockItems.reduce((sum, item) => {
      return sum + Number(item.currentQuantity) * Number(item.costPrice);
    }, 0);
  }

  private async captureClosingStockItems(establishmentId: string): Promise<number> {
    return this.captureOpeningStockItems(establishmentId);
  }

  private async captureStockItemsPurchases(
    periodId: string,
    establishmentId: string
  ): Promise<number> {
    const period = await this.getById(periodId);

    const movements = await prisma.stockMovement.findMany({
      where: {
        type: 'entrada',
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
        stockItem: {
          establishmentId,
        },
      },
      select: {
        totalCost: true,
      },
    });

    return movements.reduce((sum, movement) => {
      return sum + (movement.totalCost ? Number(movement.totalCost) : 0);
    }, 0);
  }
}
