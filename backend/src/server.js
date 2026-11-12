import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './config/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`API Sistema de Rifas Solidarias escuchando en http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`Recibida señal ${signal}, cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
