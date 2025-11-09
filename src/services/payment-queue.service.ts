/**
 * Payment Queue Service
 * Serviço para gerenciar fila de pagamentos de pedidos balcão
 */

import redis from '@/config/redis';
import { CounterOrder } from '@prisma/client';
import logger from '@/utils/logger';

export interface IPaymentQueueService {
  addToPaymentQueue(order: CounterOrder): Promise<void>;
  removeFromPaymentQueue(orderId: string): Promise<void>;
  getPaymentQueue(establishmentId: string): Promise<string[]>;
  onPaymentConfirmed(orderId: string, paymentId: string): Promise<void>;
}

export class PaymentQueueService implements IPaymentQueueService {
  private readonly QUEUE_PREFIX = 'pagamento:fila';
  private readonly TTL_HOURS = 24;

  /**
   * Gerar chave da fila para um estabelecimento
   */
  private getQueueKey(establishmentId: string): string {
    return `${this.QUEUE_PREFIX}:${establishmentId}`;
  }

  /**
   * Adicionar pedido à fila de pagamento
   * Usa Redis Sorted Set com timestamp como score
   */
  async addToPaymentQueue(order: CounterOrder): Promise<void> {
    try {
      const queueKey = this.getQueueKey(order.establishmentId);
      const score = order.createdAt.getTime();

      // Adicionar à fila ordenada por timestamp
      await redis.zadd(queueKey, score, order.id);

      // Definir TTL de 24 horas
      await redis.expire(queueKey, this.TTL_HOURS * 3600);

      logger.info('Pedido adicionado à fila de pagamento', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        establishmentId: order.establishmentId,
        totalAmount: order.totalAmount,
      });
    } catch (error) {
      logger.error('Erro ao adicionar pedido à fila de pagamento', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Remover pedido da fila de pagamento
   * Usado quando pedido é cancelado
   */
  async removeFromPaymentQueue(orderId: string): Promise<void> {
    try {
      // Buscar em todas as filas (pode ser otimizado se soubermos o establishmentId)
      const keys = await redis.keys(`${this.QUEUE_PREFIX}:*`);

      for (const key of keys) {
        const removed = await redis.zrem(key, orderId);
        if (removed > 0) {
          logger.info('Pedido removido da fila de pagamento', {
            orderId,
            queueKey: key,
          });
          break;
        }
      }
    } catch (error) {
      logger.error('Erro ao remover pedido da fila de pagamento', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Obter lista de pedidos na fila de pagamento
   * Retorna IDs ordenados por timestamp (mais antigos primeiro)
   */
  async getPaymentQueue(establishmentId: string): Promise<string[]> {
    try {
      const queueKey = this.getQueueKey(establishmentId);

      // Buscar todos os pedidos ordenados por score (timestamp)
      const orderIds = await redis.zrange(queueKey, 0, -1);

      return orderIds;
    } catch (error) {
      logger.error('Erro ao buscar fila de pagamento', {
        establishmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Callback quando pagamento é confirmado
   * Remove da fila e dispara eventos necessários
   */
  async onPaymentConfirmed(orderId: string, paymentId: string): Promise<void> {
    try {
      // Remover da fila
      await this.removeFromPaymentQueue(orderId);

      logger.info('Pagamento confirmado', {
        orderId,
        paymentId,
      });

      // TODO: Disparar evento para atualizar status do pedido
      // Isso será feito pelo controller que recebe a confirmação
    } catch (error) {
      logger.error('Erro ao processar confirmação de pagamento', {
        orderId,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Limpar pedidos expirados da fila (mais de 24h)
   * Pode ser executado por um cron job
   */
  async cleanExpiredOrders(): Promise<void> {
    try {
      const keys = await redis.keys(`${this.QUEUE_PREFIX}:*`);
      const now = Date.now();
      const expirationTime = now - this.TTL_HOURS * 3600 * 1000;

      for (const key of keys) {
        // Remover pedidos com score (timestamp) menor que expirationTime
        const removed = await redis.zremrangebyscore(key, 0, expirationTime);

        if (removed > 0) {
          logger.info('Pedidos expirados removidos da fila', {
            queueKey: key,
            count: removed,
          });
        }
      }
    } catch (error) {
      logger.error('Erro ao limpar pedidos expirados', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Obter estatísticas da fila
   */
  async getQueueStats(establishmentId: string): Promise<{
    total: number;
    oldest?: Date;
    newest?: Date;
  }> {
    try {
      const queueKey = this.getQueueKey(establishmentId);

      // Total de pedidos
      const total = await redis.zcard(queueKey);

      if (total === 0) {
        return { total: 0 };
      }

      // Pedido mais antigo (menor score)
      const oldest = await redis.zrange(queueKey, 0, 0, 'WITHSCORES');
      const oldestTimestamp = oldest.length > 1 ? parseInt(oldest[1]) : null;

      // Pedido mais recente (maior score)
      const newest = await redis.zrange(queueKey, -1, -1, 'WITHSCORES');
      const newestTimestamp = newest.length > 1 ? parseInt(newest[1]) : null;

      return {
        total,
        oldest: oldestTimestamp ? new Date(oldestTimestamp) : undefined,
        newest: newestTimestamp ? new Date(newestTimestamp) : undefined,
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas da fila', {
        establishmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { total: 0 };
    }
  }
}
