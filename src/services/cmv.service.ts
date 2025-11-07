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
      },
    });

    // Calculate total purchase value
    const totalPurchases = transactions.reduce((sum, transaction) => {
      const value = Number(transaction.quantity) * Number(transaction.ingredient.averageCost);
      return sum + value;
    }, 0);

    return totalPurchases;
  }

  async getPurchaseHistory(periodId: string): Promise<{
    transactions: Array<{
      id: string;
      ingredientId: string;
      ingredientName: string;
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map transactions to response format
    const mappedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      ingredientId: transaction.ingredient.id,
      ingredientName: transaction.ingredient.name,
      quantity: Number(transaction.quantity),
      unitCost: Number(transaction.ingredient.averageCost),
      totalCost: Number(transaction.quantity) * Number(transaction.ingredient.averageCost),
      date: transaction.createdAt,
    }));

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

    // Validate that period has closing stock (must be closed or have a final appraisal)
    if (period.status === 'open' && Number(period.closingStock) === 0) {
      throw new BusinessRuleError(
        'Período deve ter conferência de estoque final para calcular CMV'
      );
    }

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
    // Calculate product CMV
    const products = await this.calculateProductCMV(periodId);

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
    // Get period
    const period = await this.getById(periodId);

    // Validate that period is open
    if (period.status !== 'open') {
      throw new BusinessRuleError('Apenas períodos abertos podem ser fechados');
    }

    // Get closing stock from appraisal or calculate current stock
    let closingStock: number;

    if (closingAppraisalId) {
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
    } else {
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
    }

    // Capture purchases from transactions
    const purchases = await this.capturePurchasesFromTransactions(periodId);

    // Calculate revenue
    const revenue = await this.calculateRevenue(periodId);

    // Calculate CMV
    const cmvData = await this.calculateCMV(periodId);

    // Save product CMV data
    await this.saveProductCMV(periodId);

    // Update period with final values
    const updatedPeriod = await this.repository.update(periodId, {
      closingStock,
      purchases,
      revenue,
      cmv: cmvData.cmv,
      cmvPercentage: cmvData.cmvPercentage,
      status: 'closed',
      closedAt: new Date(),
    });

    return updatedPeriod;
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
}
