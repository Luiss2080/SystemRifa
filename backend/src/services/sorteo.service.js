import crypto from 'node:crypto';
import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { RIFA_ESTADOS } from '../utils/rifa.estados.js';
import { assertPropietarioORAdmin, esAdmin } from '../middlewares/authorize.js';
import { withTransaction } from '../repositories/transaction.js';
import * as sorteoRepo from '../repositories/sorteo.repository.js';
import * as premioRepo from '../repositories/premio.repository.js';
import * as auditoriaService from './auditoria.service.js';
import * as notificacionService from './notificacion.service.js';

function obtenerIniciales(nombres = '', apellidos = '') {
  const partes = `${nombres} ${apellidos}`.trim().split(/\s+/).filter(Boolean);
  return partes.map((p) => `${p[0].toUpperCase()}.`).join(' ');
}

function formatGanadorPublico(usuario) {
  if (!usuario) return null;
  return {
    alias: usuario.alias,
    iniciales: obtenerIniciales(usuario.nombres, usuario.apellidos)
  };
}

export async function realizarSorteo(usuario, rifaId, { forzar = false, observacion = null } = {}) {
  const rifa = await sorteoRepo.findRifaParaSorteo(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  assertPropietarioORAdmin(usuario, rifa);

  if (rifa.estado === RIFA_ESTADOS.FINALIZADA || rifa.sorteo) {
    throw new AppError(
      409,
      'RAFFLE_ALREADY_DRAWN',
      'La rifa ya fue finalizada o ya cuenta con un sorteo registrado.'
    );
  }

  if (rifa.premios.length === 0) {
    throw new AppError(
      409,
      'RIFA_WITHOUT_PRIZES',
      'La rifa debe tener al menos un premio activo para realizar el sorteo.'
    );
  }

  const ticketsVendidos = await sorteoRepo.findTicketsVendidosByRifa(rifaId);
  if (ticketsVendidos.length === 0) {
    throw new AppError(
      409,
      'NO_SOLD_TICKETS',
      'No hay tickets vendidos válidos para realizar el sorteo.'
    );
  }

  const counts = await sorteoRepo.countTicketsPendientesOEstado(rifaId);
  const ahora = new Date();
  const pasoFechaFin = ahora >= rifa.fechaFin;
  const todosVendidos = counts.disponibles === 0 && counts.reservados === 0;

  let observacionFinal = observacion ? observacion.trim() : null;

  if (!pasoFechaFin && !todosVendidos) {
    if (!forzar) {
      throw new AppError(
        409,
        'DRAW_DATE_NOT_REACHED',
        'Aún no ha pasado la fecha de finalización ni se han vendido todos los tickets.'
      );
    }
    if (!esAdmin(usuario)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'Solo un administrador puede forzar el sorteo antes de la fecha de finalización.'
      );
    }
    if (!observacionFinal) {
      throw new AppError(
        400,
        'OBSERVACION_REQUIRED',
        'Debe indicar una observación obligatoria al forzar el sorteo.'
      );
    }
  }

  // Selección aleatoria criptográfica (Regla 4) solo entre tickets VENDIDOS, sin repetir
  const pool = [...ticketsVendidos];
  const asignaciones = [];

  for (const premio of rifa.premios) {
    if (pool.length === 0) break;
    const idx = crypto.randomInt(pool.length);
    const [ganador] = pool.splice(idx, 1);
    asignaciones.push({
      premio,
      ticket: ganador
    });
  }

  if (rifa.premios.length > ticketsVendidos.length) {
    const nota = `Nota: había ${rifa.premios.length} premios activos y ${ticketsVendidos.length} tickets vendidos; se asignaron ${asignaciones.length} premios sin repetir ticket.`;
    observacionFinal = observacionFinal ? `${observacionFinal} | ${nota}` : nota;
  }

  const premioPrincipal = asignaciones[0];

  const sorteoCreado = await withTransaction(async (tx) => {
    const marcada = await sorteoRepo.markRifaFinalizadaIfActive(rifaId, tx);
    if (marcada.count !== 1) {
      throw new AppError(409, 'RAFFLE_ALREADY_DRAWN', 'La rifa ya fue finalizada.');
    }

    const sorteo = await sorteoRepo.createSorteo(
      {
        rifaId,
        ticketGanadorId: premioPrincipal.ticket.ticketId,
        realizadoPorId: usuario.usuarioId,
        observacion: observacionFinal
      },
      tx
    );

    for (const item of asignaciones) {
      await sorteoRepo.assignTicketGanadorAPremio(
        item.premio.premioId,
        item.ticket.ticketId,
        tx
      );
    }

    await auditoriaService.registrar(tx, {
      usuarioId: usuario.usuarioId,
      entidad: 'rifa',
      entidadId: rifaId,
      accion: 'REALIZAR_SORTEO',
      detalle: {
        sorteoId: sorteo.sorteoId,
        forzado: Boolean(forzar && !pasoFechaFin && !todosVendidos),
        observacion: observacionFinal,
        ganadores: asignaciones.map((a) => ({
          premioId: a.premio.premioId,
          premio: a.premio.nombre,
          ticketId: a.ticket.ticketId,
          numeroTicket: a.ticket.numeroTicket
        }))
      }
    });

    return sorteo;
  });

  // Notificaciones post-commit (Regla 9)
  const compradoresIds = Array.from(
    new Set(ticketsVendidos.map((t) => t.usuarioId).filter(Boolean))
  );
  await notificacionService.notificar('SORTEO_REALIZADO', compradoresIds, {
    nombreRifa: rifa.nombre,
    numeroGanador: premioPrincipal.ticket.numeroTicket
  });

  for (const a of asignaciones) {
    if (a.ticket.usuarioId) {
      await notificacionService.notificar('GANADOR', [a.ticket.usuarioId], {
        nombreRifa: rifa.nombre,
        numeroGanador: a.ticket.numeroTicket,
        premio: a.premio.nombre
      });
    }
  }

  return {
    sorteo: sorteoCreado,
    estadoRifa: RIFA_ESTADOS.FINALIZADA,
    ganadores: asignaciones.map((a) => ({
      premioId: a.premio.premioId,
      premio: a.premio.nombre,
      ticketId: a.ticket.ticketId,
      numeroTicket: a.ticket.numeroTicket
    }))
  };
}

export async function finalizarSinVentas(usuario, rifaId, motivo) {
  const rifa = await sorteoRepo.findRifaParaSorteo(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  assertPropietarioORAdmin(usuario, rifa);

  if (rifa.estado === RIFA_ESTADOS.FINALIZADA) {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 'La rifa ya está finalizada.');
  }

  const counts = await sorteoRepo.countTicketsPendientesOEstado(rifaId);
  if (counts.vendidos > 0) {
    throw new AppError(
      409,
      'HAS_SOLD_TICKETS',
      'La rifa tiene tickets vendidos; debe realizarse el sorteo para finalizarla.'
    );
  }

  await withTransaction(async (tx) => {
    const marcada = await sorteoRepo.markRifaFinalizadaIfActive(rifaId, tx);
    if (marcada.count !== 1) {
      throw new AppError(409, 'INVALID_STATE_TRANSITION', 'La rifa ya fue finalizada.');
    }

    await sorteoRepo.releaseUnsoldReservationsOnFinalize(rifaId, tx);

    await auditoriaService.registrar(tx, {
      usuarioId: usuario.usuarioId,
      entidad: 'rifa',
      entidadId: rifaId,
      accion: 'FINALIZAR_RIFA_SIN_VENTAS',
      detalle: { motivo }
    });
  });

  return {
    rifaId,
    estado: RIFA_ESTADOS.FINALIZADA,
    message: 'Rifa finalizada sin sorteo.'
  };
}

export async function obtenerResultadoPublico(rifaId) {
  const rifa = await sorteoRepo.findResultadoPublicoRifa(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  if (rifa.estado !== RIFA_ESTADOS.FINALIZADA) {
    throw new AppError(
      409,
      'RESULT_NOT_AVAILABLE',
      'El resultado aún no está disponible porque la rifa no ha finalizado.'
    );
  }

  return {
    rifa: {
      rifaId: rifa.rifaId,
      nombre: rifa.nombre,
      estado: rifa.estado,
      fechaInicio: rifa.fechaInicio,
      fechaFin: rifa.fechaFin,
      causa: rifa.causa
    },
    sorteo: rifa.sorteo
      ? {
          sorteoId: rifa.sorteo.sorteoId,
          fecha: rifa.sorteo.fecha,
          observacion: rifa.sorteo.observacion,
          numeroGanadorPrincipal: rifa.sorteo.ticketGanador.numeroTicket,
          ganadorPrincipal: formatGanadorPublico(rifa.sorteo.ticketGanador.usuario)
        }
      : null,
    premios: rifa.premios.map((p) => ({
      premioId: p.premioId,
      nombre: p.nombre,
      descripcion: p.descripcion,
      valor: formatDecimal(p.valor),
      reclamado: p.reclamado,
      numeroTicketGanador: p.ticketGanador?.numeroTicket ?? null,
      ganador: formatGanadorPublico(p.ticketGanador?.usuario)
    }))
  };
}

export async function registrarEntregaPremio(usuario, premioId, { reclamado, datosEntrega }) {
  const premio = await premioRepo.findPremioWithRifaById(premioId);
  if (!premio) {
    throw new AppError(404, 'PRIZE_NOT_FOUND', 'Premio no encontrado.');
  }

  assertPropietarioORAdmin(usuario, premio.rifa);

  if (premio.ticketGanadorId === null) {
    throw new AppError(
      409,
      'PRIZE_WITHOUT_WINNER',
      'No se puede registrar entrega porque este premio aún no tiene un ticket ganador.'
    );
  }

  const actualizado = await withTransaction(async (tx) => {
    const updated = await sorteoRepo.updateEntregaPremio(
      premioId,
      { reclamado, datosEntrega },
      tx
    );

    await auditoriaService.registrar(tx, {
      usuarioId: usuario.usuarioId,
      entidad: 'premio',
      entidadId: premioId,
      accion: 'REGISTRAR_ENTREGA_PREMIO',
      detalle: {
        rifaId: premio.rifaId,
        reclamado,
        ...(datosEntrega !== undefined ? { datosEntrega } : {})
      }
    });

    return updated;
  });

  return {
    premio: {
      premioId: actualizado.premioId,
      rifaId: actualizado.rifaId,
      nombre: actualizado.nombre,
      reclamado: actualizado.reclamado,
      datosEntrega: actualizado.datosEntrega
    }
  };
}
