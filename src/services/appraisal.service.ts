import {
  AppraisalRepository,
  CreateAppraisalDTO,
  UpdateAppraisalDTO,
  AppraisalFilters,
  AppraisalWithItems,
  CreateAppraisalItemDTO,
  UpdateAppraisalItemDTO,
} from '@/repositories/appraisal.repository';
import { NotFoundError, ValidationError, BusinessRuleError } from '@/utils/errors';
import { StockAppraisal, StockAppraisalItem } from '@prisma/client';
import prisma from '@/config/database';

const VALID_TYPES = ['daily', 'weekly', 'monthly'];
const VALID_STATUSES = ['pending', 'completed', 'approved'];

export class AppraisalService {
  private repository: AppraisalRepository;

  constructor() {
    this.repository = new AppraisalRepository();
  }

  async create(data: CreateAppraisalDTO & {
    includeIngredients?: boolean;
    includeStockItems?: boolean;
    establishmentId?: string;
  }): Promise<StockAppraisal> {
    // Validate type
    if (!VALID_TYPES.includes(data.type)) {
      throw new ValidationError('Tipo de conferência inválido', {
        type: [`Tipo deve ser um dos seguintes: ${VALID_TYPES.join(', ')}`],
      });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    // Default: include ingredients, exclude stock items
    const includeIngredients = data.includeIngredients !== false;
    const includeStockItems = data.includeStockItems === true;

    // Create appraisal
    const appraisal = await this.repository.create(data);

    // Capture theoretical stock
    await this.captureTheoreticalStock(appraisal.id, {
      includeIngredients,
      includeStockItems,
      establishmentId: data.establishmentId || user.establishmentId,
    });

    return appraisal;
  }

  async getAll(filters?: AppraisalFilters): Promise<AppraisalWithItems[]> {
    // Validate filters
    if (filters?.type && !VALID_TYPES.includes(filters.type)) {
      throw new ValidationError('Tipo de conferência inválido', {
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

  async getById(id: string): Promise<AppraisalWithItems> {
    const appraisal = await this.repository.findById(id);

    if (!appraisal) {
      throw new NotFoundError('Conferência de estoque');
    }

    return appraisal;
  }

  async update(id: string, data: UpdateAppraisalDTO): Promise<StockAppraisal> {
    // Check if appraisal exists
    const appraisal = await this.getById(id);

    // Validate that appraisal is not approved
    if (appraisal.status === 'approved') {
      throw new BusinessRuleError('Conferência aprovada não pode ser editada');
    }

    // Validate type if provided
    if (data.type && !VALID_TYPES.includes(data.type)) {
      throw new ValidationError('Tipo de conferência inválido', {
        type: [`Tipo deve ser um dos seguintes: ${VALID_TYPES.join(', ')}`],
      });
    }

    // Validate status if provided
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw new ValidationError('Status inválido', {
        status: [`Status deve ser um dos seguintes: ${VALID_STATUSES.join(', ')}`],
      });
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Check if appraisal exists
    const appraisal = await this.getById(id);

    // Validate that appraisal is not approved
    if (appraisal.status === 'approved') {
      throw new BusinessRuleError('Conferência aprovada não pode ser excluída');
    }

    await this.repository.delete(id);
  }

  async addItem(appraisalId: string, data: CreateAppraisalItemDTO & {
    itemType?: 'ingredient' | 'stock_item';
    stockItemId?: string;
  }): Promise<StockAppraisalItem> {
    // Check if appraisal exists
    const appraisal = await this.getById(appraisalId);

    // Validate that appraisal is not approved
    if (appraisal.status === 'approved') {
      throw new BusinessRuleError('Não é possível adicionar itens a uma conferência aprovada');
    }

    const itemType = data.itemType || 'ingredient';

    // Validate item exists based on type
    if (itemType === 'ingredient') {
      if (!data.ingredientId) {
        throw new ValidationError('ID do ingrediente é obrigatório');
      }

      const ingredient = await prisma.ingredient.findUnique({
        where: { id: data.ingredientId },
      });

      if (!ingredient) {
        throw new NotFoundError('Ingrediente');
      }
    } else if (itemType === 'stock_item') {
      if (!data.stockItemId) {
        throw new ValidationError('ID do item de estoque é obrigatório');
      }

      const stockItem = await prisma.stockItem.findUnique({
        where: { id: data.stockItemId },
      });

      if (!stockItem) {
        throw new NotFoundError('Item de estoque');
      }
    }

    // Validate quantities
    if (data.theoreticalQuantity < 0) {
      throw new ValidationError('Quantidade teórica inválida', {
        theoreticalQuantity: ['Quantidade teórica não pode ser negativa'],
      });
    }

    if (data.unitCost < 0) {
      throw new ValidationError('Custo unitário inválido', {
        unitCost: ['Custo unitário não pode ser negativo'],
      });
    }

    return this.repository.addItem(appraisalId, {
      ...data,
      itemType,
    });
  }

  async updateItem(
    appraisalId: string,
    itemId: string,
    data: UpdateAppraisalItemDTO
  ): Promise<StockAppraisalItem> {
    // Check if appraisal exists
    const appraisal = await this.getById(appraisalId);

    // Validate that appraisal is not approved
    if (appraisal.status === 'approved') {
      throw new BusinessRuleError('Não é possível atualizar itens de uma conferência aprovada');
    }

    // Validate physical quantity if provided
    if (data.physicalQuantity !== undefined && data.physicalQuantity < 0) {
      throw new ValidationError('Quantidade física inválida', {
        physicalQuantity: ['Quantidade física não pode ser negativa'],
      });
    }

    return this.repository.updateItem(appraisalId, itemId, data);
  }

  async removeItem(appraisalId: string, itemId: string): Promise<void> {
    // Check if appraisal exists
    const appraisal = await this.getById(appraisalId);

    // Validate that appraisal is not approved
    if (appraisal.status === 'approved') {
      throw new BusinessRuleError('Não é possível remover itens de uma conferência aprovada');
    }

    await this.repository.removeItem(appraisalId, itemId);
  }

  calculateDivergence(
    theoreticalQuantity: number,
    physicalQuantity: number
  ): {
    difference: number;
    percentage: number;
    type: 'surplus' | 'shortage' | 'none';
  } {
    const difference = physicalQuantity - theoreticalQuantity;
    const percentage =
      theoreticalQuantity > 0 ? (difference / theoreticalQuantity) * 100 : 0;

    let type: 'surplus' | 'shortage' | 'none';
    if (difference > 0) {
      type = 'surplus';
    } else if (difference < 0) {
      type = 'shortage';
    } else {
      type = 'none';
    }

    return {
      difference,
      percentage,
      type,
    };
  }

  calculateItemCost(difference: number, unitCost: number): number {
    return difference * unitCost;
  }

  async calculateTotalDifference(appraisalId: string): Promise<number> {
    const items = await this.repository.findItemsByAppraisalId(appraisalId);

    const totalDifference = items.reduce((sum, item) => {
      if (item.totalDifference) {
        return sum + Number(item.totalDifference);
      }
      return sum;
    }, 0);

    return totalDifference;
  }

  async calculateAccuracy(appraisalId: string): Promise<{
    accuracy: number;
    classification: 'green' | 'yellow' | 'red';
  }> {
    const items = await this.repository.findItemsByAppraisalId(appraisalId);

    // Calculate total theoretical value
    const totalTheoretical = items.reduce((sum, item) => {
      return sum + Number(item.theoreticalQuantity) * Number(item.unitCost);
    }, 0);

    // Calculate total absolute difference value
    const totalAbsoluteDifference = items.reduce((sum, item) => {
      if (item.totalDifference) {
        return sum + Math.abs(Number(item.totalDifference));
      }
      return sum;
    }, 0);

    // Calculate accuracy percentage
    let accuracy = 100;
    if (totalTheoretical > 0) {
      accuracy = (1 - totalAbsoluteDifference / totalTheoretical) * 100;
    }

    // Ensure accuracy is between 0 and 100
    accuracy = Math.max(0, Math.min(100, accuracy));

    // Classify accuracy
    let classification: 'green' | 'yellow' | 'red';
    if (accuracy > 95) {
      classification = 'green';
    } else if (accuracy >= 90) {
      classification = 'yellow';
    } else {
      classification = 'red';
    }

    return {
      accuracy,
      classification,
    };
  }

  async complete(appraisalId: string): Promise<StockAppraisal> {
    // Check if appraisal exists
    const appraisal = await this.getById(appraisalId);

    // Validate that appraisal is pending
    if (appraisal.status !== 'pending') {
      throw new BusinessRuleError('Apenas conferências pendentes podem ser completadas');
    }

    // Get all items
    const items = await this.repository.findItemsByAppraisalId(appraisalId);

    // Validate that all items have been counted
    // physicalQuantity can be 0 (zero), but cannot be null or undefined
    const uncountedItems = items.filter((item) => item.physicalQuantity === null || item.physicalQuantity === undefined);
    if (uncountedItems.length > 0) {
      // Log uncounted items for debugging
      console.log('Uncounted items:', uncountedItems.map(i => ({
        id: i.id,
        name: i.ingredient?.name || i.stockItem?.name || 'Unknown',
        physicalQuantity: i.physicalQuantity,
      })));
      
      throw new BusinessRuleError(
        `Existem ${uncountedItems.length} itens não contados. Todos os itens devem ser contados antes de completar a conferência.`
      );
    }

    // Calculate totals
    const totalTheoretical = items.reduce((sum, item) => {
      return sum + Number(item.theoreticalQuantity) * Number(item.unitCost);
    }, 0);

    const totalPhysical = items.reduce((sum, item) => {
      return sum + Number(item.physicalQuantity || 0) * Number(item.unitCost);
    }, 0);

    const totalDifference = totalPhysical - totalTheoretical;

    // Calculate accuracy
    const { accuracy } = await this.calculateAccuracy(appraisalId);

    // Update appraisal
    return this.repository.update(appraisalId, {
      status: 'completed',
      totalTheoretical,
      totalPhysical,
      totalDifference,
      accuracy,
      completedAt: new Date(),
    });
  }

  async approve(appraisalId: string, approverId: string): Promise<StockAppraisal> {
    // Check if appraisal exists
    const appraisal = await this.getById(appraisalId);

    // Validate that appraisal is completed
    if (appraisal.status !== 'completed') {
      throw new BusinessRuleError('Apenas conferências completadas podem ser aprovadas');
    }

    // Validate approver exists
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver) {
      throw new NotFoundError('Usuário aprovador');
    }

    // Adjust stock to match physical quantities
    await this.adjustStock(appraisalId);

    // Update appraisal
    return this.repository.update(appraisalId, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
    });
  }

  private async adjustStock(appraisalId: string): Promise<void> {
    const items = await this.repository.findItemsByAppraisalId(appraisalId);

    // Update each item's current quantity to match physical quantity
    for (const item of items) {
      if (item.physicalQuantity !== null) {
        if (item.itemType === 'ingredient' && item.ingredientId) {
          await prisma.ingredient.update({
            where: { id: item.ingredientId },
            data: {
              currentQuantity: item.physicalQuantity,
            },
          });
        } else if (item.itemType === 'stock_item' && item.stockItemId) {
          await prisma.stockItem.update({
            where: { id: item.stockItemId },
            data: {
              currentQuantity: item.physicalQuantity,
            },
          });
        }
      }
    }
  }

  private async captureTheoreticalStock(
    appraisalId: string,
    options: {
      includeIngredients?: boolean;
      includeStockItems?: boolean;
      establishmentId?: string;
    } = {}
  ): Promise<void> {
    const { includeIngredients = true, includeStockItems = false, establishmentId } = options;

    // Capture ingredients
    if (includeIngredients) {
      const ingredients = await prisma.ingredient.findMany({
        select: {
          id: true,
          currentQuantity: true,
          averageCost: true,
        },
      });

      for (const ingredient of ingredients) {
        await this.repository.addItem(appraisalId, {
          ingredientId: ingredient.id,
          itemType: 'ingredient',
          theoreticalQuantity: Number(ingredient.currentQuantity),
          unitCost: Number(ingredient.averageCost),
        });
      }
    }

    // Capture stock items
    if (includeStockItems && establishmentId) {
      const stockItems = await prisma.stockItem.findMany({
        where: {
          establishmentId,
          isActive: true,
        },
        select: {
          id: true,
          currentQuantity: true,
          costPrice: true,
        },
      });

      for (const item of stockItems) {
        await this.repository.addItem(appraisalId, {
          stockItemId: item.id,
          itemType: 'stock_item',
          theoreticalQuantity: Number(item.currentQuantity),
          unitCost: Number(item.costPrice),
        });
      }
    }
  }
}
