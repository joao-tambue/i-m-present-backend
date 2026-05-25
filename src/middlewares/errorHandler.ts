import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/utils/AppError';
import { ApiResponse } from '../shared/utils/ApiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponse.fail(err.message)
    );
  }

  console.error('ERRO NÃO TRATADO:', err);
  
  return res.status(500).json(
    ApiResponse.fail(
      'Erro interno do servidor',
      env.nodeEnv === 'development' ? err.message : undefined
    )
  );
};