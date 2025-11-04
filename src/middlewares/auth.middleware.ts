import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { AuthenticationError, AuthorizationError } from '@/utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError('Token não fornecido');
      }

      const parts = authHeader.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthenticationError('Formato de token inválido');
      }

      const token = parts[1];

      const payload = await this.authService.validateToken(token);

      // Attach user to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('Usuário não autenticado');
        }

        if (!allowedRoles.includes(req.user.role)) {
          throw new AuthorizationError('Você não tem permissão para acessar este recurso');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };
}
