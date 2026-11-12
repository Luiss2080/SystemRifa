import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import { extractEffectivePermissions } from '../utils/access.js';
import {
  generateRefreshToken,
  getRefreshExpirationDate,
  hashRefreshToken,
  signAccessToken
} from '../utils/tokens.js';
import { withTransaction } from '../repositories/transaction.js';
import * as usuarioRepo from '../repositories/usuario.repository.js';
import * as refreshTokenRepo from '../repositories/refreshToken.repository.js';
import * as notificacionService from './notificacion.service.js';

const BCRYPT_COST = 12;

function buildConflictError(conflicts, input) {
  const campos = [];
  for (const c of conflicts) {
    if (input.email && c.email === input.email) campos.push('email');
    if (input.alias && c.alias === input.alias) campos.push('alias');
    if (input.telefono && c.telefono === input.telefono) campos.push('teléfono');
  }
  const unicos = Array.from(new Set(campos));
  const detalle = unicos.length > 0 ? unicos.join(', ') : 'datos únicos';
  return new AppError(409, 'DUPLICATE_USER', `Ya existe una cuenta registrada con el mismo ${detalle}.`);
}

export async function registrar(input) {
  const conflicts = await usuarioRepo.findConflicts({
    alias: input.alias,
    email: input.email,
    telefono: input.telefono
  });

  if (conflicts.length > 0) {
    throw buildConflictError(conflicts, input);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  try {
    const creado = await withTransaction((tx) =>
      usuarioRepo.createWithRole(
        {
          data: {
            alias: input.alias,
            email: input.email,
            telefono: input.telefono ?? null,
            nombres: input.nombres,
            apellidos: input.apellidos,
            passwordHash
          },
          rolNombre: 'PARTICIPANTE'
        },
        tx
      )
    );

    // Regla 9: notificar post-commit sin propagar errores si falla
    await notificacionService.notificar('BIENVENIDA', [creado.usuarioId], {
      alias: creado.alias
    });

    return {
      usuario: {
        ...usuarioRepo.formatPublicUser(creado),
        roles: creado.roles.map((r) => r.rol.nombre)
      }
    };
  } catch (err) {
    if (err?.code === 'P2002') {
      throw new AppError(409, 'DUPLICATE_USER', 'El alias, email o teléfono ya se encuentra registrado.');
    }
    throw err;
  }
}

export async function login({ email, password }) {
  const usuario = await usuarioRepo.findByEmailForLogin(email);
  if (!usuario) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  if (!usuario.activo) {
    throw new AppError(403, 'USER_INACTIVE', 'Tu cuenta se encuentra desactivada.');
  }

  const roles = usuario.roles.map((r) => r.rol.nombre);
  const accessToken = signAccessToken({ usuarioId: usuario.usuarioId, roles });
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiraEn = getRefreshExpirationDate();

  await refreshTokenRepo.create({
    usuarioId: usuario.usuarioId,
    tokenHash,
    expiraEn
  });

  return {
    accessToken,
    refreshToken,
    usuario: {
      ...usuarioRepo.formatPublicUser(usuario),
      roles
    }
  };
}

export async function refresh({ refreshToken }) {
  const tokenHash = hashRefreshToken(refreshToken);
  const registro = await refreshTokenRepo.findByTokenHashWithUser(tokenHash);

  if (!registro) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'El refresh token es inválido.');
  }

  if (registro.revocado) {
    await refreshTokenRepo.revokeAllForUser(registro.usuarioId);
    throw new AppError(
      401,
      'TOKEN_REUSED',
      'Se detectó la reutilización de un refresh token revocado. Todas las sesiones han sido cerradas.'
    );
  }

  if (registro.expiraEn <= new Date()) {
    await refreshTokenRepo.revokeIfActive(registro.refreshTokenId);
    throw new AppError(401, 'TOKEN_EXPIRED', 'El refresh token ha expirado.');
  }

  if (!registro.usuario.activo) {
    throw new AppError(403, 'USER_INACTIVE', 'Tu cuenta se encuentra desactivada.');
  }

  const roles = registro.usuario.roles.map((r) => r.rol.nombre);
  const nuevoRefreshToken = generateRefreshToken();
  const nuevoTokenHash = hashRefreshToken(nuevoRefreshToken);
  const nuevaExpiracion = getRefreshExpirationDate();

  const rotado = await withTransaction(async (tx) => {
    const updated = await refreshTokenRepo.revokeIfActive(registro.refreshTokenId, tx);
    if (updated.count !== 1) {
      await refreshTokenRepo.revokeAllForUser(registro.usuarioId, tx);
      return false;
    }

    await refreshTokenRepo.create(
      {
        usuarioId: registro.usuarioId,
        tokenHash: nuevoTokenHash,
        expiraEn: nuevaExpiracion
      },
      tx
    );

    return true;
  });

  if (!rotado) {
    throw new AppError(
      401,
      'TOKEN_REUSED',
      'Se detectó la reutilización de un refresh token revocado. Todas las sesiones han sido cerradas.'
    );
  }

  const accessToken = signAccessToken({ usuarioId: registro.usuarioId, roles });

  return {
    accessToken,
    refreshToken: nuevoRefreshToken
  };
}

export async function logout(usuarioId, { refreshToken }) {
  const tokenHash = hashRefreshToken(refreshToken);
  await refreshTokenRepo.revokeByTokenHashAndUser(tokenHash, usuarioId);
  return {
    message: 'Sesión cerrada correctamente.'
  };
}

export async function obtenerPerfilAutenticado(usuarioId) {
  const usuario = await usuarioRepo.findProfileWithPermissionsById(usuarioId);
  if (!usuario) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  }

  const roles = usuario.roles.map((r) => r.rol.nombre);
  const permisos = extractEffectivePermissions(usuario);

  return {
    usuario: usuarioRepo.formatPublicUser(usuario),
    roles,
    permisos
  };
}

