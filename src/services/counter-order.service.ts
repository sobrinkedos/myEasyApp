/**
 * Counter Order Service
 * Serviço de lógica de negócio para Pedidos Balcão
 */

import { CounterOrderRepository } from '@/repositories/counter-order.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { StockItemRepository } from '@/repositories/stock-item.repository';
import { PaymentQueueService } from '@/services/payment-queue.service';
import { KanbanIntegrationService } from '@/services/kanban-integration.service';
import { CounterOrderNotificationService } from '@/services/counter-order-notification.service';
import {
  CounterOrderStatus,
  CounterOrderResponse,
  CounterOrderItemResponse,
  CreateCounterOrderDTO,
  CounterOrderMetrics,
  isValidStatusTransition,
} from '@/models/counter-order.model';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { CounterOrder } from '@prisma/client';
import prisma from '@/config/database';

// Erros específicos do domínio
export class OrderNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Pedido não encontrado: ${identifier}`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} -> ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class ProductUnavailableError extends Error {
  constructor(productName: string) {
    super(`Produto indisponível: ${productName}`);
    this.name = 'ProductUnavailableError';
  }
}

export class CannotCancelPaidOrderError extends Error {
  constructor(orderId: string) {
    super(`Não é possível cancelar pedido pago: ${orderId}`);
    this.name = 'CannotCancelPaidOrderError';
  }
}

export interface ICounterOrderService {
  createOrder(
    dto: CreateCounterOrderDTO,
    userId: string,
    establishmentId: string
  ): Promise<CounterOrderResponse>;
  getOrderById(id: string, establishmentId: string): Promise<CounterOrderResponse>;
  getOrderByNumber(
    orderNumber: number,
    establishmentId: string
  ): Promise<CounterOrderResponse>;
  updateOrderStatus(
    id: string,
    status: CounterOrderStatus,
    establishmentId: string
  ): Promise<CounterOrderResponse>;
  confirmPayment(
    id: string,
    establishmentId: string,
    paymentMethod?: string,
    amount?: number,
    userId?: string
  ): Promise<CounterOrderResponse>;
  cancelOrder(id: string, reason: string, establishmentId: string): Promise<void>;
  getPendingPaymentOrders(establishmentId: string): Promise<CounterOrderResponse[]>;
  getActiveOrders(establishmentId: string): Promise<CounterOrderResponse[]>;
  getReadyOrders(establishmentId: string): Promise<CounterOrderResponse[]>;
  getMetrics(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CounterOrderMetrics>;
}

export class CounterOrderService implements ICounterOrderService {
  private repository: CounterOrderRepository;
  private productRepository: ProductRepository;
  private stockItemRepository: StockItemRepository;
  private paymentQueueService: PaymentQueueService;
  private kanbanService: KanbanIntegrationService;
  private notificationService: CounterOrderNotificationService;

  constructor() {
    this.repository = new CounterOrderRepository();
    this.productRepository = new ProductRepository();
    this.stockItemRepository = new StockItemRepository();
    this.paymentQueueService = new PaymentQueueService();
    this.kanbanService = new KanbanIntegrationService();
    this.notificationService = new CounterOrderNotificationService();
  }

  /**
   * Criar novo pedido balcão
   * Valida produtos, calcula valores e cria pedido com status AGUARDANDO_PAGAMENTO
   */
  async createOrder(
    dto: CreateCounterOrderDTO,
    userId: string,
    establishmentId: string
  ): Promise<CounterOrderResponse> {
    try {
      // Validar que há pelo menos 1 item
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestError('Pedido deve ter pelo menos 1 item');
      }

      console.log('CounterOrderService - Criando pedido:', {
        userId,
        establishmentId,
        itemsCount: dto.items.length,
      });

      // Validar e calcular preços dos itens
      let totalAmount = 0;
      const itemsWithPrices = await Promise.all(
        dto.items.map(async (item) => {
          // Buscar produto manufaturado primeiro
          let product = await this.productRepository.findById(item.productId);
          let productName = '';
          let unitPrice = 0;
          let isActive = false;

          if (product) {
            // Produto manufaturado encontrado
            productName = product.name;
            unitPrice = Number(product.price);
            isActive = product.isActive;
          } else {
            // Tentar buscar como stock item (produto de revenda)
            const stockItem = await this.stockItemRepository.findById(item.productId);
            
            if (!stockItem) {
              throw new NotFoundError(`Produto ${item.productId}`);
            }

            productName = stockItem.name;
            unitPrice = Number(stockItem.salePrice);
            isActive = stockItem.isActive;
          }

          // Validar se produto está ativo
          if (!isActive) {
            throw new ProductUnavailableError(productName);
          }

          // Validar preço
          if (unitPrice <= 0) {
            throw new BadRequestError(`Produto ${productName} não tem preço de venda configurado`);
          }

          // Calcular preços
          const totalPrice = unitPrice * item.quantity;
          totalAmount += totalPrice;

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            notes: item.notes,
          };
        })
      );

      // Validar que o valor total não é zero
      if (totalAmount <= 0) {
        throw new BadRequestError('Valor total do pedido deve ser maior que zero');
      }

      console.log('CounterOrderService - Criando no banco:', {
        totalAmount,
        itemsCount: itemsWithPrices.length,
      });

      // Criar pedido no banco
      const order = await this.repository.create({
        customerName: dto.customerName,
        notes: dto.notes,
        totalAmount,
        items: itemsWithPrices,
        establishmentId,
        createdById: userId,
      });

      console.log('CounterOrderService - Pedido criado:', order.id);

      // Enviar para fila de pagamento
      await this.paymentQueueService.addToPaymentQueue(order);

      // Notificar criação
      await this.notificationService.notifyOrderCreated(order);

      return this.mapToResponse(order);
    } catch (error: any) {
      console.error('CounterOrderService - Erro ao criar pedido:', error);
      
      // Se for erro do Prisma (tabela não existe)
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        throw new BadRequestError(
          'Tabela counter_orders não existe. Execute a migration primeiro.'
        );
      }
      
      throw error;
    }
  }

  /**
   * Buscar pedido por ID
   */
  async getOrderById(
    id: string,
    establishmentId: string
  ): Promise<CounterOrderResponse> {
    const order = await this.repository.findById(id, establishmentId);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    return this.mapToResponse(order);
  }

  /**
   * Buscar pedido por número
   */
  async getOrderByNumber(
    orderNumber: number,
    establishmentId: string
  ): Promise<CounterOrderResponse> {
    const order = await this.repository.findByOrderNumber(
      orderNumber,
      establishmentId
    );

    if (!order) {
      throw new OrderNotFoundError(`#${orderNumber}`);
    }

    return this.mapToResponse(order);
  }

  /**
   * Atualizar status do pedido
   * Valida transições de status permitidas
   */
  async updateOrderStatus(
    id: string,
    status: CounterOrderStatus,
    establishmentId: string
  ): Promise<CounterOrderResponse> {
    const order = await this.repository.findById(id, establishmentId);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    // Validar transição de status
    if (!isValidStatusTransition(order.status, status)) {
      throw new InvalidStatusTransitionError(order.status, status);
    }

    const updatedOrder = await this.repository.updateStatus(id, status);

    // Atualizar Kanban
    await this.kanbanService.updateKanbanStatus(id, status);

    // Remover do Kanban se entregue ou cancelado
    if (
      status === CounterOrderStatus.ENTREGUE ||
      status === CounterOrderStatus.CANCELADO
    ) {
      await this.kanbanService.removeFromKanban(id);
    }

    // Notificar mudança de status
    await this.notificationService.notifyStatusChange(updatedOrder, status);

    // Notificar se pedido ficou pronto
    if (status === CounterOrderStatus.PRONTO) {
      await this.notificationService.notifyOrderReady(updatedOrder);
    }

    return this.mapToResponse(updatedOrder);
  }

  /**
   * Confirmar pagamento do pedido
   * Altera status para PENDENTE, adiciona ao Kanban e registra no caixa
   */
  async confirmPayment(
    id: string,
    establishmentId: string,
    paymentMethod?: string,
    amount?: number,
    userId?: string
  ): Promise<CounterOrderResponse> {
    const order = await this.repository.findById(id, establishmentId);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    // Validar que está aguardando pagamento
    if (order.status !== CounterOrderStatus.AGUARDANDO_PAGAMENTO) {
      throw new BadRequestError(
        'Apenas pedidos aguardando pagamento podem ser confirmados'
      );
    }

    const updatedOrder = await this.repository.markAsPaid(id, new Date());

    // Registrar transação no caixa se paymentMethod e userId foram fornecidos
    console.log('Counter Order - Tentando registrar no caixa:', {
      paymentMethod,
      userId,
      amount,
      orderTotal: updatedOrder.totalAmount,
    });

    if (paymentMethod && userId) {
      try {
        // Buscar sessão de caixa ativa do usuário
        const activeSession = await prisma.cashSession.findFirst({
          where: {
            operatorId: userId,
            status: 'OPEN',
          },
          orderBy: {
            openedAt: 'desc',
          },
        });

        console.log('Counter Order - Sessão de caixa encontrada:', activeSession?.id);

        if (activeSession) {
          // Registrar transação
          const transaction = await prisma.cashTransaction.create({
            data: {
              type: 'SALE',
              amount: amount || Number(updatedOrder.totalAmount),
              paymentMethod,
              description: `Pedido Balcão #${updatedOrder.orderNumber}${updatedOrder.customerName ? ` - ${updatedOrder.customerName}` : ''}`,
              cashSessionId: activeSession.id,
              userId,
            },
          });

          console.log('Counter Order - Transação criada:', transaction.id);
          console.log('Counter Order - Pagamento registrado no caixa com sucesso');
        } else {
          console.log('Counter Order - Nenhuma sessão de caixa aberta encontrada para o usuário');
        }
      } catch (error) {
        console.error('Erro ao registrar transação no caixa:', error);
        // Não lançar erro para não bloquear o pagamento
      }
    } else {
      console.log('Counter Order - Não registrando no caixa (faltam dados):', {
        hasPaymentMethod: !!paymentMethod,
        hasUserId: !!userId,
      });
    }

    // Adicionar ao Kanban
    await this.kanbanService.addToKanban(updatedOrder);

    // Notificar confirmação de pagamento
    await this.notificationService.notifyStatusChange(
      updatedOrder,
      CounterOrderStatus.PENDENTE
    );

    return this.mapToResponse(updatedOrder);
  }

  /**
   * Cancelar pedido
   * Apenas permite cancelamento se não foi pago
   */
  async cancelOrder(
    id: string,
    reason: string,
    establishmentId: string
  ): Promise<void> {
    const order = await this.repository.findById(id, establishmentId);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    // Validar que não foi pago
    if (order.status !== CounterOrderStatus.AGUARDANDO_PAGAMENTO) {
      throw new CannotCancelPaidOrderError(id);
    }

    const cancelledOrder = await this.repository.cancel(id, reason);

    // Remover da fila de pagamento
    await this.paymentQueueService.removeFromPaymentQueue(id);

    // Notificar cancelamento
    await this.notificationService.notifyOrderCancelled(cancelledOrder, reason);
  }

  /**
   * Listar pedidos pendentes de pagamento
   */
  async getPendingPaymentOrders(
    establishmentId: string
  ): Promise<CounterOrderResponse[]> {
    const orders = await this.repository.findPendingPayment(establishmentId);
    return orders.map((order) => this.mapToResponse(order));
  }

  /**
   * Listar pedidos ativos (para Kanban)
   */
  async getActiveOrders(establishmentId: string): Promise<CounterOrderResponse[]> {
    const orders = await this.repository.findActiveOrders(establishmentId);
    return orders.map((order) => this.mapToResponse(order));
  }

  /**
   * Listar pedidos prontos
   */
  async getReadyOrders(establishmentId: string): Promise<CounterOrderResponse[]> {
    const orders = await this.repository.findByStatus(
      CounterOrderStatus.PRONTO,
      establishmentId
    );
    return orders.map((order) => this.mapToResponse(order));
  }

  /**
   * Obter métricas de pedidos balcão
   */
  async getMetrics(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CounterOrderMetrics> {
    return this.repository.getMetrics(establishmentId, startDate, endDate);
  }

  /**
   * Mapear entidade do banco para DTO de resposta
   */
  private mapToResponse(order: any): CounterOrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      notes: order.notes,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes,
      })),
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      readyAt: order.readyAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      createdBy: {
        id: order.createdBy.id,
        name: order.createdBy.name,
      },
    };
  }
}
