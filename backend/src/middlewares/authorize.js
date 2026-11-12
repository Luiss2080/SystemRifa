import { AppError } from '../utils/AppError.js';
import { esAdmin, extractEffectivePermissions } from '../utils/access.js';
import { getCachedPermissions, setCachedPermissions } from '../utils/permissionCache.js';
import { findProfileWithPermissionsById } from '../repositories/usuario.repository.js';
import { findRifaOwnershipById } from '../repositories/rifa.repository.js';

export { esAdmin };

async function loadUserEffectiveSet(usuarioId) {
  const cached = getCachedPermissions(usuarioId);
  if (cached) {
    return cached;
  }

  const user = await findProfileWithPermissionsById(usuarioId);
  if (!user || !user.activo) {
    return null;
  }

  const roles = user.roles.map((r) => r.rol.nombre);
  const permisos = new Set(extractEffectivePermissions(user));
  const value = { roles, permisos };
  setCachedPermissions(usuarioId, value);
  return value;
}

/**
 * Middleware que exige que el usuario autenticado posea el permiso `recurso:accion` activo.
 * @param {string} recurso
 * @param {string} accion
 */
export function authorize(recurso, accion) {
  const clave = `${recurso}:${accion}`;

  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Se requiere autenticación.');
      }

      const access = await loadUserEffectiveSet(req.user.usuarioId);
      if (!access) {
        throw new AppError(403, 'USER_INACTIVE', 'Tu cuenta se encuentra desactivada.');
      }

      req.user.roles = access.roles;

      if (!access.permisos.has(clave)) {
        throw new AppError(
          403,
          'FORBIDDEN',
          `No tienes el permiso requerido (${clave}) para realizar esta acción.`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Verifica a nivel de servicio que el usuario sea ADMINISTRADOR o creador de la rifa.
 * @param {{ usuarioId: number, roles?: string[] }} user
 * @param {{ usuarioCreadorId: number }} rifa
 */
export function assertPropietarioORAdmin(user, rifa) {
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Se requiere autenticación.');
  }
  if (esAdmin(user)) {
    return;
  }
  if (rifa.usuarioCreadorId !== user.usuarioId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Solo el administrador o el organizador propietario de la rifa puede realizar esta acción.'
    );
  }
}

/**
 * Middleware/servicio que valida existencia de la rifa y propiedad (o rol ADMINISTRADOR).
 * @param {string} [paramName='id']
 */
export function exigirPropietarioORAdmin(paramName = 'id') {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Se requiere autenticación.');
      }

      const rifaId = Number(req.params[paramName]);
      if (!Number.isInteger(rifaId) || rifaId <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'El identificador de rifa no es válido.');
      }

      const rifa = await findRifaOwnershipById(rifaId);
      if (!rifa) {
        throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
      }

      assertPropietarioORAdmin(req.user, rifa);
      req.rifaOwnership = rifa;
      next();
    } catch (err) {
      next(err);
    }
  };
}
