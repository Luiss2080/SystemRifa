import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const portFilePath = path.resolve(rootDir, '.backend-port.json');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort, maxAttempts = 50) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No se encontró un puerto disponible a partir de ${startPort}`);
}

const backendPort = await findAvailablePort(3000);
const frontendPort = await findAvailablePort(5173);

try {
  fs.writeFileSync(
    portFilePath,
    JSON.stringify(
      {
        port: backendPort,
        url: `http://localhost:${backendPort}`,
        api: `http://localhost:${backendPort}/api`,
        frontendPort,
        updatedAt: new Date().toISOString()
      },
      null,
      2
    ),
    'utf8'
  );
} catch {
  // Ignorar si falla la escritura previa
}

console.log(`[dev] 🚀 Backend asignado dinámicamente al puerto: ${backendPort}`);
console.log(`[dev] 🌐 Frontend asignado dinámicamente al puerto: ${frontendPort}`);

const procs = [
  {
    name: 'backend',
    cmd: 'npm --prefix backend run dev',
    env: { ...process.env, PORT: String(backendPort) }
  },
  {
    name: 'frontend',
    cmd: 'npm --prefix frontend run dev',
    env: {
      ...process.env,
      VITE_BACKEND_PORT: String(backendPort),
      PORT: String(frontendPort)
    }
  }
];

const children = procs.map(({ name, cmd, env }) => {
  const child = spawn(cmd, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env
  });

  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line.length > 0) console.log(`[${name}] ${line}`);
    }
  });

  child.stderr.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line.length > 0) console.error(`[${name}] ${line}`);
    }
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[${name}] terminó con código ${code}`);
    }
  });

  return child;
});

function shutdown() {
  try {
    if (fs.existsSync(portFilePath)) {
      fs.unlinkSync(portFilePath);
    }
  } catch {
    // Ignorar
  }

  for (const child of children) {
    if (child.pid && !child.killed) {
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
        } catch {
          // Si el proceso ya finalizó, ignorar
        }
      } else {
        child.kill('SIGINT');
      }
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
