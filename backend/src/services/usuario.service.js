import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import { extractEffectivePermissions } from '../utils/access.js';
import { invalidateUserPermissions } from '../utils/permissionCache.js';
import { withTransaction } from '../repositories/transaction.js';
import * as usuarioRepo from '../repositories/usuario.repository.js';
import * as refreshTokenRepo from '../repositories/refreshToken.repository.js';
import * as permisoRepo from '../repositories/permiso.repository.js';
import * as auditoriaService from './auditoria.service.js';

const BCRYPT_COST = 12;

export async function actualizarMiPerfil(usuarioId, input) {
  const conflicts = await usuarioRepo.findConflicts({
    alias: input.alias,
    telefono: input.telefono,
    excludeUsuarioId: usuarioId
  });

  if (conflicts.length > 0) {
    const campos = [];
    for (const c of conflicts) {
      if (input.alias && c.alias === input.alias) campos.push('alias');
      if (input.telefono && c.telefono === input.telefono) campos.push('teléfono');
    }
    throw new AppError(
      409,
      'DUPLICATE_USER',
      `Ya existe otro usuario con el mismo ${Array.from(new Set(campos)).join(', ')}.`
    );
  }

  try {
    const actualizado = await usuarioRepo.updateById(usuarioId, input);
    return { usuario: actualizado };
  } catch (err) {
    if (err?.code === 'P2002') {
      throw new AppError(409, 'DUPLICATE_USER', 'El alias o teléfono ya está en uso.');
    }
    throw err;
  }
}

export async function cambiarMiPassword(usuarioId, { passwordActual, passwordNueva }) {
  const usuario = await usuarioRepo.findPasswordHashById(usuarioId);
  if (!usuario) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  }

  const coincide = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!coincide) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'La contraseña actual es incorrecta.');
  }

  const nuevoHash = await bcrypt.hash(passwordNueva, BCRYPT_COST);

  await withTransaction(async (tx) => {
    await usuarioRepo.updatePasswordHash(usuarioId, nuevoHash, tx);
    await refreshTokenRepo.revokeAllForUser(usuarioId, tx);
  });

  return {
    message: 'Contraseña actualizada correctamente. Por seguridad se cerraron todas las sesiones activas.'
  };
}

export async function listarUsuarios({ page, limit, search, rol, activo }) {
  const { items, total } = await usuarioRepo.findManyPaginated({
    page,
    limit,
    search,
    rol,
    activo
  });

  return {
    items: items.map((u) => ({
      ...usuarioRepo.formatPublicUser(u),
      roles: u.roles.map((r) => r.rol.nombre)
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function obtenerUsuarioDetalle(usuarioId) {
  const user = await usuarioRepo.findProfileWithPermissionsById(usuarioId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  }

  return {
    usuario: usuarioRepo.formatPublicUser(user),
    roles: user.roles.map((r) => ({
      rolId: r.rol.rolId,
      nombre: r.rol.nombre
    })),
    permisosDirectos: user.permisosDirectos.map((p) => ({
      clave: `${p.permiso.recurso}:${p.permiso.accion}`,
      estaActivo: p.permiso.estaActivo
    })),
    permisosEfectivos: extractEffectivePermissions(user)
  };
}

export async function cambiarEstadoActivo(adminId, usuarioId, activo) {
  const target = await usuarioRepo.findAuthSnapshotById(usuarioId);
  if (!target) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  }

  if (!activo && adminId === usuarioId) {
    throw new AppError(409, 'SELF_DEACTIVATION', 'Un administrador no puede desactivarse a sí mismo.');
  }

  const esObjetivoAdmin = target.roles.some((r) => r.rol.nombre === 'ADMINISTRADOR');
  if (!activo && esObjetivoAdmin) {
    const otrosAdminsActivos = await permisoRepo.countActiveAdminsExcludingUser(usuarioId);
    if (otrosAdminsActivos === 0) {
      throw new AppError(
        409,
        'LAST_ADMIN',
        'No se puede desactivar al último administrador activo del sistema.'
      );
    }
  }

  const actualizado = await withTransaction(async (tx) => {
    const updated = await usuarioRepo.setActivo(usuarioId, activo, tx);
    if (!activo) {
      await refreshTokenRepo.revokeAllForUser(usuarioId, tx);
    }
    await auditoriaService.registrar(tx, {
      usuarioId: adminId,
      entidad: 'usuario',
      entidadId: usuarioId,
      accion: activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
      detalle: { activo }
    });
    return updated;
  });

  invalidateUserPermissions(usuarioId);

  return {
    usuario: {
      ...usuarioRepo.formatPublicUser(actualizado),
      roles: actualizado.roles.map((r) => r.rol.nombre)
    }
  };
}

