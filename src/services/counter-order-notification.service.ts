/**
 * Counter Order Notification Service
 * Serviço para notificações de pedidos balcão
 */

import { CounterOrder, CounterOrderStatus } from '@prisma/client';
import logger from '@/utils/logger';

export interface ICounterOrderNotificationService {
  notifyStatusChange(order: CounterOrder, newStatus: CounterOrderStatus): Promise<void>;
  notifyOrderReady(order: CounterOrder): Promise<void>;
  notifyOrderDelayed(order: CounterOrder, delayMinutes: number): Promise<void>;
}

export class CounterOrderNotificationService
  implements ICounterOrderNotificationService
{
  /**
   * Notificar mudança de status do pedido
   * Emite evento WebSocket para interface web
   */
  async notifyStatusChange(
    order: CounterOrder,
    newStatus: CounterOrderStatus
  ): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('counter-order:status-changed', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   oldStatus: order.status,
      //   newStatus,
      //   customerName: order.customerName,
      //   timestamp: new Date(),
      // });

      logger.info('Notificação de mudança de status enviada', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        oldStatus: order.status,
        newStatus,
        establishmentId: order.establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao notificar mudança de status', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Não lançar erro para não bloquear o fluxo principal
    }
  }

  /**
   * Notificar que pedido está pronto
   * Envia notificação visual e sonora para atendentes
   */
  async notifyOrderReady(order: CounterOrder): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('counter-order:ready', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   customerName: order.customerName,
      //   totalAmount: order.totalAmount,
      //   readyAt: order.readyAt,
      //   playSound: true, // Tocar som de notificação
      // });

      logger.info('Notificação de pedido pronto enviada', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        establishmentId: order.establishmentId,
      });

      // TODO: Integração futura com display de chamada
      // await this.displayService.showOrderNumber(order.orderNumber);

      // TODO: Integração futura com sistema de som
      // await this.soundService.announceOrder(order.orderNumber);
    } catch (error) {
      logger.error('Erro ao notificar pedido pronto', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Notificar pedido atrasado (mais de 5 minutos pronto)
   * Destaca pedido com cor de alerta
   */
  async notifyOrderDelayed(
    order: CounterOrder,
    delayMinutes: number
  ): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('counter-order:delayed', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   customerName: order.customerName,
      //   delayMinutes,
      //   readyAt: order.readyAt,
      //   priority: 'high',
      // });

      logger.warn('Pedido atrasado detectado', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        delayMinutes,
        readyAt: order.readyAt,
        establishmentId: order.establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao notificar pedido atrasado', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Notificar criação de novo pedido
   */
  async notifyOrderCreated(order: CounterOrder): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('counter-order:created', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   customerName: order.customerName,
      //   totalAmount: order.totalAmount,
      //   status: order.status,
      //   createdAt: order.createdAt,
      // });

      logger.info('Notificação de novo pedido enviada', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        establishmentId: order.establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao notificar criação de pedido', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Notificar cancelamento de pedido
   */
  async notifyOrderCancelled(order: CounterOrder, reason: string): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('counter-order:cancelled', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   customerName: order.customerName,
      //   reason,
      //   cancelledAt: order.cancelledAt,
      // });

      logger.info('Notificação de cancelamento enviada', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reason,
        establishmentId: order.establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao notificar cancelamento', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Verificar e notificar pedidos atrasados
   * Pode ser executado por um cron job a cada minuto
   */
  async checkDelayedOrders(establishmentId: string, orders: CounterOrder[]): Promise<void> {
    const now = new Date();
    const delayThresholdMs = 5 * 60 * 1000; // 5 minutos

    for (const order of orders) {
      if (order.status === CounterOrderStatus.PRONTO && order.readyAt) {
        const delayMs = now.getTime() - order.readyAt.getTime();

        if (delayMs > delayThresholdMs) {
          const delayMinutes = Math.floor(delayMs / 1000 / 60);
          await this.notifyOrderDelayed(order, delayMinutes);
        }
      }
    }
  }
}
