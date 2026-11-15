import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portFilePath = path.resolve(__dirname, '../.backend-port.json');

function getActiveBackendPort() {
  if (process.env.VITE_BACKEND_PORT) {
    const p = Number(process.env.VITE_BACKEND_PORT);
    if (!Number.isNaN(p) && p > 0) return p;
  }
  try {
    if (fs.existsSync(portFilePath)) {
      const parsed = JSON.parse(fs.readFileSync(portFilePath, 'utf8'));
      if (parsed?.port) return Number(parsed.port);
    }
  } catch {
    // Si aún no está listo el archivo, usar puerto estándar 3000
  }
  return 3000;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        router: () => {
          const port = getActiveBackendPort();
          return `http://localhost:${port}`;
        }
      }
    }
  }
});

