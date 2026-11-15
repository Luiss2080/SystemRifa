import fs from 'node:fs';
import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './config/prisma.js';
import { detenerJobReservas, iniciarJobReservas } from './jobs/liberarReservas.js';
import { logInfo, logWarn } from './utils/logger.js';

let server = null;
let activePort = env.PORT;

const portFilePath = new URL('../../.backend-port.json', import.meta.url);

function saveActivePort(port) {
  try {
    fs.writeFileSync(
      portFilePath,
      JSON.stringify(
        {
          port,
          url: `http://localhost:${port}`,
          api: `http://localhost:${port}/api`,
          updatedAt: new Date().toISOString()
        },
        null,
        2
      ),
      'utf8'
    );
  } catch {
    // Si no se puede escribir el archivo temporal, continuar sin bloquear
  }
}

function clearActivePort() {
  try {
    if (fs.existsSync(portFilePath)) {
      fs.unlinkSync(portFilePath);
    }
  } catch {
    // Si ya fue borrado, ignorar
  }
}

async function startListening(startPort, maxAttempts = 50) {
  let port = Number(startPort);
  for (let attempt = 0; attempt < maxAttempts; attempt++, port++) {
    const success = await new Promise((resolve) => {
      const s = app.listen(port, () => {
        server = s;
        activePort = port;
        resolve(true);
      });
      s.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logWarn('port_occupied_trying_next', { port, nextPort: port + 1 });
          resolve(false);
        } else {
          throw err;
        }
      });
    });

    if (success) {
      logInfo('server_started', { port: activePort, env: env.NODE_ENV });
      saveActivePort(activePort);
      if (env.NODE_ENV !== 'test') {
        iniciarJobReservas();
      }
      return;
    }
  }

  throw new Error(`No se encontró ningún puerto disponible entre ${startPort} y ${startPort + maxAttempts - 1}`);
}

await startListening(env.PORT);

async function shutdown(signal) {
  logInfo('server_shutdown_requested', { signal });
  detenerJobReservas();
  clearActivePort();
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
