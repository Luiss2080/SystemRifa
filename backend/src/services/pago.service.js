import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { PAGO_ESTADOS, validarVerificacionPago } from '../utils/pago.estados.js';
import { withTransaction } from '../repositories/transaction.js';
import * as rifaRepo from '../repositories/rifa.repository.js';
import * as pagoRepo from '../repositories/pago.repository.js';
import * as auditoriaService from './auditoria.service.js';
import * as notificacionService from './notificacion.service.js';

function formatPago(p) {
  return {
    pagoId: p.pagoId,
    rifaId: p.rifaId,
    usuarioId: p.usuarioId,
    verificadoPorId: p.verificadoPorId,
    monto: formatDecimal(p.monto),
    metodo: p.metodo,
    referencia: p.referencia,
    estado: p.estado,
    fecha: p.fecha,
    rifa: p.rifa
      ? {
          ...p.rifa,
          precioTicket: formatDecimal(p.rifa.precioTicket)
        }
      : undefined,
    usuario: p.usuario ?? undefined,
    verificador: p.verificador ?? undefined,
    tickets: p.tickets ?? undefined
  };
}

export async function registrarPago(usuario, { rifaId, ticketIds, metodo, referencia }) {
  const rifa = await rifaRepo.findRifaById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  if (rifa.estado === 'FINALIZADA') {
    throw new AppError(409, 'RIFA_FINALIZADA', 'No se pueden registrar pagos para una rifa finalizada.');
  }

  const centavosPorTicket = Math.round(Number(rifa.precioTicket) * 100);
  const monto = ((centavosPorTicket * ticketIds.length) / 100).toFixed(2);
  const ahora = new Date();

  const pagoCreado = await withTransaction(async (tx) => {
    const pago = await pagoRepo.createPago(
      {
        rifaId,
        usuarioId: usuario.usuarioId,
        monto,
        metodo,
        referencia: referencia ?? null,
        estado: PAGO_ESTADOS.PENDIENTE
      },
      tx
    );

    const linked = await pagoRepo.linkReservedTicketsToPago(
      {
        pagoId: pago.pagoId,
        rifaId,
        ticketIds,
        usuarioId: usuario.usuarioId,
        ahora
      },
      tx
    );

    if (linked.count !== ticketIds.length) {
      throw new AppError(
        409,
        'INVALID_RESERVED_TICKETS',
        'Uno o más tickets no están reservados por ti, ya expiraron o pertenecen a otro pago.'
      );
    }

    return pagoRepo.findPagoById(pago.pagoId, tx);
  });

  await notificacionService.notificarConPermiso('NUEVO_PAGO', 'pagos:verificar', {
    alias: usuario.alias,
    monto,
    nombreRifa: rifa.nombre
  });

  return { pago: formatPago(pagoCreado) };
}

export async function listarMisPagos(usuarioId, { page, limit, estado, rifaId }) {
  const { items, total } = await pagoRepo.findPagosPaginated({
    page,
    limit,
    estado,
    rifaId,
    usuarioId
  });

  return {
    items: items.map(formatPago),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function listarPagosAdmin({ page, limit, estado, rifaId }) {
  const { items, total } = await pagoRepo.findPagosPaginated({
    page,
    limit,
    estado,
    rifaId
  });

  return {
    items: items.map(formatPago),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function verificarPago(adminId, pagoId, { aprobado, motivo }) {
  const pago = await pagoRepo.findPagoById(pagoId);
  if (!pago) {
    throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Pago no encontrado.');
  }

  validarVerificacionPago({
    estadoActual: pago.estado,
    aprobado,
    motivo
  });

  const nuevoEstado = aprobado ? PAGO_ESTADOS.CONFIRMADO : PAGO_ESTADOS.RECHAZADO;
  const numeros = pago.tickets.map((t) => t.numeroTicket);

  const pagoActualizado = await withTransaction(async (tx) => {
    const updated = await pagoRepo.updatePagoEstadoIfPendiente(
      pagoId,
      {
        estado: nuevoEstado,
        verificadoPorId: adminId
      },
      tx
    );

    if (updated.count !== 1) {
      throw new AppError(409, 'INVALID_STATE_TRANSITION', 'El pago ya fue verificado previamente.');
    }

    if (aprobado) {
      await pagoRepo.markTicketsVendidosByPago(pagoId, tx);
    } else {
      await pagoRepo.releaseTicketsByPago(pagoId, tx);
    }

    await auditoriaService.registrar(tx, {
      usuarioId: adminId,
      entidad: 'pago',
      entidadId: pagoId,
      accion: aprobado ? 'CONFIRMAR_PAGO' : 'RECHAZAR_PAGO',
      detalle: {
        rifaId: pago.rifaId,
        monto: formatDecimal(pago.monto),
        numeros,
        ...(motivo ? { motivo } : {})
      }
    });

    return pagoRepo.findPagoById(pagoId, tx);
  });

  if (aprobado) {
    await notificacionService.notificar('PAGO_CONFIRMADO', [pago.usuarioId], {
      nombreRifa: pago.rifa.nombre,
      numeros: numeros.join(', '),
      monto: formatDecimal(pago.monto)
    });
  } else {
    await notificacionService.notificar('PAGO_RECHAZADO', [pago.usuarioId], {
      nombreRifa: pago.rifa.nombre,
      motivo: motivo ?? ''
    });
  }

  return { pago: formatPago(pagoActualizado) };
}
