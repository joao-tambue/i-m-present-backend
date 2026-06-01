import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authenticate';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { AppError } from '../../shared/utils/AppError';
import { QRCodeService } from './qrcode.service';

const service = new QRCodeService();

function getUserId(req: AuthenticatedRequest) {
  if (!req.user?.sub) throw new AppError('Não autenticado', 401);
  return req.user.sub;
}

export class QRCodeController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await service.list(page, limit, search);
      res.json(ApiResponse.ok('QR Codes listados', result));
    } catch (err) {
      next(err);
    }
  }

  async getByEmployeeId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const qrCode = await service.getByEmployeeId(req.params['id'] as string);
      res.json(ApiResponse.ok('QR Code obtido', qrCode));
    } catch (err) {
      next(err);
    }
  }

  async getMyQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const qrCode = await service.getMyQRCode(getUserId(req));
      res.json(ApiResponse.ok('QR Code obtido', qrCode));
    } catch (err) {
      next(err);
    }
  }

  async regenerate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const qrCode = await service.regenerate(req.params['id'] as string);
      res.json(ApiResponse.ok('QR Code gerado', qrCode));
    } catch (err) {
      next(err);
    }
  }

  async revoke(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const qrCode = await service.revoke(req.params['id'] as string);
      res.json(ApiResponse.ok('QR Code revogado', qrCode));
    } catch (err) {
      next(err);
    }
  }
}
