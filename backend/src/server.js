import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './config/prisma.js';
import { detenerJobReservas, iniciarJobReservas } from './jobs/liberarReservas.js';
import { logInfo } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logInfo('server_started', { port: env.PORT, env: env.NODE_ENV });
  if (env.NODE_ENV !== 'test') {
    iniciarJobReservas();
  }
});

async function shutdown(signal) {
  logInfo('server_shutdown_requested', { signal });
  detenerJobReservas();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
