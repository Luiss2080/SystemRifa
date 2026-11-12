import { prisma } from '../config/prisma.js';

export async function findAllCausas(db = prisma) {
  return db.causaSolidaria.findMany({
    orderBy: { causaId: 'asc' },
    include: {
      _count: {
        select: { rifas: true, solicitudes: true }
      }
    }
  });
}

export async function findCausaById(causaId, db = prisma) {
  return db.causaSolidaria.findUnique({
    where: { causaId },
    include: {
      _count: {
        select: { rifas: true, solicitudes: true }
      }
    }
  });
}

export async function createCausa(data, tx = prisma) {
  return tx.causaSolidaria.create({ data });
}

export async function updateCausa(causaId, data, tx = prisma) {
  return tx.causaSolidaria.update({
    where: { causaId },
    data
  });
}

export async function deleteCausa(causaId, tx = prisma) {
  return tx.causaSolidaria.delete({
    where: { causaId }
  });
}
