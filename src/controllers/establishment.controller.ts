import { Request, Response, NextFunction } from 'express';
import { EstablishmentService } from '@/services/establishment.service';
import { ValidationError } from '@/utils/errors';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
} from '@/models/establishment.model';

export class EstablishmentController {
  private service: EstablishmentService;

  constructor() {
    this.service = new EstablishmentService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishments = await this.service.getAll();

      res.status(200).json({
        success: true,
        data: establishments,
        count: establishments.length,
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 req.user:', req.user);
      
      // Get establishment from user's token
      const establishmentId = req.user!.establishmentId;
      console.log('🏢 establishmentId:', establishmentId);
      
      const establishment = await this.service.getById(establishmentId);
      console.log('✅ establishment:', establishment);

      res.status(200).json({
        success: true,
        data: establishment,
      });
    } catch (error) {
      console.error('❌ Erro no get establishment:', error);
      next(error);
    }
  };

  updateCurrent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = updateEstablishmentSchema.safeParse(req.body);

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
      const establishmentId = req.user!.establishmentId;
      const establishment = await this.service.update(establishmentId, validation.data, userId);

      res.status(200).json({
        success: true,
        data: establishment,
        message: 'Estabelecimento atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const establishment = await this.service.getById(id);

      res.status(200).json({
        success: true,
        data: establishment,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createEstablishmentSchema.safeParse(req.body);

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
      const establishment = await this.service.create(validation.data, userId);

      res.status(201).json({
        success: true,
        data: establishment,
        message: 'Estabelecimento criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateEstablishmentSchema.safeParse(req.body);

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
      const establishment = await this.service.update(id, validation.data, userId);

      res.status(200).json({
        success: true,
        data: establishment,
        message: 'Estabelecimento atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await this.service.delete(id, userId);

      res.status(200).json({
        success: true,
        message: 'Estabelecimento excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ValidationError('Nenhum arquivo foi enviado', {
          file: ['Arquivo é obrigatório'],
        });
      }

      const logoUrl = `/uploads/${req.file.filename}`;
      const userId = req.user!.userId;
      const establishmentId = req.user!.establishmentId;
      
      const establishment = await this.service.update(establishmentId, { logoUrl }, userId);

      res.status(200).json({
        success: true,
        data: {
          logoUrl: establishment.logoUrl,
        },
        message: 'Logo enviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
