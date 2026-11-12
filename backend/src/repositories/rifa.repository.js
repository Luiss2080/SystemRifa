import { prisma } from '../config/prisma.js';

export async function findRifaOwnershipById(rifaId, db = prisma) {
  return db.rifa.findUnique({
    where: { rifaId },
    select: {
      rifaId: true,
      usuarioCreadorId: true,
      estado: true
    }
  });
}

export async function findRifaById(rifaId, db = prisma) {
  return db.rifa.findUnique({
    where: { rifaId },
    include: {
      causa: {
        select: { causaId: true, nombre: true, descripcion: true, meta: true }
      },
      premios: {
        where: { activo: true },
        orderBy: { premioId: 'asc' },
        select: {
          premioId: true,
          nombre: true,
          descripcion: true,
          valor: true,
          activo: true,
          reclamado: true,
          ticketGanadorId: true
        }
      }
    }
  });
}

export async function createRifa(data, tx = prisma) {
  return tx.rifa.create({ data });
}

export async function createTicketsForRifa(rifaId, cantidadTickets, tx = prisma) {
  const BATCH_SIZE = 2000;
  for (let start = 1; start <= cantidadTickets; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, cantidadTickets);
    const batch = [];
    for (let numeroTicket = start; numeroTicket <= end; numeroTicket++) {
      batch.push({
        rifaId,
        numeroTicket,
        estado: 'DISPONIBLE'
      });
    }
    await tx.ticket.createMany({ data: batch });
  }
}

export async function findCatalogoPublico({ page, limit, causaId, ahora }, db = prisma) {
  const where = {
    estado: { in: ['ACTIVA', 'EXTENDIDA'] },
    fechaInicio: { lte: ahora },
    fechaFin: { gt: ahora },
    premios: { some: { activo: true } },
    ...(causaId ? { causaId } : {})
  };

  const [items, total] = await Promise.all([
    db.rifa.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fechaFin: 'asc' },
      include: {
        causa: { select: { causaId: true, nombre: true } },
        premios: {
          where: { activo: true },
          orderBy: { premioId: 'asc' },
          select: { premioId: true, nombre: true, valor: true }
        }
      }
    }),
    db.rifa.count({ where })
  ]);

  if (items.length === 0) {
    return { items: [], total, disponiblesMap: new Map() };
  }

  const rifaIds = items.map((r) => r.rifaId);
  const grouped = await db.ticket.groupBy({
    by: ['rifaId'],
    where: {
      rifaId: { in: rifaIds },
      estado: 'DISPONIBLE'
    },
    _count: { _all: true }
  });

  const disponiblesMap = new Map(grouped.map((g) => [g.rifaId, g._count._all]));
  return { items, total, disponiblesMap };
}

export async function findMisRifas({ usuarioCreadorId, page, limit, estado }, db = prisma) {
  const where = {
    usuarioCreadorId,
    ...(estado ? { estado } : {})
  };

  const [items, total] = await Promise.all([
    db.rifa.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rifaId: 'desc' },
      include: {
        causa: { select: { causaId: true, nombre: true } },
        _count: {
          select: {
            premios: { where: { activo: true } }
          }
        }
      }
    }),
    db.rifa.count({ where })
  ]);

  if (items.length === 0) {
    return { items: [], total, countsByRifa: new Map() };
  }

  const rifaIds = items.map((r) => r.rifaId);
  const grouped = await db.ticket.groupBy({
    by: ['rifaId', 'estado'],
    where: { rifaId: { in: rifaIds } },
    _count: { _all: true }
  });

  const countsByRifa = new Map();
  for (const row of grouped) {
    if (!countsByRifa.has(row.rifaId)) {
      countsByRifa.set(row.rifaId, {
        DISPONIBLE: 0,
        RESERVADO: 0,
        VENDIDO: 0,
        ANULADO: 0
      });
    }
    countsByRifa.get(row.rifaId)[row.estado] = row._count._all;
  }

  return { items, total, countsByRifa };
}

export async function getTicketCountsByEstado(rifaId, db = prisma) {
  const grouped = await db.ticket.groupBy({
    by: ['estado'],
    where: { rifaId },
    _count: { _all: true }
  });

  const counts = {
    DISPONIBLE: 0,
    RESERVADO: 0,
    VENDIDO: 0,
    ANULADO: 0
  };
  for (const row of grouped) {
    counts[row.estado] = row._count._all;
  }
  return counts;
}

export async function extendRifa(rifaId, fechaFin, tx = prisma) {
  return tx.rifa.update({
    where: { rifaId },
    data: {
      fechaFin,
      estado: 'EXTENDIDA'
    }
  });
}
