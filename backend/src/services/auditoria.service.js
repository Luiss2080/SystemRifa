import { createAuditoria } from '../repositories/auditoria.repository.js';

/**
 * Registra un evento de auditoría dentro de la transacción activa.
 * @param {import('@prisma/client').Prisma.TransactionClient | null} tx
 * @param {{ usuarioId?: number | null, entidad: string, entidadId: number, accion: string, detalle?: unknown }} payload
 */
export async function registrar(tx, payload) {
  return createAuditoria(tx, payload);
}

