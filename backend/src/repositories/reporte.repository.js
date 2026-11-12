import { prisma } from '../config/prisma.js';

export async function findRifaReporteBase(rifaId, db = prisma) {
  return db.rifa.findUnique({
    where: { rifaId },
    select: {
      rifaId: true,
      usuarioCreadorId: true,
      nombre: true,
      estado: true,
      precioTicket: true,
      cantidadTickets: true,
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

export async function getTicketsEstadoGroupByRifa(rifaId, db = prisma) {
  return db.ticket.groupBy({
    by: ['estado'],
    where: { rifaId },
    _count: { _all: true }
  });
}

export async function getPagosAggregateByRifa(rifaId, db = prisma) {
  return db.pago.groupBy({
    by: ['estado'],
    where: {
      rifaId,
      estado: { in: ['CONFIRMADO', 'PENDIENTE'] }
    },
    _sum: { monto: true },
    _count: { _all: true }
  });
}

export async function getReporteCausasData(db = prisma) {
  const [causas, pagosConfirmadosPorRifa, rifasPorCausa] = await Promise.all([
    db.causaSolidaria.findMany({
      orderBy: { causaId: 'asc' },
      select: {
        causaId: true,
        nombre: true,
        descripcion: true,
        meta: true
      }
    }),
    db.pago.groupBy({
      by: ['rifaId'],
      where: { estado: 'CONFIRMADO' },
      _sum: { monto: true }
    }),
    db.rifa.findMany({
      where: { causaId: { not: null } },
      select: { rifaId: true, causaId: true }
    })
  ]);

  return { causas, pagosConfirmadosPorRifa, rifasPorCausa };
}

export async function getResumenGlobalData(db = prisma) {
  const [rifasPorEstado, usuariosTotales, usuariosActivos, ticketsVendidos, pagosPorEstado] =
    await Promise.all([
      db.rifa.groupBy({
        by: ['estado'],
        _count: { _all: true }
      }),
      db.usuario.count(),
      db.usuario.count({ where: { activo: true } }),
      db.ticket.count({ where: { estado: 'VENDIDO' } }),
      db.pago.groupBy({
        by: ['estado'],
        where: { estado: { in: ['CONFIRMADO', 'PENDIENTE'] } },
        _sum: { monto: true }
      })
    ]);

  return {
    rifasPorEstado,
    usuariosTotales,
    usuariosActivos,
    ticketsVendidos,
    pagosPorEstado
  };
}

