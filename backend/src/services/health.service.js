import { pingDatabase } from '../repositories/health.repository.js';
import { AppError } from '../utils/AppError.js';

export async function verificarSalud() {
  try {
    await pingDatabase();
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch {
    throw new AppError(503, 'DATABASE_UNAVAILABLE', 'No se pudo conectar con la base de datos.');
  }
}

