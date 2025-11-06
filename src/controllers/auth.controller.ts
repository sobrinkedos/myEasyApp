import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const addressSchema = z.object({
  street: z.string().min(3, 'Rua deve ter no mínimo 3 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, 'Bairro deve ter no mínimo 3 caracteres'),
  city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

const taxSettingsSchema = z.object({
  taxRegime: z.enum(['simples', 'presumido', 'real'], {
    errorMap: () => ({ message: 'Regime tributário inválido' }),
  }),
  icmsRate: z.number().min(0).max(100, 'Taxa ICMS deve estar entre 0 e 100'),
  issRate: z.number().min(0).max(100, 'Taxa ISS deve estar entre 0 e 100'),
  pisRate: z.number().min(0).max(100, 'Taxa PIS deve estar entre 0 e 100'),
  cofinsRate: z.number().min(0).max(100, 'Taxa COFINS deve estar entre 0 e 100'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido').optional(),
  establishment: z.object({
    name: z.string().min(3, 'Nome do estabelecimento deve ter no mínimo 3 caracteres'),
    cnpj: z.string().regex(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
    address: addressSchema,
    phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
    email: z.string().email('Email inválido'),
    taxSettings: taxSettingsSchema,
  }),
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
          const field = err.path.join('.');
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

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });
        throw new ValidationError('Dados inválidos', errors);
      }

      const result = await this.authService.register(validation.data);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Cadastro realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
