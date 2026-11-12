import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import { withTransaction } from '../repositories/transaction.js';
import * as usuarioRepo from '../repositories/usuario.repository.js';
import * as refreshTokenRepo from '../repositories/refreshToken.repository.js';

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
