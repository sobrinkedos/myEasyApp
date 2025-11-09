/**
 * Kanban Integration Service
 * Serviço para integração de pedidos balcão com o Kanban
 */

import { CounterOrder, CounterOrderStatus } from '@prisma/client';
import logger from '@/utils/logger';

export interface IKanbanIntegrationService {
  addToKanban(order: CounterOrder): Promise<void>;
  updateKanbanStatus(orderId: string, status: CounterOrderStatus): Promise<void>;
  removeFromKanban(orderId: string): Promise<void>;
}

export class KanbanIntegrationService implements IKanbanIntegrationService {
  /**
   * Adicionar pedido ao Kanban após pagamento confirmado
   * Emite evento WebSocket para atualização em tempo real
   */
  async addToKanban(order: CounterOrder): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${order.establishmentId}`).emit('kanban:pedido:adicionado', {
      //   orderId: order.id,
      //   orderNumber: order.orderNumber,
      //   status: order.status,
      //   isPedidoBalcao: true,
      //   customerName: order.customerName,
      //   totalAmount: order.totalAmount,
      //   createdAt: order.createdAt,
      // });

      logger.info('Pedido adicionado ao Kanban', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        establishmentId: order.establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao adicionar pedido ao Kanban', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Não lançar erro para não bloquear o fluxo principal
    }
  }

  /**
   * Atualizar status do pedido no Kanban
   * Emite evento WebSocket para mover card entre colunas
   */
  async updateKanbanStatus(
    orderId: string,
    status: CounterOrderStatus
  ): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${establishmentId}`).emit('kanban:pedido:atualizado', {
      //   orderId,
      //   status,
      //   isPedidoBalcao: true,
      //   timestamp: new Date(),
      // });

      logger.info('Status do pedido atualizado no Kanban', {
        orderId,
        status,
      });
    } catch (error) {
      logger.error('Erro ao atualizar status no Kanban', {
        orderId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Não lançar erro para não bloquear o fluxo principal
    }
  }

  /**
   * Remover pedido do Kanban
   * Usado quando pedido é entregue ou cancelado
   */
  async removeFromKanban(orderId: string): Promise<void> {
    try {
      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${establishmentId}`).emit('kanban:pedido:removido', {
      //   orderId,
      //   isPedidoBalcao: true,
      //   timestamp: new Date(),
      // });

      logger.info('Pedido removido do Kanban', {
        orderId,
      });
    } catch (error) {
      logger.error('Erro ao remover pedido do Kanban', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Não lançar erro para não bloquear o fluxo principal
    }
  }

  /**
   * Notificar mudança de coluna no Kanban
   * Helper para transições de status específicas
   */
  async notifyColumnChange(
    orderId: string,
    fromStatus: CounterOrderStatus,
    toStatus: CounterOrderStatus,
    establishmentId: string
  ): Promise<void> {
    try {
      const columnMap: Record<CounterOrderStatus, string> = {
        [CounterOrderStatus.AGUARDANDO_PAGAMENTO]: 'payment',
        [CounterOrderStatus.PENDENTE]: 'pending',
        [CounterOrderStatus.PREPARANDO]: 'preparing',
        [CounterOrderStatus.PRONTO]: 'ready',
        [CounterOrderStatus.ENTREGUE]: 'delivered',
        [CounterOrderStatus.CANCELADO]: 'cancelled',
      };

      // TODO: Implementar WebSocket quando disponível
      // io.to(`establishment:${establishmentId}`).emit('kanban:coluna:mudanca', {
      //   orderId,
      //   fromColumn: columnMap[fromStatus],
      //   toColumn: columnMap[toStatus],
      //   isPedidoBalcao: true,
      //   timestamp: new Date(),
      // });

      logger.info('Mudança de coluna notificada', {
        orderId,
        fromStatus,
        toStatus,
        establishmentId,
      });
    } catch (error) {
      logger.error('Erro ao notificar mudança de coluna', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
