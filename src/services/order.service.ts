import { OrderRepository, CreateOrderItemDTO, UpdateOrderDTO } from '@/repositories/order.repository';
import { CommandService } from '@/services/command.service';
import { ProductRepository } from '@/repositories/product.repository';
import { StockItemRepository } from '@/repositories/stock-item.repository';
import { StockIntegrationService } from '@/services/stock-integration.service';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { Order } from '@prisma/client';
import { cacheService } from '@/utils/cache';

export interface CreateOrderDTO {
  commandId: string;
  items: CreateOrderItemDTO[];
}

const OPEN_COMMANDS_CACHE_KEY = 'commands:open';

export class OrderService {
  private repository: OrderRepository;
  private commandService: CommandService;
  private productRepository: ProductRepository;
  private stockItemRepository: StockItemRepository;
  private stockIntegrationService: StockIntegrationService;

  constructor() {
    this.repository = new OrderRepository();
    this.commandService = new CommandService();
    this.productRepository = new ProductRepository();
    this.stockItemRepository = new StockItemRepository();
    this.stockIntegrationService = new StockIntegrationService();
  }

  async getById(id: string): Promise<Order> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new NotFoundError('Pedido');
    }

    return order;
  }

  async getByCommand(commandId: string): Promise<Order[]> {
    return this.repository.findByCommand(commandId);
  }

  async getByStatus(status: string): Promise<Order[]> {
    return this.repository.findByStatus(status);
  }

  async createOrder(data: CreateOrderDTO, userId: string): Promise<Order> {
    // Validate command exists and is open
    const command = await this.commandService.getById(data.commandId);

    if (command.status !== 'open') {
      throw new BadRequestError('Comanda já está fechada');
    }

    // Get next order number
    const orderNumber = await this.repository.getNextOrderNumber(data.commandId);

    // Calculate prices and subtotal
    let subtotal = 0;
    const itemsWithPrices = await Promise.all(
      data.items.map(async (item) => {
        let unitPrice = 0;
        let productName = '';
        let productId = null;
        let stockItemId = null;
        
        // Try to find as Product first
        const product = await this.productRepository.findById(item.productId);
        if (product) {
          unitPrice = Number(product.price);
          productName = product.name;
          productId = product.id;
        } else {
          // Try to find as StockItem
          const stockItem = await this.stockItemRepository.findById(item.productId);
          if (stockItem) {
            unitPrice = Number(stockItem.salePrice);
            productName = stockItem.name;
            stockItemId = stockItem.id;
          } else {
            throw new NotFoundError(`Produto ${item.productId}`);
          }
        }

        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        return {
          ...item,
          productId,
          stockItemId,
          productName,
          unitPrice,
          subtotal: itemSubtotal,
        };
      })
    );

    // Create order
    const order = await this.repository.create(
      {
        commandId: data.commandId,
        orderNumber,
        createdBy: userId,
        items: itemsWithPrices,
      },
      subtotal
    );

    // Check stock availability before confirming order
    const fullOrder = await this.getById(order.id);
    const stockCheck = await this.stockIntegrationService.checkStockAvailability(fullOrder);

    if (!stockCheck.success) {
      // Cancel the order if stock is insufficient
      await this.repository.update(order.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: `Estoque insuficiente: ${stockCheck.insufficientItems
          .map((item) => `${item.ingredientName} (disponível: ${item.available}, necessário: ${item.required})`)
          .join(', ')}`,
      });

      const itemNames = stockCheck.insufficientItems.map((i) => i.ingredientName).join(', ');
      throw new BadRequestError(`Estoque insuficiente para: ${itemNames}`);
    }

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return order;
  }

  async updateStatus(
    id: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
    userId: string
  ): Promise<Order> {
    const order = await this.getById(id);

    // Validate order is not cancelled
    if (order.status === 'cancelled') {
      throw new BadRequestError('Pedido cancelado não pode ser alterado');
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new BadRequestError(
        `Transição de status inválida: ${order.status} → ${newStatus}`
      );
    }

    // Deduct stock when moving to preparing
    if (newStatus === 'preparing' && order.status === 'pending') {
      const stockResult = await this.stockIntegrationService.deductStockForOrder(order, userId);

      if (!stockResult.success) {
        const itemNames = stockResult.insufficientItems.map((i) => i.ingredientName).join(', ');
        throw new BadRequestError(`Estoque insuficiente para: ${itemNames}`);
      }
    }

    // Prepare update data
    const updateData: UpdateOrderDTO = {
      status: newStatus,
    };

    // Set timestamp based on status
    if (newStatus === 'preparing') {
      updateData.preparedAt = new Date();
    } else if (newStatus === 'ready') {
      updateData.readyAt = new Date();
    } else if (newStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    // Update order
    const updatedOrder = await this.repository.update(id, updateData);

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return updatedOrder;
  }

  async cancelOrder(id: string, reason: string, userId: string): Promise<Order> {
    const order = await this.getById(id);

    // Validate reason length
    if (!reason || reason.trim().length < 15) {
      throw new BadRequestError('Motivo do cancelamento deve ter no mínimo 15 caracteres');
    }

    // Cannot cancel delivered orders
    if (order.status === 'delivered') {
      throw new BadRequestError('Pedido já entregue não pode ser cancelado');
    }

    // Cannot cancel already cancelled orders
    if (order.status === 'cancelled') {
      throw new BadRequestError('Pedido já está cancelado');
    }

    // Update order
    const cancelledOrder = await this.repository.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason.trim(),
    });

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    return cancelledOrder;
  }

  async modifyOrder(
    id: string,
    modifications: {
      addItems?: CreateOrderItemDTO[];
      removeItemIds?: string[];
    },
    userId: string
  ): Promise<Order> {
    const order = await this.getById(id);

    // Can only modify pending orders
    if (order.status !== 'pending') {
      throw new BadRequestError('Pedido em preparo não pode ser modificado');
    }

    const modificationsLog: string[] = [];

    // Add new items
    if (modifications.addItems && modifications.addItems.length > 0) {
      const itemsWithPrices = await Promise.all(
        modifications.addItems.map(async (item) => {
          let unitPrice = 0;
          let productName = '';
          let productId = null;
          let stockItemId = null;

          // Try to find as Product first
          const product = await this.productRepository.findById(item.productId);
          if (product) {
            unitPrice = Number(product.price);
            productName = product.name;
            productId = product.id;
          } else {
            // Try to find as StockItem
            const stockItem = await this.stockItemRepository.findById(item.productId);
            if (stockItem) {
              unitPrice = Number(stockItem.salePrice);
              productName = stockItem.name;
              stockItemId = stockItem.id;
            } else {
              throw new NotFoundError(`Produto ${item.productId}`);
            }
          }

          const itemSubtotal = unitPrice * item.quantity;

          return {
            ...item,
            productId,
            stockItemId,
            productName,
            unitPrice,
            subtotal: itemSubtotal,
          };
        })
      );

      await this.repository.addItems(id, itemsWithPrices);
      modificationsLog.push(
        `Adicionados ${itemsWithPrices.length} item(ns)`
      );

      // Log modification
      await this.repository.createModification({
        orderId: id,
        userId,
        action: 'add_item',
        description: `Adicionados ${itemsWithPrices.length} item(ns) ao pedido`,
      });
    }

    // Remove items
    if (modifications.removeItemIds && modifications.removeItemIds.length > 0) {
      await this.repository.removeItems(modifications.removeItemIds);
      modificationsLog.push(
        `Removidos ${modifications.removeItemIds.length} item(ns)`
      );

      // Log modification
      await this.repository.createModification({
        orderId: id,
        userId,
        action: 'remove_item',
        description: `Removidos ${modifications.removeItemIds.length} item(ns) do pedido`,
      });
    }

    // Recalculate subtotal
    const newSubtotal = await this.repository.calculateOrderSubtotal(id);
    await this.repository.update(id, { subtotal: newSubtotal } as any);

    // Invalidate cache
    await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

    // Return updated order
    return this.getById(id);
  }
}
