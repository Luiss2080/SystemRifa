import { CONSTANTES } from '../config/constantes.js';
import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { validarAnulacionTicket, validarRifaParaReserva } from '../utils/rifa.estados.js';
import { assertPropietarioORAdmin } from '../middlewares/authorize.js';
import { withTransaction } from '../repositories/transaction.js';
import * as rifaRepo from '../repositories/rifa.repository.js';
import * as premioRepo from '../repositories/premio.repository.js';
import * as ticketRepo from '../repositories/ticket.repository.js';
import * as auditoriaService from './auditoria.service.js';
import * as notificacionService from './notificacion.service.js';

export async function obtenerMapaTicketsPublico(rifaId) {
  const rifa = await rifaRepo.findRifaOwnershipById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  const items = await ticketRepo.findPublicTicketsByRifa(rifaId);
  return { rifaId, items };
}

export async function reservarTickets(usuarioId, rifaId, numeros) {
  const [rifa, premiosActivosCount] = await Promise.all([
    rifaRepo.findRifaById(rifaId),
    premioRepo.countPremiosActivosByRifa(rifaId)
  ]);

  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  validarRifaParaReserva(rifa, premiosActivosCount > 0, new Date());

  const reservadoHasta = new Date(Date.now() + CONSTANTES.RESERVA_MINUTOS * 60 * 1000);

  await withTransaction(async (tx) => {
    const result = await ticketRepo.reservarDisponiblesCondicional(
      { rifaId, numeros, usuarioId, reservadoHasta },
      tx
    );

    if (result.count !== numeros.length) {
      const encontrados = await ticketRepo.findNumerosEstado(rifaId, numeros, tx);
      const mapEstados = new Map(encontrados.map((t) => [t.numeroTicket, t.estado]));
      const noDisponibles = numeros.filter((n) => mapEstados.get(n) !== 'DISPONIBLE');

      throw new AppError(
        409,
        'TICKETS_UNAVAILABLE',
        `Los siguientes números no están disponibles: ${noDisponibles.join(', ')}.`,
        { noDisponibles }
      );
    }
  });

  await notificacionService.notificar('TICKET_RESERVADO', [usuarioId], {
    nombreRifa: rifa.nombre,
    numeros: numeros.join(', '),
    minutos: CONSTANTES.RESERVA_MINUTOS
  });

  const centavosPorTicket = Math.round(Number(rifa.precioTicket) * 100);
  const montoTotal = ((centavosPorTicket * numeros.length) / 100).toFixed(2);

  return {
    rifaId,
    numeros,
    reservadoHasta,
    montoTotal
  };
}

export async function liberarReservas(usuarioId, rifaId, numeros) {
  const rifa = await rifaRepo.findRifaOwnershipById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  const result = await ticketRepo.liberarReservasPropias({
    rifaId,
    usuarioId,
    numeros
  });

  return {
    message: 'Reservas liberadas correctamente.',
    liberados: result.count
  };
}

export async function listarMisTickets(usuarioId) {
  const items = await ticketRepo.findMyTickets(usuarioId);
  return {
    items: items.map((t) => ({
      ticketId: t.ticketId,
      rifaId: t.rifaId,
      numeroTicket: t.numeroTicket,
      estado: t.estado,
      reservadoHasta: t.reservadoHasta,
      pagoId: t.pagoId,
      rifa: {
        ...t.rifa,
        precioTicket: formatDecimal(t.rifa.precioTicket)
      },
      pago: t.pago
        ? {
            ...t.pago,
            monto: formatDecimal(t.pago.monto)
          }
        : null
    }))
  };
}

export async function anularTicket(usuario, ticketId, motivo) {
  const ticket = await ticketRepo.findTicketWithRifaById(ticketId);
  if (!ticket) {
    throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket no encontrado.');
  }

  assertPropietarioORAdmin(usuario, ticket.rifa);
  validarAnulacionTicket(ticket, ticket.rifa);

  const anulado = await withTransaction(async (tx) => {
    const updated = await ticketRepo.anularTicketById(ticketId, tx);
    await auditoriaService.registrar(tx, {
      usuarioId: usuario.usuarioId,
      entidad: 'ticket',
      entidadId: ticketId,
      accion: 'ANULAR_TICKET',
      detalle: {
        rifaId: ticket.rifaId,
        numeroTicket: ticket.numeroTicket,
        estadoAnterior: ticket.estado,
        motivo
      }
    });
    return updated;
  });

  return {
    ticket: {
      ticketId: anulado.ticketId,
      rifaId: anulado.rifaId,
      numeroTicket: anulado.numeroTicket,
      estado: anulado.estado
    }
  };
}
