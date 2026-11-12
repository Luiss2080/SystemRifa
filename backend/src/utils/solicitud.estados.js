import { AppError } from './AppError.js';

export const SOLICITUD_ESTADOS = Object.freeze({
  REVISION: 'REVISION',
  ESPERANDO_PAGO: 'ESPERANDO_PAGO',
  PAGO_CONFIRMADO: 'PAGO_CONFIRMADO',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA'
});

const ESTADOS_FINALES = new Set([SOLICITUD_ESTADOS.APROBADA, SOLICITUD_ESTADOS.RECHAZADA]);

/**
 * Valida una transición de estado de RifaSolicitada según la Sección 4 de la guía.
 * Lanza AppError 409 si la transición no está permitida.
 * @param {{
 *   estadoActual: string,
 *   nuevoEstado: string,
 *   tarifaPublicacion: number,
 *   referenciaPago?: string | null,
 *   observacion?: string | null
 * }} params
 */
export function validarTransicionSolicitud({
  estadoActual,
  nuevoEstado,
  tarifaPublicacion,
  referenciaPago,
  observacion
}) {
  if (ESTADOS_FINALES.has(estadoActual)) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      `La solicitud ya se encuentra en estado final (${estadoActual}) y no admite cambios.`
    );
  }

  if (nuevoEstado === SOLICITUD_ESTADOS.RECHAZADA) {
    if (!observacion || observacion.trim().length === 0) {
      throw new AppError(
        400,
        'OBSERVACION_REQUIRED',
        'Debe indicar una observación obligatoria al rechazar la solicitud.'
      );
    }
    return { esFinal: true };
  }

  if (
    estadoActual === SOLICITUD_ESTADOS.REVISION &&
    nuevoEstado === SOLICITUD_ESTADOS.ESPERANDO_PAGO
  ) {
    if (!(tarifaPublicacion > 0)) {
      throw new AppError(
        409,
        'INVALID_STATE_TRANSITION',
        'La transición a ESPERANDO_PAGO solo aplica cuando TARIFA_PUBLICACION es mayor a 0.'
      );
    }
    return { esFinal: false };
  }

  if (
    estadoActual === SOLICITUD_ESTADOS.REVISION &&
    nuevoEstado === SOLICITUD_ESTADOS.PAGO_CONFIRMADO
  ) {
    if (tarifaPublicacion > 0) {
      throw new AppError(
        409,
        'INVALID_STATE_TRANSITION',
        'Con tarifa de publicación mayor a 0 debe pasar primero a ESPERANDO_PAGO.'
      );
    }
    return { esFinal: false };
  }

  if (
    estadoActual === SOLICITUD_ESTADOS.ESPERANDO_PAGO &&
    nuevoEstado === SOLICITUD_ESTADOS.PAGO_CONFIRMADO
  ) {
    if (!referenciaPago || referenciaPago.trim().length === 0) {
      throw new AppError(
        400,
        'REFERENCIA_REQUIRED',
        'Debe registrar la referenciaPago para confirmar el pago de publicación.'
      );
    }
    return { esFinal: false };
  }

  throw new AppError(
    409,
    'INVALID_STATE_TRANSITION',
    `Transición no permitida de ${estadoActual} a ${nuevoEstado}.`
  );
}

/**
 * Valida la transición hacia APROBADA para POST /solicitudes/:id/aprobar.
 * @param {string} estadoActual
 */
export function validarAprobacionSolicitud(estadoActual) {
  if (estadoActual !== SOLICITUD_ESTADOS.PAGO_CONFIRMADO) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      `Solo se puede aprobar una solicitud en estado PAGO_CONFIRMADO (estado actual: ${estadoActual}).`
    );
  }
}

