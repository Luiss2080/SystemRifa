import { prisma } from '../config/prisma.js';

const PAGO_INCLUDE = {
  rifa: {
    select: {
      rifaId: true,
      nombre: true,
      precioTicket: true,
      estado: true
    }
  },
  usuario: {
    select: {
      usuarioId: true,
      alias: true,
      nombres: true,
      apellidos: true
    }
  },
  verificador: {
    select: {
      usuarioId: true,
      alias: true
    }
  },
  tickets: {
    orderBy: { numeroTicket: 'asc' },
    select: {
      ticketId: true,
      numeroTicket: true,
      estado: true
    }
  }
};

export async function createPago(data, tx = prisma) {
  return tx.pago.create({ data });
}

export async function linkReservedTicketsToPago(
  { pagoId, rifaId, ticketIds, usuarioId, ahora },
  tx = prisma
) {
  return tx.ticket.updateMany({
    where: {
      ticketId: { in: ticketIds },
      rifaId,
      usuarioId,
      estado: 'RESERVADO',
      pagoId: null,
      reservadoHasta: { gt: ahora }
    },
    data: {
      pagoId
    }
  });
}

export async function findPagoById(pagoId, db = prisma) {
  return db.pago.findUnique({
    where: { pagoId },
    include: PAGO_INCLUDE
  });
}

export async function findPagosPaginated({ page, limit, estado, rifaId, usuarioId }, db = prisma) {
  const where = {
    ...(estado ? { estado } : {}),
    ...(rifaId ? { rifaId } : {}),
    ...(usuarioId ? { usuarioId } : {})
  };

  const [items, total] = await Promise.all([
    db.pago.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fecha: 'desc' },
      include: PAGO_INCLUDE
    }),
    db.pago.count({ where })
  ]);

  return { items, total };
}

export async function updatePagoEstadoIfPendiente(
  pagoId,
  { estado, verificadoPorId },
  tx = prisma
) {
  return tx.pago.updateMany({
    where: {
      pagoId,
      estado: 'PENDIENTE'
    },
    data: {
      estado,
      verificadoPorId
    }
  });
}

export async function markTicketsVendidosByPago(pagoId, tx = prisma) {
  return tx.ticket.updateMany({
    where: { pagoId },
    data: {
      estado: 'VENDIDO',
      reservadoHasta: null
    }
  });
}

export async function releaseTicketsByPago(pagoId, tx = prisma) {
  return tx.ticket.updateMany({
    where: { pagoId },
    data: {
      estado: 'DISPONIBLE',
      usuarioId: null,
      pagoId: null,
      reservadoHasta: null
    }
  });
}

