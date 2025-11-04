import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const result = await this.authService.login(validation.data);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
