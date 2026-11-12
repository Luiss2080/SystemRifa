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
