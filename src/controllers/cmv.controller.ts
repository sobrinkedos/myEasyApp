import { Request, Response, NextFunction } from 'express';
import { CMVService } from '@/services/cmv.service';
import { ValidationError } from '@/utils/errors';
import {
  createPeriodSchema,
  updatePeriodSchema,
  closePeriodSchema,
  periodQuerySchema,
} from '@/models/cmv.model';

export class CMVController {
  private service: CMVService;

  constructor() {
    this.service = new CMVService();
  }

  // CRUD Operations
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createPeriodSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const period = await this.service.createPeriod({
        startDate: new Date(validation.data.startDate),
        endDate: new Date(validation.data.endDate),
        type: validation.data.type,
      });

      res.status(201).json({
        success: true,
        data: period,
        message: 'Período CMV criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = periodQuerySchema.safeParse(req.query);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Parâmetros inválidos', errors);
      }

      const filters = {
        startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
        endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined,
        type: validation.data.type,
        status: validation.data.status,
      };

      const periods = await this.service.getAll(filters);

      res.status(200).json({
        success: true,
        data: periods,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const period = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: period,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updatePeriodSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const updateData: any = {};
      if (validation.data.startDate) {
        updateData.startDate = new Date(validation.data.startDate);
      }
      if (validation.data.endDate) {
        updateData.endDate = new Date(validation.data.endDate);
      }
      if (validation.data.type) {
        updateData.type = validation.data.type;
      }

      const period = await this.service.update(id, updateData);

      res.status(200).json({
        success: true,
        data: period,
        message: 'Período CMV atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.service.delete(id);

      res.status(200).json({
        success: true,
        message: 'Período CMV excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  // Action endpoints
  close = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = closePeriodSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const period = await this.service.closePeriod(
        id,
        validation.data.closingAppraisalId
      );

      res.status(200).json({
        success: true,
        data: period,
        message: 'Período CMV fechado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  calculate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const cmvData = await this.service.calculateCMV(id);

      res.status(200).json({
        success: true,
        data: cmvData,
      });
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const products = await this.service.calculateProductCMV(id);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getPurchaseHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const history = await this.service.getPurchaseHistory(id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const ranking = await this.service.getProductRanking(id);

      res.status(200).json({
        success: true,
        data: ranking,
      });
    } catch (error) {
      next(error);
    }
  };
}
