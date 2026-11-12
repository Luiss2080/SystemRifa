import { prisma } from '../config/prisma.js';

/**
 * Ejecuta una operación atómica pasando el cliente transaccional `tx` a los repositorios.
 * @template T
 * @param {(tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function withTransaction(fn) {
  return prisma.$transaction((tx) => fn(tx));
}

