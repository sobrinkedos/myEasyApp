import prisma from '@/config/database';
import { Order, OrderItem } from '@prisma/client';

export interface CreateOrderDTO {
  commandId: string;
  orderNumber: number;
  createdBy: string;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
  observations?: string;
  itemType?: 'product' | 'stock_item';
  productName?: string;
  stockItemId?: string | null;
  unitPrice?: number;
  subtotal?: number;
}

export interface UpdateOrderDTO {
  status?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  preparedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        command: {
          include: {
            table: true,
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCommand(commandId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { commandId },
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
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByStatus(status: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { status },
      include: {
        command: {
          include: {
            table: true,
          },
        },
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
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getNextOrderNumber(commandId: string): Promise<number> {
    const lastOrder = await prisma.order.findFirst({
      where: { commandId },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    return lastOrder ? lastOrder.orderNumber + 1 : 1;
  }

  async create(data: CreateOrderDTO, subtotal: number): Promise<Order> {
    return prisma.order.create({
      data: {
        commandId: data.commandId,
        orderNumber: data.orderNumber,
        createdBy: data.createdBy,
        subtotal,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            stockItemId: item.stockItemId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            observations: item.observations,
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
              },
            },
            stockItem: {
              select: {
                id: true,
                name: true,
                salePrice: true,
              },
            },
          },
        },
        command: {
          include: {
            table: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateOrderDTO): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
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
        command: {
          include: {
            table: true,
          },
        },
      },
    });
  }

  async addItems(orderId: string, items: any[]): Promise<void> {
    await prisma.orderItem.createMany({
      data: items.map((item) => ({
        orderId,
        productId: item.productId,
        stockItemId: item.stockItemId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        observations: item.observations,
      })),
    });
  }

  async removeItems(itemIds: string[]): Promise<void> {
    await prisma.orderItem.deleteMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });
  }

  async createModification(data: {
    orderId: string;
    userId: string;
    action: string;
    description: string;
  }): Promise<void> {
    await prisma.orderModification.create({
      data,
    });
  }

  async calculateOrderSubtotal(orderId: string): Promise<number> {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    return items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  }
}
