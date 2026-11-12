import { prisma } from '../config/prisma.js';

export async function findAllRoles(db = prisma) {
  return db.rol.findMany({
    orderBy: { rolId: 'asc' },
    include: {
      permisos: {
        include: {
          permiso: true
        }
      },
      _count: {
        select: { usuarios: true }
      }
    }
  });
}

export async function findRolById(rolId, db = prisma) {
  return db.rol.findUnique({
    where: { rolId },
    include: {
      permisos: {
        include: { permiso: true }
      },
      _count: {
        select: { usuarios: true }
      }
    }
  });
}

export async function findRolByNombre(nombre, db = prisma) {
  return db.rol.findUnique({ where: { nombre } });
}

export async function createRol(data, tx = prisma) {
  return tx.rol.create({ data });
}

export async function updateRol(rolId, data, tx = prisma) {
  return tx.rol.update({ where: { rolId }, data });
}

export async function deleteRol(rolId, tx = prisma) {
  return tx.rol.delete({ where: { rolId } });
}

export async function findAllPermisos({ recurso, estaActivo } = {}, db = prisma) {
  return db.permiso.findMany({
    where: {
      ...(recurso ? { recurso } : {}),
      ...(estaActivo !== undefined ? { estaActivo } : {})
    },
    orderBy: [{ recurso: 'asc' }, { accion: 'asc' }]
  });
}

export async function findPermisoById(permisoId, db = prisma) {
  return db.permiso.findUnique({
    where: { permisoId },
    include: {
      _count: {
        select: { roles: true, usuarios: true }
      }
    }
  });
}

export async function findPermisoByRecursoAccion(recurso, accion, db = prisma) {
  return db.permiso.findUnique({
    where: { recurso_accion: { recurso, accion } }
  });
}

export async function createPermiso(data, tx = prisma) {
  return tx.permiso.create({ data });
}

export async function updatePermiso(permisoId, data, tx = prisma) {
  return tx.permiso.update({ where: { permisoId }, data });
}

export async function deletePermiso(permisoId, tx = prisma) {
  return tx.permiso.delete({ where: { permisoId } });
}

export async function findRolUsuario(usuarioId, rolId, db = prisma) {
  return db.rolUsuario.findUnique({
    where: { usuarioId_rolId: { usuarioId, rolId } }
  });
}

export async function assignRolToUser(usuarioId, rolId, tx = prisma) {
  return tx.rolUsuario.upsert({
    where: { usuarioId_rolId: { usuarioId, rolId } },
    update: {},
    create: { usuarioId, rolId }
  });
}

export async function removeRolFromUser(usuarioId, rolId, tx = prisma) {
  return tx.rolUsuario.delete({
    where: { usuarioId_rolId: { usuarioId, rolId } }
  });
}

export async function countActiveAdminsExcludingUser(excludeUsuarioId, db = prisma) {
  return db.usuario.count({
    where: {
      activo: true,
      usuarioId: { not: excludeUsuarioId },
      roles: {
        some: {
          rol: { nombre: 'ADMINISTRADOR' }
        }
      }
    }
  });
}

export async function findPermisoRol(rolId, permisoId, db = prisma) {
  return db.permisoRol.findUnique({
    where: { rolId_permisoId: { rolId, permisoId } }
  });
}

export async function assignPermisoToRol(rolId, permisoId, tx = prisma) {
  return tx.permisoRol.upsert({
    where: { rolId_permisoId: { rolId, permisoId } },
    update: {},
    create: { rolId, permisoId }
  });
}

export async function removePermisoFromRol(rolId, permisoId, tx = prisma) {
  return tx.permisoRol.delete({
    where: { rolId_permisoId: { rolId, permisoId } }
  });
}

export async function findPermisoUsuario(usuarioId, permisoId, db = prisma) {
  return db.permisoUsuario.findUnique({
    where: { usuarioId_permisoId: { usuarioId, permisoId } }
  });
}

export async function assignPermisoToUser(usuarioId, permisoId, tx = prisma) {
  return tx.permisoUsuario.upsert({
    where: { usuarioId_permisoId: { usuarioId, permisoId } },
    update: {},
    create: { usuarioId, permisoId }
  });
}

export async function removePermisoFromUser(usuarioId, permisoId, tx = prisma) {
  return tx.permisoUsuario.delete({
    where: { usuarioId_permisoId: { usuarioId, permisoId } }
  });
}

export async function createHistorialPermiso(data, tx = prisma) {
  return tx.historialPermiso.create({ data });
}

export async function findHistorialPermisos({ page, limit, usuarioAfectadoId, rolAfectadoId, operacion }, db = prisma) {
  const where = {
    ...(usuarioAfectadoId ? { usuarioAfectadoId } : {}),
    ...(rolAfectadoId ? { rolAfectadoId } : {}),
    ...(operacion ? { operacion } : {})
  };

  const [items, total] = await Promise.all([
    db.historialPermiso.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        admin: { select: { usuarioId: true, alias: true, email: true } },
        afectado: { select: { usuarioId: true, alias: true, email: true } },
        rol: { select: { rolId: true, nombre: true } },
        permiso: { select: { permisoId: true, nombre: true, recurso: true, accion: true } }
      }
    }),
    db.historialPermiso.count({ where })
  ]);

  return { items, total };
}
