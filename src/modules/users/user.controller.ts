import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../shared/utils/ApiResponse';

const service = new UserService();

type UserParams = {
  id: string;
};

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.getAllUsers();
      res.json(ApiResponse.ok('Utilizadores obtidos', users));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request<UserParams>, res: Response, next: NextFunction) {
    try {
      const user = await service.getUserById(req.params.id);
      res.json(ApiResponse.ok('Utilizador obtido', user));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.createUser(req.body);
      res.status(201).json(ApiResponse.ok('Utilizador criado', user));
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request<UserParams>, res: Response, next: NextFunction) {
    try {
      await service.deleteUser(req.params.id);
      res.json(ApiResponse.ok('Utilizador eliminado'));
    } catch (err) {
      next(err);
    }
  }
}
