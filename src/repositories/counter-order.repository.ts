/**
 * Counter Order Repository
 * Repositório para operações de banco de dados de Pedidos Balcão
 */

import prisma from '@/config/database';
import {
  CounterOrder,
  CounterOrderItem,
  CounterOrderStatus,
  Prisma,
} from '@prisma/client';
import {
  CreateCounterOrderData,
  CreateCounterOrderItemData,
  CounterOrderMetrics,
} from '@/models/counter-order.model';

export interface ICounterOrderRepository {
  create(data: CreateCounterOrderData): Promise<CounterOrder>;
  findById(id: string, establishmentId: string): Promise<CounterOrder | null>;
  findByOrderNumber(
    orderNumber: number,
    establishmentId: string
  ): Promise<CounterOrder | null>;
  findPendingPayment(establishmentId: string): Promise<CounterOrder[]>;
  findByStatus(
    status: CounterOrderStatus,
    establishmentId: string
  ): Promise<CounterOrder[]>;
  findActiveOrders(establishmentId: string): Promise<CounterOrder[]>;
  updateStatus(
    id: string,
    status: CounterOrderStatus,
    timestamp?: Date
  ): Promise<CounterOrder>;
  markAsPaid(id: string, paidAt: Date): Promise<CounterOrder>;
  cancel(id: string, reason: string): Promise<CounterOrder>;
  getMetrics(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CounterOrderMetrics>;
  getAveragePreparationTime(
    establishmentId: string,
    days: number
  ): Promise<number>;
}

export class CounterOrderRepository implements ICounterOrderRepository {
  /**
   * Criar novo pedido balcão com itens em transação
   */
  async create(data: CreateCounterOrderData): Promise<CounterOrder> {
    return prisma.counterOrder.create({
      data: {
        customerName: data.customerName,
        notes: data.notes,
        totalAmount: data.totalAmount,
        establishmentId: data.establishmentId,
        createdById: data.createdById,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                isActive: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Buscar pedido por ID
   */
  async findById(
    id: string,
    establishmentId: string
  ): Promise<CounterOrder | null> {
    return prisma.counterOrder.findFirst({
      where: {
        id,
        establishmentId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Buscar pedido por número
   */
  async findByOrderNumber(
    orderNumber: number,
    establishmentId: string
  ): Promise<CounterOrder | null> {
    return prisma.counterOrder.findFirst({
      where: {
        orderNumber,
        establishmentId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Buscar pedidos pendentes de pagamento
   */
  async findPendingPayment(establishmentId: string): Promise<CounterOrder[]> {
    return prisma.counterOrder.findMany({
      where: {
        establishmentId,
        status: CounterOrderStatus.AGUARDANDO_PAGAMENTO,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Buscar pedidos por status
   */
  async findByStatus(
    status: CounterOrderStatus,
    establishmentId: string
  ): Promise<CounterOrder[]> {
    return prisma.counterOrder.findMany({
      where: {
        establishmentId,
        status,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Buscar pedidos ativos (para Kanban)
   * Inclui: PENDENTE, PREPARANDO, PRONTO
   */
  async findActiveOrders(establishmentId: string): Promise<CounterOrder[]> {
    return prisma.counterOrder.findMany({
      where: {
        establishmentId,
        status: {
          in: [
            CounterOrderStatus.PENDENTE,
            CounterOrderStatus.PREPARANDO,
            CounterOrderStatus.PRONTO,
          ],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Atualizar status do pedido com timestamp automático
   */
  async updateStatus(
    id: string,
    status: CounterOrderStatus,
    timestamp?: Date
  ): Promise<CounterOrder> {
    const updateData: Prisma.CounterOrderUpdateInput = {
      status,
    };

    // Definir timestamp apropriado baseado no status
    const now = timestamp || new Date();
    switch (status) {
      case CounterOrderStatus.PENDENTE:
        updateData.paidAt = now;
        break;
      case CounterOrderStatus.PREPARANDO:
        updateData.startedAt = now;
        break;
      case CounterOrderStatus.PRONTO:
        updateData.readyAt = now;
        break;
      case CounterOrderStatus.ENTREGUE:
        updateData.deliveredAt = now;
        break;
      case CounterOrderStatus.CANCELADO:
        updateData.cancelledAt = now;
        break;
    }

    return prisma.counterOrder.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Marcar pedido como pago
   */
  async markAsPaid(id: string, paidAt: Date): Promise<CounterOrder> {
    return prisma.counterOrder.update({
      where: { id },
      data: {
        status: CounterOrderStatus.PENDENTE,
        paidAt,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Cancelar pedido com motivo
   */
  async cancel(id: string, reason: string): Promise<CounterOrder> {
    return prisma.counterOrder.update({
      where: { id },
      data: {
        status: CounterOrderStatus.CANCELADO,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Obter métricas de pedidos balcão
   */
  async getMetrics(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CounterOrderMetrics> {
    // Total de pedidos e receita
    const orders = await prisma.counterOrder.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: CounterOrderStatus.CANCELADO,
        },
      },
      select: {
        totalAmount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        startedAt: true,
        readyAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Tempo médio de pagamento (criação até pagamento)
    const paidOrders = orders.filter((o) => o.paidAt);
    const averagePaymentTime =
      paidOrders.length > 0
        ? paidOrders.reduce((sum, order) => {
            const diff = order.paidAt!.getTime() - order.createdAt.getTime();
            return sum + diff / 1000 / 60; // em minutos
          }, 0) / paidOrders.length
        : 0;

    // Tempo médio de preparação (pagamento até pronto)
    const readyOrders = orders.filter((o) => o.paidAt && o.readyAt);
    const averagePreparationTime =
      readyOrders.length > 0
        ? readyOrders.reduce((sum, order) => {
            const diff = order.readyAt!.getTime() - order.paidAt!.getTime();
            return sum + diff / 1000 / 60; // em minutos
          }, 0) / readyOrders.length
        : 0;

    // Contagem por status
    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<CounterOrderStatus, number>
    );

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      averagePaymentTime,
      averagePreparationTime,
      ordersByStatus,
    };
  }

  /**
   * Obter tempo médio de preparação dos últimos N dias
   */
  async getAveragePreparationTime(
    establishmentId: string,
    days: number
  ): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.counterOrder.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
        },
        paidAt: {
          not: null,
        },
        readyAt: {
          not: null,
        },
      },
      select: {
        paidAt: true,
        readyAt: true,
      },
    });

    if (orders.length === 0) return 0;

    const totalTime = orders.reduce((sum, order) => {
      const diff = order.readyAt!.getTime() - order.paidAt!.getTime();
      return sum + diff / 1000 / 60; // em minutos
    }, 0);

    return totalTime / orders.length;
  }
}
