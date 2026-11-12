import { prisma } from '../config/prisma.js';

export async function findRifaParaSorteo(rifaId, db = prisma) {
  return db.rifa.findUnique({
    where: { rifaId },
    include: {
      sorteo: true,
      premios: {
        where: { activo: true },
        orderBy: { premioId: 'asc' }
      }
    }
  });
}

export async function findTicketsVendidosByRifa(rifaId, db = prisma) {
  return db.ticket.findMany({
    where: {
      rifaId,
      estado: 'VENDIDO'
    },
    orderBy: { numeroTicket: 'asc' },
    select: {
      ticketId: true,
      numeroTicket: true,
      usuarioId: true
    }
  });
}

export async function countTicketsPendientesOEstado(rifaId, db = prisma) {
  const [disponibles, reservados, vendidos] = await Promise.all([
    db.ticket.count({ where: { rifaId, estado: 'DISPONIBLE' } }),
    db.ticket.count({ where: { rifaId, estado: 'RESERVADO' } }),
    db.ticket.count({ where: { rifaId, estado: 'VENDIDO' } })
  ]);
  return { disponibles, reservados, vendidos };
}

export async function markRifaFinalizadaIfActive(rifaId, tx = prisma) {
  return tx.rifa.updateMany({
    where: {
      rifaId,
      estado: { in: ['ACTIVA', 'EXTENDIDA'] }
    },
    data: {
      estado: 'FINALIZADA'
    }
  });
}

export async function createSorteo({ rifaId, ticketGanadorId, realizadoPorId, observacion }, tx = prisma) {
  return tx.sorteo.create({
    data: {
      rifaId,
      ticketGanadorId,
      realizadoPorId,
      observacion: observacion ?? null
    }
  });
}

export async function assignTicketGanadorAPremio(premioId, ticketGanadorId, tx = prisma) {
  return tx.premio.update({
    where: { premioId },
    data: { ticketGanadorId }
  });
}

export async function releaseUnsoldReservationsOnFinalize(rifaId, tx = prisma) {
  return tx.ticket.updateMany({
    where: {
      rifaId,
      estado: 'RESERVADO',
      pagoId: null
    },
    data: {
      estado: 'DISPONIBLE',
      usuarioId: null,
      reservadoHasta: null
    }
  });
}

export async function findResultadoPublicoRifa(rifaId, db = prisma) {
  return db.rifa.findUnique({
    where: { rifaId },
    select: {
      rifaId: true,
      nombre: true,
      estado: true,
      fechaInicio: true,
      fechaFin: true,
      causa: {
        select: { causaId: true, nombre: true }
      },
      sorteo: {
        select: {
          sorteoId: true,
          fecha: true,
          observacion: true,
          ticketGanador: {
            select: {
              ticketId: true,
              numeroTicket: true,
              usuario: {
                select: {
                  alias: true,
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        }
      },
      premios: {
        where: { activo: true },
        orderBy: { premioId: 'asc' },
        select: {
          premioId: true,
          nombre: true,
          descripcion: true,
          valor: true,
          reclamado: true,
          ticketGanador: {
            select: {
              ticketId: true,
              numeroTicket: true,
              usuario: {
                select: {
                  alias: true,
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        }
      }
    }
  });
}

export async function updateEntregaPremio(premioId, { reclamado, datosEntrega }, tx = prisma) {
  return tx.premio.update({
    where: { premioId },
    data: {
      reclamado,
      ...(datosEntrega !== undefined ? { datosEntrega } : {})
    }
  });
}
