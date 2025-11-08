import { Request, Response, NextFunction } from 'express';
import { CashSessionService } from '@/services/cash-session.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';
import { CashSessionStatus } from '@prisma/client';

const openSessionSchema = z.object({
  cashRegisterId: z.string().uuid('ID do caixa inválido'),
  openingAmount: z.number().positive('Valor de abertura deve ser positivo').min(50).max(500),
});

const closeSessionSchema = z.object({
  countedAmount: z.number().positive('Valor contado deve ser positivo'),
  counts: z.array(
    z.object({
      denomination: z.number().positive(),
      quantity: z.number().int().nonnegative(),
      total: z.number().nonnegative(),
    })
  ),
  notes: z.string().optional(),
});

const reopenSessionSchema = z.object({
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
});

export class CashSessionController {
  private service: CashSessionService;

  constructor() {
    this.service = new CashSessionService();
  }

  openSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('=== OPEN SESSION REQUEST ===');
      console.log('Body:', req.body);
      console.log('User:', req.user);

      const validation = openSessionSchema.safeParse(req.body);

      if (!validation.success) {
        console.log('Validation errors:', validation.error.errors);
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      console.log('Validated data:', validation.data);
      console.log('Opening session with operatorId:', req.user!.userId);

      const session = await this.service.openSession({
        ...validation.data,
        operatorId: req.user!.userId,
      });

      console.log('Session created:', session.id);

      res.status(201).json({
        success: true,
        data: session,
        message: 'Caixa aberto com sucesso',
      });
    } catch (error) {
      console.error('Error opening session:', error);
      next(error);
    }
  };

  getActiveSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.service.getActiveSession(req.user!.userId);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  getSessionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const session = await this.service.getSessionDetails(id);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  closeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = closeSessionSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.') as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const session = await this.service.closeSession(id, validation.data, req.user!.userId);

      res.status(200).json({
        success: true,
        data: session,
        message: 'Caixa fechado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  reopenSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = reopenSessionSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const session = await this.service.reopenSession(id, validation.data.reason, req.user!.userId);

      res.status(200).json({
        success: true,
        data: session,
        message: 'Caixa reaberto com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  listSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, operatorId, startDate, endDate, page, limit } = req.query;

      const filters = {
        status: status as CashSessionStatus | undefined,
        operatorId: operatorId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.service.listSessions(filters);

      res.status(200).json({
        success: true,
        data: result.sessions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getCashRegisters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = req.user!.establishmentId;
      const registers = await this.service.getCashRegisters(establishmentId);

      res.status(200).json({
        success: true,
        data: registers,
      });
    } catch (error) {
      next(error);
    }
  };
}
