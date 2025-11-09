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
   * Usa raw SQL para contornar foreign key constraint temporariamente
   */
  async create(data: CreateCounterOrderData): Promise<CounterOrder> {
    const { v4: uuidv4 } = await import('uuid');
    const orderId = uuidv4();
    
    // Usar transação para garantir atomicidade
    return prisma.$transaction(async (tx) => {
      // Criar o pedido principal
      const order = await tx.counterOrder.create({
        data: {
          id: orderId,
          customerName: data.customerName,
          notes: data.notes,
          totalAmount: data.totalAmount,
          establishmentId: data.establishmentId,
          createdById: data.createdById,
        },
      });

      // Inserir itens usando raw SQL para evitar foreign key constraint
      for (const item of data.items) {
        const itemId = uuidv4();
        await tx.$executeRaw`
          INSERT INTO "counter_order_items" (
            "id",
            "counterOrderId",
            "productId",
            "quantity",
            "unitPrice",
            "totalPrice",
            "notes"
          ) VALUES (
            ${itemId},
            ${orderId},
            ${item.productId},
            ${item.quantity},
            ${item.unitPrice},
            ${item.totalPrice},
            ${item.notes || null}
          )
        `;
      }

      // Buscar o pedido completo com os itens
      // Não incluir o join com product para evitar erro de foreign key
      const completeOrder = await tx.counterOrder.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!completeOrder) {
        throw new Error('Erro ao criar pedido');
      }

      // Buscar informações dos produtos manualmente
      const itemsWithProducts = await Promise.all(
        completeOrder.items.map(async (item) => {
          // Tentar buscar como produto manufaturado
          let product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, price: true, isActive: true },
          });

          // Se não encontrar, buscar como stock item
          if (!product) {
            const stockItem = await tx.stockItem.findUnique({
              where: { id: item.productId },
              select: { id: true, name: true, salePrice: true, isActive: true },
            });
            
            if (stockItem) {
              product = {
                id: stockItem.id,
                name: stockItem.name,
                price: stockItem.salePrice,
                isActive: stockItem.isActive,
              };
            }
          }

          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Produto não encontrado',
              price: item.unitPrice,
              isActive: false,
            },
          };
        })
      );

      return {
        ...completeOrder,
        items: itemsWithProducts,
      } as any;
    });
  }

  /**
   * Buscar pedido por ID
   */
  async findById(
    id: string,
    establishmentId: string
  ): Promise<CounterOrder | null> {
    const order = await prisma.counterOrder.findFirst({
      where: {
        id,
        establishmentId,
      },
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) return null;

    // Buscar informações dos produtos manualmente
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        let product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true },
        });

        if (!product) {
          const stockItem = await prisma.stockItem.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, salePrice: true },
          });
          
          if (stockItem) {
            product = {
              id: stockItem.id,
              name: stockItem.name,
              price: stockItem.salePrice,
            };
          }
        }

        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Produto não encontrado',
            price: item.unitPrice,
          },
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
  }

  /**
   * Buscar pedido por número
   */
  async findByOrderNumber(
    orderNumber: number,
    establishmentId: string
  ): Promise<CounterOrder | null> {
    const order = await prisma.counterOrder.findFirst({
      where: {
        orderNumber,
        establishmentId,
      },
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) return null;

    // Buscar informações dos produtos manualmente
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        let product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true },
        });

        if (!product) {
          const stockItem = await prisma.stockItem.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, salePrice: true },
          });
          
          if (stockItem) {
            product = {
              id: stockItem.id,
              name: stockItem.name,
              price: stockItem.salePrice,
            };
          }
        }

        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Produto não encontrado',
            price: item.unitPrice,
          },
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
  }

  /**
   * Buscar pedidos pendentes de pagamento
   */
  async findPendingPayment(establishmentId: string): Promise<CounterOrder[]> {
    const orders = await prisma.counterOrder.findMany({
      where: {
        establishmentId,
        status: CounterOrderStatus.AGUARDANDO_PAGAMENTO,
      },
      include: {
        items: true,
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

    // Buscar produtos para cada pedido
    return Promise.all(
      orders.map(async (order) => {
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item) => {
            let product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { id: true, name: true, price: true },
            });

            if (!product) {
              const stockItem = await prisma.stockItem.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, salePrice: true },
              });
              
              if (stockItem) {
                product = {
                  id: stockItem.id,
                  name: stockItem.name,
                  price: stockItem.salePrice,
                };
              }
            }

            return {
              ...item,
              product: product || {
                id: item.productId,
                name: 'Produto não encontrado',
                price: item.unitPrice,
              },
            };
          })
        );

        return {
          ...order,
          items: itemsWithProducts,
        } as any;
      })
    );
  }

  /**
   * Buscar pedidos por status
   */
  async findByStatus(
    status: CounterOrderStatus,
    establishmentId: string
  ): Promise<CounterOrder[]> {
    const orders = await prisma.counterOrder.findMany({
      where: {
        establishmentId,
        status,
      },
      include: {
        items: true,
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

    // Buscar produtos para cada pedido
    return Promise.all(
      orders.map(async (order) => {
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item) => {
            let product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { id: true, name: true, price: true },
            });

            if (!product) {
              const stockItem = await prisma.stockItem.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, salePrice: true },
              });
              
              if (stockItem) {
                product = {
                  id: stockItem.id,
                  name: stockItem.name,
                  price: stockItem.salePrice,
                };
              }
            }

            return {
              ...item,
              product: product || {
                id: item.productId,
                name: 'Produto não encontrado',
                price: item.unitPrice,
              },
            };
          })
        );

        return {
          ...order,
          items: itemsWithProducts,
        } as any;
      })
    );
  }

  /**
   * Buscar pedidos ativos (para Kanban)
   * Inclui: PENDENTE, PREPARANDO, PRONTO
   */
  async findActiveOrders(establishmentId: string): Promise<CounterOrder[]> {
    const orders = await prisma.counterOrder.findMany({
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
        items: true,
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

    // Buscar produtos para cada pedido
    return Promise.all(
      orders.map(async (order) => {
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item) => {
            let product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { id: true, name: true, price: true },
            });

            if (!product) {
              const stockItem = await prisma.stockItem.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, salePrice: true },
              });
              
              if (stockItem) {
                product = {
                  id: stockItem.id,
                  name: stockItem.name,
                  price: stockItem.salePrice,
                };
              }
            }

            return {
              ...item,
              product: product || {
                id: item.productId,
                name: 'Produto não encontrado',
                price: item.unitPrice,
              },
            };
          })
        );

        return {
          ...order,
          items: itemsWithProducts,
        } as any;
      })
    );
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

    const order = await prisma.counterOrder.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Buscar produtos manualmente
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        let product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true },
        });

        if (!product) {
          const stockItem = await prisma.stockItem.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, salePrice: true },
          });
          
          if (stockItem) {
            product = {
              id: stockItem.id,
              name: stockItem.name,
              price: stockItem.salePrice,
            };
          }
        }

        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Produto não encontrado',
            price: item.unitPrice,
          },
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
  }

  /**
   * Marcar pedido como pago
   */
  async markAsPaid(id: string, paidAt: Date): Promise<CounterOrder> {
    const order = await prisma.counterOrder.update({
      where: { id },
      data: {
        status: CounterOrderStatus.PENDENTE,
        paidAt,
      },
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Buscar produtos manualmente
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        let product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true },
        });

        if (!product) {
          const stockItem = await prisma.stockItem.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, salePrice: true },
          });
          
          if (stockItem) {
            product = {
              id: stockItem.id,
              name: stockItem.name,
              price: stockItem.salePrice,
            };
          }
        }

        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Produto não encontrado',
            price: item.unitPrice,
          },
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
  }

  /**
   * Cancelar pedido com motivo
   */
  async cancel(id: string, reason: string): Promise<CounterOrder> {
    const order = await prisma.counterOrder.update({
      where: { id },
      data: {
        status: CounterOrderStatus.CANCELADO,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: {
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Buscar produtos manualmente
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        let product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true },
        });

        if (!product) {
          const stockItem = await prisma.stockItem.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, salePrice: true },
          });
          
          if (stockItem) {
            product = {
              id: stockItem.id,
              name: stockItem.name,
              price: stockItem.salePrice,
            };
          }
        }

        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Produto não encontrado',
            price: item.unitPrice,
          },
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
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
