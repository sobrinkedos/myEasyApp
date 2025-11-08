import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@/utils/errors';
import logger from '@/utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Error type:', err.constructor.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);

  if (err instanceof AppError) {
    // Operational errors
    const response: any = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Non-operational errors (programming errors, unknown errors)
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
