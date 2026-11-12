import { AppError } from './AppError.js';

export const PAGO_ESTADOS = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  RECHAZADO: 'RECHAZADO'
});

export function validarVerificacionPago({ estadoActual, aprobado, motivo }) {
  if (estadoActual !== PAGO_ESTADOS.PENDIENTE) {
    throw new AppError(
      409,
      'INVALID_STATE_TRANSITION',
      `El pago ya fue procesado (estado actual: ${estadoActual}).`
    );
  }

  if (!aprobado && (!motivo || motivo.trim().length === 0)) {
    throw new AppError(
      400,
      'MOTIVO_REQUIRED',
      'Debe indicar un motivo obligatorio al rechazar un pago.'
    );
  }
}
