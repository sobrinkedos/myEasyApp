import { Request, Response, NextFunction } from 'express';
import { EstablishmentService } from '@/services/establishment.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const addressSchema = z.object({
  street: z.string().min(3),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string(),
});

const taxSettingsSchema = z.object({
  taxRegime: z.string(),
  icmsRate: z.number().min(0).max(100),
  issRate: z.number().min(0).max(100),
  pisRate: z.number().min(0).max(100),
  cofinsRate: z.number().min(0).max(100),
});

const updateEstablishmentSchema = z.object({
  name: z.string().min(3).optional(),
  cnpj: z.string().optional(),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  taxSettings: taxSettingsSchema.optional(),
});

export class EstablishmentController {
  private service: EstablishmentService;

  constructor() {
    this.service = new EstablishmentService();
  }

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishment = await this.service.get();

      res.status(200).json({
        success: true,
        data: establishment,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
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
      const establishment = await this.service.update(validation.data, userId);

      res.status(200).json({
        success: true,
        data: establishment,
        message: 'Estabelecimento atualizado com sucesso',
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
      const establishment = await this.service.update({ logoUrl }, userId);

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
