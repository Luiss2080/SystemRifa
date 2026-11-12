import { prisma } from '../config/prisma.js';

export async function findPublicTicketsByRifa(rifaId, db = prisma) {
  return db.ticket.findMany({
    where: { rifaId },
    orderBy: { numeroTicket: 'asc' },
    select: {
      ticketId: true,
      numeroTicket: true,
      estado: true
    }
  });
}

export async function findNumerosEstado(rifaId, numeros, db = prisma) {
  return db.ticket.findMany({
    where: {
      rifaId,
      numeroTicket: { in: numeros }
    },
    select: {
      numeroTicket: true,
      estado: true
    }
  });
}

export async function reservarDisponiblesCondicional(
  { rifaId, numeros, usuarioId, reservadoHasta },
  tx = prisma
) {
  return tx.ticket.updateMany({
    where: {
      rifaId,
      numeroTicket: { in: numeros },
      estado: 'DISPONIBLE'
    },
    data: {
      estado: 'RESERVADO',
      usuarioId,
      reservadoHasta
    }
  });
}

export async function liberarReservasPropias({ rifaId, usuarioId, numeros }, tx = prisma) {
  return tx.ticket.updateMany({
    where: {
      rifaId,
      usuarioId,
      estado: 'RESERVADO',
      pagoId: null,
      ...(numeros ? { numeroTicket: { in: numeros } } : {})
    },
    data: {
      estado: 'DISPONIBLE',
      usuarioId: null,
      pagoId: null,
      reservadoHasta: null
    }
  });
}

export async function findMyTickets(usuarioId, db = prisma) {
  return db.ticket.findMany({
    where: { usuarioId },
    orderBy: [{ rifaId: 'desc' }, { numeroTicket: 'asc' }],
    select: {
      ticketId: true,
      rifaId: true,
      numeroTicket: true,
      estado: true,
      reservadoHasta: true,
      pagoId: true,
      rifa: {
        select: {
          rifaId: true,
          nombre: true,
          precioTicket: true,
          estado: true,
          fechaFin: true
        }
      },
      pago: {
        select: {
          pagoId: true,
          estado: true,
          monto: true,
          metodo: true,
          fecha: true
        }
      }
    }
  });
}

export async function findTicketWithRifaById(ticketId, db = prisma) {
  return db.ticket.findUnique({
    where: { ticketId },
    include: {
      rifa: {
        select: {
          rifaId: true,
          usuarioCreadorId: true,
          estado: true
        }
      }
    }
  });
}

export async function anularTicketById(ticketId, tx = prisma) {
  return tx.ticket.update({
    where: { ticketId },
    data: {
      estado: 'ANULADO',
      reservadoHasta: null
    }
  });
}

export async function findExpiredReservationsToRelease(ahora, db = prisma) {
  return db.ticket.findMany({
    where: {
      estado: 'RESERVADO',
      reservadoHasta: { lt: ahora },
      OR: [
        { pagoId: null },
        {
          pago: {
            estado: { not: 'PENDIENTE' }
          }
        }
      ]
    },
    select: {
      ticketId: true,
      rifaId: true,
      usuarioId: true,
      numeroTicket: true,
      rifa: {
        select: {
          nombre: true
        }
      }
    }
  });
}

export async function releaseExpiredTicketsByIds(ticketIds, ahora, tx = prisma) {
  if (ticketIds.length === 0) return { count: 0 };

  return tx.ticket.updateMany({
    where: {
      ticketId: { in: ticketIds },
      estado: 'RESERVADO',
      reservadoHasta: { lt: ahora },
      OR: [
        { pagoId: null },
        {
          pago: {
            estado: { not: 'PENDIENTE' }
          }
        }
      ]
    },
    data: {
      estado: 'DISPONIBLE',
      usuarioId: null,
      pagoId: null,
      reservadoHasta: null
    }
  });
}
