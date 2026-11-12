import { prisma } from '../config/prisma.js';

export async function findTipoByCodigo(codigo, db = prisma) {
  return db.tipoNotificacion.findUnique({
    where: { codigo }
  });
}

export async function findTipoById(tipoNotificacionId, db = prisma) {
  return db.tipoNotificacion.findUnique({
    where: { tipoNotificacionId }
  });
}

export async function findAllTipos(db = prisma) {
  return db.tipoNotificacion.findMany({
    orderBy: { tipoNotificacionId: 'asc' }
  });
}

export async function updateTipo(tipoNotificacionId, data, db = prisma) {
  return db.tipoNotificacion.update({
    where: { tipoNotificacionId },
    data
  });
}

export async function createNotificacionWithDestinatarios(
  { tipoNotificacionId, destinatarios },
  tx = prisma
) {
  return tx.notificacion.create({
    data: {
      tipoNotificacionId,
      destinatarios: {
        createMany: {
          data: destinatarios.map((d) => ({
            usuarioId: d.usuarioId,
            titulo: d.titulo,
            mensaje: d.mensaje
          }))
        }
      }
    },
    include: {
      destinatarios: true
    }
  });
}

export async function findActiveUserIdsWithPermission(recurso, accion, db = prisma) {
  const usuarios = await db.usuario.findMany({
    where: {
      activo: true,
      OR: [
        {
          roles: {
            some: {
              rol: {
                permisos: {
                  some: {
                    permiso: {
                      recurso,
                      accion,
                      estaActivo: true
                    }
                  }
                }
              }
            }
          }
        },
        {
          permisosDirectos: {
            some: {
              permiso: {
                recurso,
                accion,
                estaActivo: true
              }
            }
          }
        }
      ]
    },
    select: { usuarioId: true }
  });

  return usuarios.map((u) => u.usuarioId);
}

export async function findUserNotifications({ usuarioId, page, limit, noLeidas }, db = prisma) {
  const baseWhere = {
    usuarioId,
    eliminada: false
  };

  const where = {
    ...baseWhere,
    ...(noLeidas ? { leida: false } : {})
  };

  const [items, total, noLeidasCount] = await Promise.all([
    db.notificacionUsuario.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        notificacion: {
          fechaCreacion: 'desc'
        }
      },
      include: {
        notificacion: {
          select: {
            notificacionId: true,
            fechaCreacion: true,
            tipo: {
              select: {
                codigo: true
              }
            }
          }
        }
      }
    }),
    db.notificacionUsuario.count({ where }),
    db.notificacionUsuario.count({ where: { ...baseWhere, leida: false } })
  ]);

  return { items, total, noLeidasCount };
}

export async function markOneAsRead(notificacionId, usuarioId, db = prisma) {
  return db.notificacionUsuario.updateMany({
    where: {
      notificacionId,
      usuarioId,
      eliminada: false
    },
    data: {
      leida: true
    }
  });
}

export async function markAllAsRead(usuarioId, db = prisma) {
  return db.notificacionUsuario.updateMany({
    where: {
      usuarioId,
      eliminada: false,
      leida: false
    },
    data: {
      leida: true
    }
  });
}

export async function softDeleteOne(notificacionId, usuarioId, db = prisma) {
  return db.notificacionUsuario.updateMany({
    where: {
      notificacionId,
      usuarioId,
      eliminada: false
    },
    data: {
      eliminada: true
    }
  });
}
