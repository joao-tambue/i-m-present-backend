import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { ApiResponse } from '../shared/utils/ApiResponse';
import { JwtPayload, Role } from '../modules/auth/auth.model';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json(ApiResponse.fail('Token de autenticação não fornecido'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json(ApiResponse.fail('Token expirado'));
    }
    return res.status(401).json(ApiResponse.fail('Token inválido'));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.fail('Não autenticado'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return res
        .status(403)
        .json(ApiResponse.fail('Não tem permissão para aceder a este recurso'));
    }

    next();
  };
}