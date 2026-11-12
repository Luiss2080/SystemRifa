import { prisma } from '../config/prisma.js';

const USER_PUBLIC_SELECT = {
  usuarioId: true,
  alias: true,
  email: true,
  telefono: true,
  nombres: true,
  apellidos: true,
  activo: true,
  creadoEn: true
};

export function formatPublicUser(user) {
  return {
    usuarioId: user.usuarioId,
    alias: user.alias,
    email: user.email,
    telefono: user.telefono,
    nombres: user.nombres,
    apellidos: user.apellidos,
    activo: user.activo,
    creadoEn: user.creadoEn
  };
}

export async function findByEmailForLogin(email, db = prisma) {
  return db.usuario.findUnique({
    where: { email },
    select: {
      ...USER_PUBLIC_SELECT,
      passwordHash: true,
      roles: {
        select: {
          rol: {
            select: {
              rolId: true,
              nombre: true
            }
          }
        }
      }
    }
  });
}

export async function findAuthSnapshotById(usuarioId, db = prisma) {
  return db.usuario.findUnique({
    where: { usuarioId },
    select: {
      usuarioId: true,
      alias: true,
      email: true,
      activo: true,
      roles: {
        select: {
          rol: {
            select: {
              rolId: true,
              nombre: true
            }
          }
        }
      }
    }
  });
}

export async function findProfileWithPermissionsById(usuarioId, db = prisma) {
  return db.usuario.findUnique({
    where: { usuarioId },
    select: {
      ...USER_PUBLIC_SELECT,
      roles: {
        select: {
          rol: {
            select: {
              rolId: true,
              nombre: true,
              permisos: {
                select: {
                  permiso: {
                    select: {
                      recurso: true,
                      accion: true,
                      estaActivo: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      permisosDirectos: {
        select: {
          permiso: {
            select: {
              recurso: true,
              accion: true,
              estaActivo: true
            }
          }
        }
      }
    }
  });
}

export async function findPasswordHashById(usuarioId, db = prisma) {
  return db.usuario.findUnique({
    where: { usuarioId },
    select: {
      usuarioId: true,
      passwordHash: true,
      activo: true
    }
  });
}

export async function findConflicts({ alias, email, telefono, excludeUsuarioId }, db = prisma) {
  const orConditions = [];
  if (alias !== undefined) orConditions.push({ alias });
  if (email !== undefined) orConditions.push({ email });
  if (telefono !== undefined && telefono !== null) orConditions.push({ telefono });

  if (orConditions.length === 0) {
    return [];
  }

  return db.usuario.findMany({
    where: {
      OR: orConditions,
      ...(excludeUsuarioId ? { usuarioId: { not: excludeUsuarioId } } : {})
    },
    select: {
      usuarioId: true,
      alias: true,
      email: true,
      telefono: true
    }
  });
}

export async function createWithRole({ data, rolNombre }, tx = prisma) {
  const rol = await tx.rol.findUnique({
    where: { nombre: rolNombre },
    select: { rolId: true, nombre: true }
  });

  if (!rol) {
    throw new Error(`El rol requerido "${rolNombre}" no existe en la base de datos.`);
  }

  const usuario = await tx.usuario.create({
    data: {
      ...data,
      roles: {
        create: {
          rolId: rol.rolId
        }
      }
    },
    select: {
      ...USER_PUBLIC_SELECT,
      roles: {
        select: {
          rol: {
            select: {
              rolId: true,
              nombre: true
            }
          }
        }
      }
    }
  });

  return usuario;
}

export async function updateById(usuarioId, data, tx = prisma) {
  return tx.usuario.update({
    where: { usuarioId },
    data,
    select: USER_PUBLIC_SELECT
  });
}

export async function updatePasswordHash(usuarioId, passwordHash, tx = prisma) {
  return tx.usuario.update({
    where: { usuarioId },
    data: { passwordHash },
    select: { usuarioId: true }
  });
}
