import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { findAuthSnapshotById } from '../repositories/usuario.repository.js';

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Se requiere un token de acceso válido.');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Se requiere un token de acceso válido.');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'El token de acceso es inválido o ha expirado.');
    }

    const usuarioId = Number(payload.usuarioId ?? payload.sub);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new AppError(401, 'UNAUTHORIZED', 'El token de acceso es inválido.');
    }

    const usuario = await findAuthSnapshotById(usuarioId);
    if (!usuario) {
      throw new AppError(401, 'UNAUTHORIZED', 'Sesión no válida.');
    }

    if (!usuario.activo) {
      throw new AppError(403, 'USER_INACTIVE', 'Tu cuenta se encuentra desactivada.');
    }

    req.user = {
      usuarioId: usuario.usuarioId,
      alias: usuario.alias,
      email: usuario.email,
      roles: usuario.roles.map((r) => r.rol.nombre)
    };

    next();
  } catch (err) {
    next(err);
  }
}
