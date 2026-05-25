import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Servidor a correr em http://localhost:${env.port}`);
  console.log(`Ambiente: ${env.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. A fechar servidor...');
  server.close(() => {
    console.log('Servidor fechado.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Rejeição não tratada:', reason);
  server.close(() => process.exit(1));
});