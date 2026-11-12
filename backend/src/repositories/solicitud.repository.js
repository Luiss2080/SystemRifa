import { prisma } from '../config/prisma.js';

const SOLICITUD_INCLUDE = {
  usuario: {
    select: { usuarioId: true, alias: true, nombres: true, apellidos: true }
  },
  revisor: {
    select: { usuarioId: true, alias: true }
  },
  causa: {
    select: { causaId: true, nombre: true }
  },
  rifa: {
    select: { rifaId: true, estado: true }
  }
};

export async function createSolicitud(data, tx = prisma) {
  return tx.rifaSolicitada.create({
    data,
    include: SOLICITUD_INCLUDE
  });
}

export async function findSolicitudById(rifaSolicitadaId, db = prisma) {
  return db.rifaSolicitada.findUnique({
    where: { rifaSolicitadaId },
    include: SOLICITUD_INCLUDE
  });
}

export async function findSolicitudesPaginated({ page, limit, estado, usuarioId }, db = prisma) {
  const where = {
    ...(estado ? { estado } : {}),
    ...(usuarioId ? { usuarioId } : {})
  };

  const [items, total] = await Promise.all([
    db.rifaSolicitada.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fechaSolicitud: 'desc' },
      include: SOLICITUD_INCLUDE
    }),
    db.rifaSolicitada.count({ where })
  ]);

  return { items, total };
}

export async function updateSolicitudEstado(rifaSolicitadaId, data, tx = prisma) {
  return tx.rifaSolicitada.update({
    where: { rifaSolicitadaId },
    data,
    include: SOLICITUD_INCLUDE
  });
}

export async function markSolicitudAprobadaIfPagoConfirmado(
  rifaSolicitadaId,
  { revisadoPorId, observacion, fechaResolucion },
  tx = prisma
) {
  return tx.rifaSolicitada.updateMany({
    where: {
      rifaSolicitadaId,
      estado: 'PAGO_CONFIRMADO'
    },
    data: {
      estado: 'APROBADA',
      revisadoPorId,
      fechaResolucion,
      ...(observacion !== undefined ? { observacion } : {})
    }
  });
}
