import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { authRoutes } from './modules/auth/auth.routes';
import { attendanceRoutes } from './modules/attendance/attendance.routes';
import { coordinatorRoutes } from './modules/coordinator/coordinator.routes';
import { qrCodeRoutes } from './modules/qr-code/qrcode.routes';
import { userRoutes } from './modules/users/user.routes';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(
    cors({
      origin: env.allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'QR Attendance API — Docs',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        operationsSorter: 'method',
      },
    }),
  );

  app.get('/api/v1/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/coordinator', coordinatorRoutes);
  app.use('/api/v1/qr-code', qrCodeRoutes);
  app.use('/api/v1/users', userRoutes); // legado — remover quando não for necessário

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
