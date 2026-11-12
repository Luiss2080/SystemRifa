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
