import { Router } from 'express';

import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import {
  loginSchema,
  registerCoordinatorSchema,
  registerEmployeeSchema,
} from '../../middlewares/validate';

export const authRoutes = Router();
const ctrl = new AuthController();

authRoutes.post(
  '/register/coordinator',
  validate(registerCoordinatorSchema),
  ctrl.registerCoordinator.bind(ctrl),
);

authRoutes.post(
  '/register/employee',
  validate(registerEmployeeSchema),
  ctrl.registerEmployee.bind(ctrl),
);

authRoutes.post(
  '/login',
  validate(loginSchema),
  ctrl.login.bind(ctrl),
);
authRoutes.get(
  '/me',
  authenticate,
  ctrl.me.bind(ctrl),
);