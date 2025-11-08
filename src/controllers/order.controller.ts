import { Request, Response, NextFunction } from 'express';
import { OrderService } from '@/services/order.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const createOrderSchema = z.object({
  commandId: z.string().uuid('ID da comanda inválido'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('ID do produto inválido'),
        quantity: z.number().int().positive('Quantidade deve ser positiva'),
        observations: z.string().optional(),
      })
    )
    .min(1, 'Pedido deve ter pelo menos um item'),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(15, 'Motivo deve ter no mínimo 15 caracteres'),
});

const modifyOrderSchema = z.object({
  addItems: z
    .array(
      z.object({
        productId: z.string().uuid('ID do produto inválido'),
        quantity: z.number().int().positive('Quantidade deve ser positiva'),
        observations: z.string().optional(),
      })
    )
    .optional(),
  removeItemIds: z.array(z.string().uuid('ID do item inválido')).optional(),
});

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getByCommand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commandId } = req.params;
      const orders = await this.service.getByCommand(commandId);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  getByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;
      const orders = await this.service.getByStatus(status);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createOrderSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const order = await this.service.createOrder(validation.data, userId);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Pedido criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateStatusSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const order = await this.service.updateStatus(id, validation.data.status, userId);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Status do pedido atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = cancelOrderSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const order = await this.service.cancelOrder(id, validation.data.reason, userId);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Pedido cancelado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  modify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = modifyOrderSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const order = await this.service.modifyOrder(id, validation.data, userId);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Pedido modificado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
