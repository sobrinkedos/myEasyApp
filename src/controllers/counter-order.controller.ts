/**
 * Counter Order Controller
 * Controller para endpoints de Pedidos Balcão
 */

import { Request, Response, NextFunction } from 'express';
import { CounterOrderService } from '@/services/counter-order.service';
import {
  CreateCounterOrderSchema,
  UpdateCounterOrderStatusSchema,
  CancelCounterOrderSchema,
  GetMetricsQuerySchema,
} from '@/models/counter-order.schemas';
import { ValidationError } from '@/utils/errors';

export class CounterOrderController {
  private service: CounterOrderService;

  constructor() {
    this.service = new CounterOrderService();
  }

  /**
   * POST /api/v1/counter-orders
   * Criar novo pedido balcão
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log do body recebido
      console.log('Counter Order - Body recebido:', JSON.stringify(req.body, null, 2));
      console.log('Counter Order - Tipos dos campos:', {
        items: Array.isArray(req.body.items),
        firstItem: req.body.items?.[0] ? {
          productId: typeof req.body.items[0].productId,
          quantity: typeof req.body.items[0].quantity,
          quantityValue: req.body.items[0].quantity,
        } : 'sem itens'
      });

      // Validar dados de entrada
      const validatedData = CreateCounterOrderSchema.parse(req.body);
      console.log('Counter Order - Dados validados:', JSON.stringify(validatedData, null, 2));

      // Extrair userId e establishmentId do request (adicionados por middlewares)
      const userId = (req as any).user?.userId;
      const establishmentId = (req as any).user?.establishmentId;

      console.log('Counter Order - User info:', {
        userId,
        establishmentId,
        fullUser: (req as any).user
      });

      if (!userId || !establishmentId) {
        throw new ValidationError('Usuário ou estabelecimento não identificado');
      }

      // Criar pedido
      const order = await this.service.createOrder(
        validatedData,
        userId,
        establishmentId
      );

      res.status(201).json({
        success: true,
        data: order,
        message: `Pedido #${order.orderNumber} criado com sucesso`,
      });
    } catch (error: any) {
      // Tratar erros de validação do Zod
      if (error.name === 'ZodError') {
        console.error('Erro de validação Zod:', error.errors);
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders/:id
   * Buscar pedido por ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const order = await this.service.getOrderById(id, establishmentId);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders/number/:orderNumber
   * Buscar pedido por número
   */
  getByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderNumber = parseInt(req.params.orderNumber, 10);
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      if (isNaN(orderNumber)) {
        throw new ValidationError('Número do pedido inválido');
      }

      const order = await this.service.getOrderByNumber(
        orderNumber,
        establishmentId
      );

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders
   * Listar pedidos ativos
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const orders = await this.service.getActiveOrders(establishmentId);

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders/pending-payment
   * Listar pedidos pendentes de pagamento
   */
  listPendingPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const orders = await this.service.getPendingPaymentOrders(establishmentId);

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders/ready
   * Listar pedidos prontos
   */
  listReady = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const orders = await this.service.getReadyOrders(establishmentId);

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/counter-orders/:id/status
   * Atualizar status do pedido
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = UpdateCounterOrderStatusSchema.parse(req.body);
      const establishmentId = (req as any).user?.establishmentId;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const order = await this.service.updateOrderStatus(
        id,
        validatedData.status,
        establishmentId,
        userId
      );

      res.status(200).json({
        success: true,
        data: order,
        message: 'Status atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/counter-orders/:id/confirm-payment
   * Confirmar pagamento do pedido
   */
  confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { paymentMethod, amount } = req.body;
      const establishmentId = (req as any).user?.establishmentId;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      console.log('Counter Order - Confirm Payment:', {
        id,
        paymentMethod,
        amount,
        userId,
        establishmentId,
        fullUser: (req as any).user,
        body: req.body,
      });

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const order = await this.service.confirmPayment(
        id,
        establishmentId,
        paymentMethod,
        amount,
        userId
      );

      res.status(200).json({
        success: true,
        data: order,
        message: 'Pagamento confirmado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/counter-orders/:id/cancel
   * Cancelar pedido
   */
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = CancelCounterOrderSchema.parse(req.body);
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      await this.service.cancelOrder(id, validatedData.reason, establishmentId);

      res.status(200).json({
        success: true,
        message: 'Pedido cancelado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/counter-orders/metrics
   * Obter métricas de pedidos balcão
   */
  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = GetMetricsQuerySchema.parse(req.query);
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const startDate = new Date(validatedQuery.startDate);
      const endDate = new Date(validatedQuery.endDate);

      const metrics = await this.service.getMetrics(
        establishmentId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };
}
