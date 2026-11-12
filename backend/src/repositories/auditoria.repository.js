import { prisma } from '../config/prisma.js';

export async function createAuditoria(tx, { usuarioId = null, entidad, entidadId, accion, detalle = null }) {
  const client = tx || prisma;
  return client.auditoria.create({
    data: {
      usuarioId,
      entidad,
      entidadId,
      accion,
      detalle
    }
  });
}

export async function findAuditoriaPaginated(
  { page, limit, entidad, accion, usuarioId, desde, hasta },
  db = prisma
) {
  const where = {
    ...(entidad ? { entidad } : {}),
    ...(accion ? { accion } : {}),
    ...(usuarioId ? { usuarioId } : {}),
    ...(desde || hasta
      ? {
          fecha: {
            ...(desde ? { gte: desde } : {}),
            ...(hasta ? { lte: hasta } : {})
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    db.auditoria.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            usuarioId: true,
            alias: true,
            email: true
          }
        }
      }
    }),
    db.auditoria.count({ where })
  ]);

  return { items, total };
}

