import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { authRoutes } from './modules/auth/auth.routes';

// Nota: userRoutes (em memória) pode ser removido após migrares tudo para Prisma.
// Mantido temporariamente para não quebrar código existente.
import { userRoutes } from './modules/users/user.routes';

export const createApp = (): Application => {
  const app = express();
  
  app.use(helmet());
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

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};