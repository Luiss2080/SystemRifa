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

