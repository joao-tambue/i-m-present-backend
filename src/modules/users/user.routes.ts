import { Router } from 'express';
import { UserController } from './user.controller';

export const userRoutes = Router();
const ctrl = new UserController();

userRoutes.get('/', ctrl.getAll.bind(ctrl));
userRoutes.get('/:id', ctrl.getById.bind(ctrl));
userRoutes.post('/', ctrl.create.bind(ctrl));
userRoutes.delete('/:id', ctrl.remove.bind(ctrl));