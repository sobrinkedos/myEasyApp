import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '@/utils/errors';

/**
 * Middleware para verificar se o usuário tem permissão de operador de caixa
 */
export const requireCashOperator = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Usuário não autenticado');
    }

    const hasPermission =
      req.user.roles.includes('CASH_OPERATOR') ||
      req.user.roles.includes('SUPERVISOR') ||
      req.user.roles.includes('ADMIN');

    if (!hasPermission) {
      throw new AuthorizationError('Permissão de operador de caixa necessária');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar se o usuário tem permissão de supervisor
 */
export const requireSupervisor = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Usuário não autenticado');
    }

    const hasPermission = req.user.roles.includes('SUPERVISOR') || req.user.roles.includes('ADMIN');

    if (!hasPermission) {
      throw new AuthorizationError('Permissão de supervisor necessária');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar se o usuário tem permissão de tesoureiro
 */
export const requireTreasurer = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Usuário não autenticado');
    }

    const hasPermission = req.user.roles.includes('TREASURER') || req.user.roles.includes('ADMIN');

    if (!hasPermission) {
      throw new AuthorizationError('Permissão de tesoureiro necessária');
    }

    next();
  } catch (error) {
    next(error);
  }
};
