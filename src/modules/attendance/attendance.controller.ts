import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authenticate';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { AppError } from '../../shared/utils/AppError';
import { AttendanceService } from './attendance.service';

const service = new AttendanceService();

function getAuthenticatedUserId(req: AuthenticatedRequest) {
  if (!req.user?.sub) {
    throw new AppError('Não autenticado', 401);
  }
  return req.user.sub;
}

export class AttendanceController {
  async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await service.checkIn(getAuthenticatedUserId(req), req.body);
      res.json(ApiResponse.ok(result.message, result.data));
    } catch (err) {
      next(err);
    }
  }

  async checkOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await service.checkOut(getAuthenticatedUserId(req), req.body);
      res.json(ApiResponse.ok(result.message, result.data));
    } catch (err) {
      next(err);
    }
  }

  async myToday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = await service.myToday(getAuthenticatedUserId(req));
      res.json(ApiResponse.ok('Estado de hoje', status));
    } catch (err) {
      next(err);
    }
  }

  async myHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const history = await service.myHistory(getAuthenticatedUserId(req), { from, to });
      res.json(ApiResponse.ok('Histórico obtido', history));
    } catch (err) {
      next(err);
    }
  }

  async todayFullList(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await service.todayFullList();
      res.json(ApiResponse.ok('Lista de presenças do dia', list));
    } catch (err) {
      next(err);
    }
  }
}
