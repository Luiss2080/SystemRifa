import { AppError } from '../utils/AppError.js';
import { extractEffectivePermissions } from '../utils/access.js';
import {
  invalidateAllPermissions,
  invalidateUserPermissions
} from '../utils/permissionCache.js';
import { withTransaction } from '../repositories/transaction.js';
import * as permisoRepo from '../repositories/permiso.repository.js';
import * as usuarioRepo from '../repositories/usuario.repository.js';

const SYSTEM_ROLES = new Set(['ADMINISTRADOR', 'ORGANIZADOR', 'PARTICIPANTE']);

export async function listarRoles() {
  const roles = await permisoRepo.findAllRoles();
  return {
    items: roles.map((r) => ({
      rolId: r.rolId,
      nombre: r.nombre,
      descripcion: r.descripcion,
      usuariosCount: r._count.usuarios,
      permisos: r.permisos.map((pr) => ({
        permisoId: pr.permiso.permisoId,
        nombre: pr.permiso.nombre,
        recurso: pr.permiso.recurso,
        accion: pr.permiso.accion,
        estaActivo: pr.permiso.estaActivo
      }))
    }))
  };
}

export async function crearRol(data) {
  const existente = await permisoRepo.findRolByNombre(data.nombre);
  if (existente) {
    throw new AppError(409, 'DUPLICATE_ROLE', `Ya existe un rol con el nombre "${data.nombre}".`);
  }

  const rol = await permisoRepo.createRol(data);
  return { rol };
}

export async function actualizarRol(rolId, data) {
  const rol = await permisoRepo.findRolById(rolId);
  if (!rol) {
    throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');
  }

  if (data.nombre && data.nombre !== rol.nombre && SYSTEM_ROLES.has(rol.nombre)) {
    throw new AppError(
      409,
      'SYSTEM_ROLE_LOCKED',
      `No se puede renombrar el rol del sistema "${rol.nombre}".`
    );
  }

  if (data.nombre && data.nombre !== rol.nombre) {
    const dup = await permisoRepo.findRolByNombre(data.nombre);
    if (dup) {
      throw new AppError(409, 'DUPLICATE_ROLE', `Ya existe un rol con el nombre "${data.nombre}".`);
    }
  }

  const actualizado = await permisoRepo.updateRol(rolId, data);
  invalidateAllPermissions();
  return { rol: actualizado };
}

export async function eliminarRol(rolId) {
  const rol = await permisoRepo.findRolById(rolId);
  if (!rol) {
    throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');
  }

  if (SYSTEM_ROLES.has(rol.nombre)) {
    throw new AppError(
      409,
      'SYSTEM_ROLE_LOCKED',
      `No se puede eliminar el rol del sistema "${rol.nombre}".`
    );
  }

  await permisoRepo.deleteRol(rolId);
  invalidateAllPermissions();
  return { message: `Rol "${rol.nombre}" eliminado correctamente.` };
}

export async function listarPermisos(query) {
  const items = await permisoRepo.findAllPermisos(query);
  return { items };
}

export async function crearPermiso(data) {
  const dup = await permisoRepo.findPermisoByRecursoAccion(data.recurso, data.accion);
  if (dup) {
    throw new AppError(
      409,
      'DUPLICATE_PERMISSION',
      `Ya existe un permiso para ${data.recurso}:${data.accion}.`
    );
  }

  const permiso = await permisoRepo.createPermiso(data);
  return { permiso };
}

export async function actualizarPermiso(permisoId, data) {
  const permiso = await permisoRepo.findPermisoById(permisoId);
  if (!permiso) {
    throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');
  }

  const actualizado = await permisoRepo.updatePermiso(permisoId, data);
  invalidateAllPermissions();
  return { permiso: actualizado };
}

export async function eliminarPermiso(permisoId, { confirmar = false } = {}) {
  const permiso = await permisoRepo.findPermisoById(permisoId);
  if (!permiso) {
    throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');
  }

  const enUso = permiso._count.roles > 0 || permiso._count.usuarios > 0;
  if (enUso && !confirmar) {
    throw new AppError(
      409,
      'PERMISSION_IN_USE',
      'El permiso está asignado a roles o usuarios. Confirma la eliminación con confirmar=true.'
    );
  }

  await permisoRepo.deletePermiso(permisoId);
  invalidateAllPermissions();
  return { message: 'Permiso eliminado correctamente.' };
}

export async function asignarRolAUsuario(adminId, usuarioId, rolId) {
  const [usuario, rol] = await Promise.all([
    usuarioRepo.findAuthSnapshotById(usuarioId),
    permisoRepo.findRolById(rolId)
  ]);

  if (!usuario) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  if (!rol) throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');

  const existente = await permisoRepo.findRolUsuario(usuarioId, rolId);
  if (!existente) {
    await withTransaction(async (tx) => {
      await permisoRepo.assignRolToUser(usuarioId, rolId, tx);
      await permisoRepo.createHistorialPermiso(
        {
          usuarioAdminId: adminId,
          usuarioAfectadoId: usuarioId,
          rolAfectadoId: rolId,
          operacion: 'ASIGNAR_ROL'
        },
        tx
      );
    });
    invalidateUserPermissions(usuarioId);
  }

  return { message: `Rol "${rol.nombre}" asignado correctamente al usuario.` };
}

export async function quitarRolAUsuario(adminId, usuarioId, rolId) {
  const [usuario, rol, existente] = await Promise.all([
    usuarioRepo.findAuthSnapshotById(usuarioId),
    permisoRepo.findRolById(rolId),
    permisoRepo.findRolUsuario(usuarioId, rolId)
  ]);

  if (!usuario) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  if (!rol) throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');
  if (!existente) {
    throw new AppError(404, 'ROLE_ASSIGNMENT_NOT_FOUND', 'El usuario no tiene asignado ese rol.');
  }

  if (rol.nombre === 'ADMINISTRADOR') {
    const otrosAdmins = await permisoRepo.countActiveAdminsExcludingUser(usuarioId);
    if (otrosAdmins === 0) {
      throw new AppError(
        409,
        'LAST_ADMIN',
        'No se puede dejar el sistema sin ningún administrador activo.'
      );
    }
  }

  await withTransaction(async (tx) => {
    await permisoRepo.removeRolFromUser(usuarioId, rolId, tx);
    await permisoRepo.createHistorialPermiso(
      {
        usuarioAdminId: adminId,
        usuarioAfectadoId: usuarioId,
        rolAfectadoId: rolId,
        operacion: 'QUITAR_ROL'
      },
      tx
    );
  });

  invalidateUserPermissions(usuarioId);
  return { message: `Rol "${rol.nombre}" removido correctamente del usuario.` };
}

export async function asignarPermisoARol(adminId, rolId, permisoId) {
  const [rol, permiso] = await Promise.all([
    permisoRepo.findRolById(rolId),
    permisoRepo.findPermisoById(permisoId)
  ]);

  if (!rol) throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');
  if (!permiso) throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');

  const existente = await permisoRepo.findPermisoRol(rolId, permisoId);
  if (!existente) {
    await withTransaction(async (tx) => {
      await permisoRepo.assignPermisoToRol(rolId, permisoId, tx);
      await permisoRepo.createHistorialPermiso(
        {
          usuarioAdminId: adminId,
          rolAfectadoId: rolId,
          permisoId,
          operacion: 'ASIGNAR_PERMISO_ROL'
        },
        tx
      );
    });
    invalidateAllPermissions();
  }

  return { message: 'Permiso asignado al rol correctamente.' };
}

export async function quitarPermisoARol(adminId, rolId, permisoId) {
  const [rol, permiso, existente] = await Promise.all([
    permisoRepo.findRolById(rolId),
    permisoRepo.findPermisoById(permisoId),
    permisoRepo.findPermisoRol(rolId, permisoId)
  ]);

  if (!rol) throw new AppError(404, 'ROLE_NOT_FOUND', 'Rol no encontrado.');
  if (!permiso) throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');
  if (!existente) {
    throw new AppError(404, 'PERMISSION_ASSIGNMENT_NOT_FOUND', 'El rol no tiene asignado ese permiso.');
  }

  await withTransaction(async (tx) => {
    await permisoRepo.removePermisoFromRol(rolId, permisoId, tx);
    await permisoRepo.createHistorialPermiso(
      {
        usuarioAdminId: adminId,
        rolAfectadoId: rolId,
        permisoId,
        operacion: 'QUITAR_PERMISO_ROL'
      },
      tx
    );
  });

  invalidateAllPermissions();
  return { message: 'Permiso removido del rol correctamente.' };
}

export async function asignarPermisoAUsuario(adminId, usuarioId, permisoId) {
  const [usuario, permiso] = await Promise.all([
    usuarioRepo.findAuthSnapshotById(usuarioId),
    permisoRepo.findPermisoById(permisoId)
  ]);

  if (!usuario) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  if (!permiso) throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');

  const existente = await permisoRepo.findPermisoUsuario(usuarioId, permisoId);
  if (!existente) {
    await withTransaction(async (tx) => {
      await permisoRepo.assignPermisoToUser(usuarioId, permisoId, tx);
      await permisoRepo.createHistorialPermiso(
        {
          usuarioAdminId: adminId,
          usuarioAfectadoId: usuarioId,
          permisoId,
          operacion: 'ASIGNAR_PERMISO_USUARIO'
        },
        tx
      );
    });
    invalidateUserPermissions(usuarioId);
  }

  return { message: 'Permiso directo asignado al usuario correctamente.' };
}

export async function quitarPermisoAUsuario(adminId, usuarioId, permisoId) {
  const [usuario, permiso, existente] = await Promise.all([
    usuarioRepo.findAuthSnapshotById(usuarioId),
    permisoRepo.findPermisoById(permisoId),
    permisoRepo.findPermisoUsuario(usuarioId, permisoId)
  ]);

  if (!usuario) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  if (!permiso) throw new AppError(404, 'PERMISSION_NOT_FOUND', 'Permiso no encontrado.');
  if (!existente) {
    throw new AppError(
      404,
      'PERMISSION_ASSIGNMENT_NOT_FOUND',
      'El usuario no tiene asignado ese permiso directo.'
    );
  }

  await withTransaction(async (tx) => {
    await permisoRepo.removePermisoFromUser(usuarioId, permisoId, tx);
    await permisoRepo.createHistorialPermiso(
      {
        usuarioAdminId: adminId,
        usuarioAfectadoId: usuarioId,
        permisoId,
        operacion: 'QUITAR_PERMISO_USUARIO'
      },
      tx
    );
  });

  invalidateUserPermissions(usuarioId);
  return { message: 'Permiso directo removido del usuario correctamente.' };
}

export async function obtenerPermisosEfectivos(usuarioId) {
  const usuario = await usuarioRepo.findProfileWithPermissionsById(usuarioId);
  if (!usuario) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
  }

  return {
    usuarioId: usuario.usuarioId,
    roles: usuario.roles.map((r) => r.rol.nombre),
    permisosDirectos: usuario.permisosDirectos.map((p) => ({
      clave: `${p.permiso.recurso}:${p.permiso.accion}`,
      estaActivo: p.permiso.estaActivo
    })),
    permisosEfectivos: extractEffectivePermissions(usuario)
  };
}

export async function listarHistorialPermisos({ page, limit, usuarioAfectadoId, rolAfectadoId, operacion }) {
  const { items, total } = await permisoRepo.findHistorialPermisos({
    page,
    limit,
    usuarioAfectadoId,
    rolAfectadoId,
    operacion
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

