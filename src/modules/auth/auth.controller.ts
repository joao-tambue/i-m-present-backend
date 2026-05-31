import { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../../shared/utils/ApiResponse';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/authenticate';
import { Role } from './auth.model';

const service = new AuthService();

export class AuthController {
  async registerCoordinator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.registerCoordinator(req.body);
      res.status(201).json(ApiResponse.ok('Coordenador registado com sucesso', result));
    } catch (err) {
      next(err);
    }
  }

  async registerEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.registerEmployee(req.body);
      res.status(201).json(ApiResponse.ok('Funcionário registado com sucesso', result));
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.login(req.body);
      res.json(ApiResponse.ok('Login efectuado com sucesso', result));
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sub, role } = req.user!;
      const user = await service.getMe(sub, role as Role);
      res.json(ApiResponse.ok('Perfil obtido', user));
    } catch (err) {
      next(err);
    }
  }
}