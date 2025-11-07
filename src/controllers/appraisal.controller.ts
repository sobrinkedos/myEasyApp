import { Request, Response, NextFunction } from 'express';
import { AppraisalService } from '@/services/appraisal.service';
import { ValidationError } from '@/utils/errors';
import {
  createAppraisalSchema,
  updateAppraisalSchema,
  addItemSchema,
  updateItemSchema,
  appraisalQuerySchema,
} from '@/models/appraisal.model';

export class AppraisalController {
  private service: AppraisalService;

  constructor() {
    this.service = new AppraisalService();
  }

  // CRUD Operations
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createAppraisalSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const userId = req.user!.userId;

      const appraisal = await this.service.create({
        date: new Date(validation.data.date),
        type: validation.data.type,
        userId,
        notes: validation.data.notes,
      });

      res.status(201).json({
        success: true,
        data: appraisal,
        message: 'Conferência criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = appraisalQuerySchema.safeParse(req.query);

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
        userId: validation.data.userId,
      };

      const appraisals = await this.service.getAll(filters);

      res.status(200).json({
        success: true,
        data: appraisals,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const appraisal = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: appraisal,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateAppraisalSchema.safeParse(req.body);

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
      if (validation.data.date) {
        updateData.date = new Date(validation.data.date);
      }
      if (validation.data.type) {
        updateData.type = validation.data.type;
      }
      if (validation.data.notes !== undefined) {
        updateData.notes = validation.data.notes;
      }

      const appraisal = await this.service.update(id, updateData);

      res.status(200).json({
        success: true,
        data: appraisal,
        message: 'Conferência atualizada com sucesso',
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
        message: 'Conferência excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  // Item Management (will be implemented in next sub-task)
  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = addItemSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const item = await this.service.addItem(id, validation.data);

      res.status(201).json({
        success: true,
        data: item,
        message: 'Item adicionado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, itemId } = req.params;
      const validation = updateItemSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const item = await this.service.updateItem(id, itemId, validation.data);

      res.status(200).json({
        success: true,
        data: item,
        message: 'Item atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, itemId } = req.params;

      await this.service.removeItem(id, itemId);

      res.status(200).json({
        success: true,
        message: 'Item removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  // Actions (will be implemented in next sub-task)
  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const appraisal = await this.service.complete(id);

      res.status(200).json({
        success: true,
        data: appraisal,
        message: 'Conferência completada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const approverId = req.user!.userId;

      const appraisal = await this.service.approve(id, approverId);

      res.status(200).json({
        success: true,
        data: appraisal,
        message: 'Conferência aprovada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getAccuracy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const accuracy = await this.service.calculateAccuracy(id);

      res.status(200).json({
        success: true,
        data: accuracy,
      });
    } catch (error) {
      next(error);
    }
  };
}
