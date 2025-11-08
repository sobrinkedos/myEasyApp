import { Request, Response, NextFunction } from 'express';
import { CommandService } from '@/services/command.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const openCommandSchema = z.object({
  tableId: z.string().uuid().optional(),
  numberOfPeople: z.number().int().positive('Número de pessoas deve ser positivo'),
  type: z.enum(['table', 'counter'], {
    errorMap: () => ({ message: 'Tipo deve ser "table" ou "counter"' }),
  }),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

const closeCommandSchema = z.object({
  serviceChargePercentage: z.number().min(0).max(100).optional(),
});

export class CommandController {
  private service: CommandService;

  constructor() {
    this.service = new CommandService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, waiterId, tableId, startDate, endDate, page, limit } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (waiterId) filters.waiterId = waiterId;
      if (tableId) filters.tableId = tableId;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 50;

      const result = await this.service.getAll(filters, pageNum, limitNum);

      res.status(200).json({
        success: true,
        data: result.commands,
        pagination: {
          page: result.page,
          limit: limitNum,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const command = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: command,
      });
    } catch (error) {
      next(error);
    }
  };

  getOpen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commands = await this.service.getOpen();

      res.status(200).json({
        success: true,
        data: commands,
      });
    } catch (error) {
      next(error);
    }
  };

  getByWaiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { waiterId } = req.params;
      const commands = await this.service.getByWaiter(waiterId);

      res.status(200).json({
        success: true,
        data: commands,
      });
    } catch (error) {
      next(error);
    }
  };

  openCommand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = openCommandSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const command = await this.service.openCommand(validation.data, userId);

      res.status(201).json({
        success: true,
        data: command,
        message: 'Comanda aberta com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  closeCommand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = closeCommandSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const command = await this.service.closeCommand(
        id,
        validation.data.serviceChargePercentage
      );

      res.status(200).json({
        success: true,
        data: command,
        message: 'Comanda enviada para pagamento',
      });
    } catch (error) {
      next(error);
    }
  };

  confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { paymentMethod, amount } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      if (!paymentMethod || !amount) {
        throw new Error('Forma de pagamento e valor são obrigatórios');
      }

      const command = await this.service.confirmPayment(id, paymentMethod, amount, userId);

      res.status(200).json({
        success: true,
        data: command,
        message: 'Pagamento confirmado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
