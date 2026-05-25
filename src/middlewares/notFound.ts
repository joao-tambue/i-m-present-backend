import { Request, Response } from 'express';
import { ApiResponse } from '../shared/utils/ApiResponse';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json(
    ApiResponse.fail(`Rota ${req.originalUrl} não encontrada`)
  );
};