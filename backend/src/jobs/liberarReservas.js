import cron from 'node-cron';
import { withTransaction } from '../repositories/transaction.js';
import * as ticketRepo from '../repositories/ticket.repository.js';
import * as notificacionService from '../services/notificacion.service.js';

let scheduledTask = null;

/**
 * Libera reservas vencidas que no tienen pago pendiente, limpia usuario/pago/vencimiento
 * y notifica RESERVA_VENCIDA agrupado por usuario y rifa.
 */
export async function liberarReservasVencidas(ahora = new Date()) {
  const vencidos = await ticketRepo.findExpiredReservationsToRelease(ahora);
  if (vencidos.length === 0) {
    return { liberados: 0 };
  }

  const ids = vencidos.map((t) => t.ticketId);

  const result = await withTransaction((tx) =>
    ticketRepo.releaseExpiredTicketsByIds(ids, ahora, tx)
  );

  if (result.count === 0) {
    return { liberados: 0 };
  }

  const grupos = new Map();
  for (const t of vencidos) {
    if (!t.usuarioId) continue;
    const key = `${t.usuarioId}:${t.rifaId}`;
    if (!grupos.has(key)) {
      grupos.set(key, {
        usuarioId: t.usuarioId,
        nombreRifa: t.rifa.nombre,
        numeros: []
      });
    }
    grupos.get(key).numeros.push(t.numeroTicket);
  }

  for (const grupo of grupos.values()) {
    grupo.numeros.sort((a, b) => a - b);
    await notificacionService.notificar('RESERVA_VENCIDA', [grupo.usuarioId], {
      nombreRifa: grupo.nombreRifa,
      numeros: grupo.numeros.join(', ')
    });
  }

  return { liberados: result.count };
}

export function iniciarJobReservas() {
  if (scheduledTask) return scheduledTask;
  scheduledTask = cron.schedule('* * * * *', () => {
    liberarReservasVencidas().catch((err) => {
      console.error('[Job liberarReservas] Error:', err);
    });
  });
  return scheduledTask;
}

export function detenerJobReservas() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
}
