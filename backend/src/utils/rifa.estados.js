import { AppError } from './AppError.js';

export const RIFA_ESTADOS = Object.freeze({
  ACTIVA: 'ACTIVA',
  EXTENDIDA: 'EXTENDIDA',
  FINALIZADA: 'FINALIZADA'
});

export const TICKET_ESTADOS = Object.freeze({
  DISPONIBLE: 'DISPONIBLE',
  RESERVADO: 'RESERVADO',
  VENDIDO: 'VENDIDO',
  ANULADO: 'ANULADO'
});

export function validarPuedeModificarPremiosRifa(rifa) {
  if (rifa.estado === RIFA_ESTADOS.FINALIZADA) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      'No se pueden modificar los premios de una rifa finalizada.'
    );
  }
}

export function validarExtensionRifa(rifa, nuevaFechaFin) {
  if (rifa.estado === RIFA_ESTADOS.FINALIZADA) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      'No se puede extender una rifa que ya está finalizada.'
    );
  }
  if (nuevaFechaFin <= rifa.fechaFin || nuevaFechaFin <= new Date()) {
    throw new AppError(
      409,
      'INVALID_EXTENSION_DATE',
      'La nueva fecha de finalización debe ser mayor a la fecha actual de la rifa y futura.'
    );
  }
}

export function validarRifaParaReserva(rifa, tienePremioActivo, ahora = new Date()) {
  if (rifa.estado !== RIFA_ESTADOS.ACTIVA && rifa.estado !== RIFA_ESTADOS.EXTENDIDA) {
    throw new AppError(
      409,
      'RIFA_NOT_ACTIVE',
      `La rifa no acepta reservas porque su estado es ${rifa.estado}.`
    );
  }
  if (ahora < rifa.fechaInicio || ahora >= rifa.fechaFin) {
    throw new AppError(
      409,
      'RIFA_OUT_OF_DATES',
      'La rifa no se encuentra dentro de sus fechas vigentes de participación.'
    );
  }
  if (!tienePremioActivo) {
    throw new AppError(
      409,
      'RIFA_WITHOUT_PRIZES',
      'La rifa aún no tiene premios activos configurados.'
    );
  }
}

export function validarAnulacionTicket(ticket, rifa) {
  if (rifa.estado === RIFA_ESTADOS.FINALIZADA) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      'No se pueden anular tickets de una rifa finalizada.'
    );
  }
  if (ticket.estado === TICKET_ESTADOS.ANULADO) {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 'El ticket ya se encuentra anulado.');
  }
}
