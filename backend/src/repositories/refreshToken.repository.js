import { prisma } from '../config/prisma.js';

export async function create({ usuarioId, tokenHash, expiraEn }, tx = prisma) {
  return tx.refreshToken.create({
    data: {
      usuarioId,
      tokenHash,
      expiraEn
    }
  });
}

export async function findByTokenHashWithUser(tokenHash, db = prisma) {
  return db.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      usuario: {
        select: {
          usuarioId: true,
          alias: true,
          email: true,
          activo: true,
          roles: {
            select: {
              rol: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      }
    }
  });
}

export async function revokeIfActive(refreshTokenId, tx = prisma) {
  return tx.refreshToken.updateMany({
    where: {
      refreshTokenId,
      revocado: false
    },
    data: {
      revocado: true
    }
  });
}

export async function revokeAllForUser(usuarioId, tx = prisma) {
  return tx.refreshToken.updateMany({
    where: {
      usuarioId,
      revocado: false
    },
    data: {
      revocado: true
    }
  });
}

export async function revokeByTokenHashAndUser(tokenHash, usuarioId, tx = prisma) {
  return tx.refreshToken.updateMany({
    where: {
      tokenHash,
      usuarioId,
      revocado: false
    },
    data: {
      revocado: true
    }
  });
}

