import { prisma } from '../config/prisma.js';

export async function findPremiosActivosByRifa(rifaId, db = prisma) {
  return db.premio.findMany({
    where: { rifaId, activo: true },
    orderBy: { premioId: 'asc' },
    select: {
      premioId: true,
      rifaId: true,
      nombre: true,
      descripcion: true,
      valor: true,
      activo: true,
      reclamado: true,
      ticketGanadorId: true
    }
  });
}

export async function countPremiosActivosByRifa(rifaId, db = prisma) {
  return db.premio.count({
    where: { rifaId, activo: true }
  });
}

export async function findPremioWithRifaById(premioId, db = prisma) {
  return db.premio.findUnique({
    where: { premioId },
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

export async function createPremio(data, tx = prisma) {
  return tx.premio.create({ data });
}

export async function updatePremio(premioId, data, tx = prisma) {
  return tx.premio.update({
    where: { premioId },
    data
  });
}
