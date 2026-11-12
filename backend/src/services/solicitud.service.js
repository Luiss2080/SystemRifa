import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import {
  SOLICITUD_ESTADOS,
  validarAprobacionSolicitud,
  validarTransicionSolicitud
} from '../utils/solicitud.estados.js';
import { userHasPermission } from '../middlewares/authorize.js';
import { invalidateUserPermissions } from '../utils/permissionCache.js';
import { withTransaction } from '../repositories/transaction.js';
import * as causaRepo from '../repositories/causa.repository.js';
import * as solicitudRepo from '../repositories/solicitud.repository.js';
import * as rifaRepo from '../repositories/rifa.repository.js';
import * as permisoRepo from '../repositories/permiso.repository.js';
import * as auditoriaService from './auditoria.service.js';
import * as notificacionService from './notificacion.service.js';

function getTarifaPublicacion() {
  if (process.env.TARIFA_PUBLICACION !== undefined) {
    return Number(process.env.TARIFA_PUBLICACION);
  }
  return env.TARIFA_PUBLICACION;
}

function formatSolicitud(s) {
  return {
    rifaSolicitadaId: s.rifaSolicitadaId,
    usuarioId: s.usuarioId,
    causaId: s.causaId,
    revisadoPorId: s.revisadoPorId,
    nombre: s.nombre,
    descripcion: s.descripcion,
    precioTicket: formatDecimal(s.precioTicket),
    cantidadTickets: s.cantidadTickets,
    fechaInicio: s.fechaInicio,
    fechaFin: s.fechaFin,
    fechaSolicitud: s.fechaSolicitud,
    estado: s.estado,
    referenciaPago: s.referenciaPago,
    observacion: s.observacion,
    fechaResolucion: s.fechaResolucion,
    usuario: s.usuario ?? undefined,
    revisor: s.revisor ?? undefined,
    causa: s.causa ?? undefined,
    rifa: s.rifa ?? undefined
  };
}

export async function crearSolicitud(usuario, input) {
  if (input.causaId) {
    const causa = await causaRepo.findCausaById(input.causaId);
    if (!causa) {
      throw new AppError(404, 'CAUSE_NOT_FOUND', 'La causa solidaria indicada no existe.');
    }
  }

  const creada = await solicitudRepo.createSolicitud({
    usuarioId: usuario.usuarioId,
    causaId: input.causaId ?? null,
    nombre: input.nombre,
    descripcion: input.descripcion ?? null,
    precioTicket: input.precioTicket,
    cantidadTickets: input.cantidadTickets,
    fechaInicio: input.fechaInicio,
    fechaFin: input.fechaFin,
    estado: SOLICITUD_ESTADOS.REVISION
  });

  // Regla 9: notificaciones post-commit
  await notificacionService.notificar('SOLICITUD_RECIBIDA', [usuario.usuarioId], {
    nombreRifa: creada.nombre
  });
  await notificacionService.notificarConPermiso('NUEVA_SOLICITUD', 'solicitudes:revisar', {
    alias: usuario.alias,
    nombreRifa: creada.nombre
  });

  return { solicitud: formatSolicitud(creada) };
}

export async function listarMisSolicitudes(usuarioId, { page, limit, estado }) {
  const { items, total } = await solicitudRepo.findSolicitudesPaginated({
    page,
    limit,
    estado,
    usuarioId
  });

  return {
    items: items.map(formatSolicitud),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function listarSolicitudes({ page, limit, estado }) {
  const { items, total } = await solicitudRepo.findSolicitudesPaginated({
    page,
    limit,
    estado
  });

  return {
    items: items.map(formatSolicitud),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function obtenerSolicitud(usuario, solicitudId) {
  const solicitud = await solicitudRepo.findSolicitudById(solicitudId);
  if (!solicitud) {
    throw new AppError(404, 'SOLICITUD_NOT_FOUND', 'Solicitud de rifa no encontrada.');
  }

  if (solicitud.usuarioId !== usuario.usuarioId) {
    const puedeRevisar = await userHasPermission(usuario.usuarioId, 'solicitudes', 'revisar');
    if (!puedeRevisar) {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permiso para ver esta solicitud.');
    }
  }

  return { solicitud: formatSolicitud(solicitud) };
}

export async function cambiarEstadoSolicitud(adminId, solicitudId, { estado, referenciaPago, observacion }) {
  const solicitud = await solicitudRepo.findSolicitudById(solicitudId);
  if (!solicitud) {
    throw new AppError(404, 'SOLICITUD_NOT_FOUND', 'Solicitud de rifa no encontrada.');
  }

  const tarifaPublicacion = getTarifaPublicacion();
  const { esFinal } = validarTransicionSolicitud({
    estadoActual: solicitud.estado,
    nuevoEstado: estado,
    tarifaPublicacion,
    referenciaPago,
    observacion
  });

  const actualizada = await withTransaction(async (tx) => {
    const updated = await solicitudRepo.updateSolicitudEstado(
      solicitudId,
      {
        estado,
        revisadoPorId: adminId,
        ...(referenciaPago !== undefined ? { referenciaPago } : {}),
        ...(observacion !== undefined ? { observacion } : {}),
        ...(esFinal ? { fechaResolucion: new Date() } : {})
      },
      tx
    );

    await auditoriaService.registrar(tx, {
      usuarioId: adminId,
      entidad: 'rifa_solicitada',
      entidadId: solicitudId,
      accion: 'CAMBIO_ESTADO_SOLICITUD',
      detalle: {
        de: solicitud.estado,
        a: estado,
        ...(referenciaPago ? { referenciaPago } : {}),
        ...(observacion ? { observacion } : {})
      }
    });

    return updated;
  });

  if (estado === SOLICITUD_ESTADOS.RECHAZADA) {
    await notificacionService.notificar('SOLICITUD_RECHAZADA', [actualizada.usuarioId], {
      nombreRifa: actualizada.nombre,
      observacion: actualizada.observacion ?? ''
    });
  } else {
    await notificacionService.notificar('SOLICITUD_ACTUALIZADA', [actualizada.usuarioId], {
      nombreRifa: actualizada.nombre,
      estado: actualizada.estado
    });
  }

  return { solicitud: formatSolicitud(actualizada) };
}

export async function aprobarSolicitud(adminId, solicitudId, ajustes = {}) {
  const solicitud = await solicitudRepo.findSolicitudById(solicitudId);
  if (!solicitud) {
    throw new AppError(404, 'SOLICITUD_NOT_FOUND', 'Solicitud de rifa no encontrada.');
  }

  validarAprobacionSolicitud(solicitud.estado);

  const nombreFinal = ajustes.nombre ?? solicitud.nombre;
  const descripcionFinal =
    ajustes.descripcion !== undefined ? ajustes.descripcion : solicitud.descripcion;
  const precioTicketFinal = ajustes.precioTicket ?? solicitud.precioTicket;
  const cantidadTicketsFinal = ajustes.cantidadTickets ?? solicitud.cantidadTickets;
  const fechaInicioFinal = ajustes.fechaInicio ?? solicitud.fechaInicio;
  const fechaFinFinal = ajustes.fechaFin ?? solicitud.fechaFin;
  const causaIdFinal = ajustes.causaId !== undefined ? ajustes.causaId : solicitud.causaId;

  if (fechaFinFinal <= fechaInicioFinal) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'La fecha de finalización debe ser posterior a la fecha de inicio.'
    );
  }

  if (causaIdFinal) {
    const causa = await causaRepo.findCausaById(causaIdFinal);
    if (!causa) {
      throw new AppError(404, 'CAUSE_NOT_FOUND', 'La causa solidaria indicada no existe.');
    }
  }

  const rolOrganizador = await permisoRepo.findRolByNombre('ORGANIZADOR');
  if (!rolOrganizador) {
    throw new Error('El rol ORGANIZADOR no existe en la base de datos.');
  }

  const resultado = await withTransaction(async (tx) => {
    const marcada = await solicitudRepo.markSolicitudAprobadaIfPagoConfirmado(
      solicitudId,
      {
        revisadoPorId: adminId,
        observacion: ajustes.observacion,
        fechaResolucion: new Date()
      },
      tx
    );

    if (marcada.count !== 1) {
      throw new AppError(
        409,
        'INVALID_STATE_TRANSITION',
        'La solicitud ya fue aprobada o cambió de estado.'
      );
    }

    const rifa = await rifaRepo.createRifa(
      {
        usuarioCreadorId: solicitud.usuarioId,
        rifaSolicitadaId: solicitudId,
        causaId: causaIdFinal ?? null,
        nombre: nombreFinal,
        descripcion: descripcionFinal,
        precioTicket: precioTicketFinal,
        cantidadTickets: cantidadTicketsFinal,
        fechaInicio: fechaInicioFinal,
        fechaFin: fechaFinFinal,
        estado: 'ACTIVA'
      },
      tx
    );

    await rifaRepo.createTicketsForRifa(rifa.rifaId, cantidadTicketsFinal, tx);

    await permisoRepo.assignRolToUser(solicitud.usuarioId, rolOrganizador.rolId, tx);

    await auditoriaService.registrar(tx, {
      usuarioId: adminId,
      entidad: 'rifa_solicitada',
      entidadId: solicitudId,
      accion: 'APROBAR_SOLICITUD',
      detalle: {
        rifaId: rifa.rifaId,
        cantidadTickets: cantidadTicketsFinal,
        precioTicket: formatDecimal(precioTicketFinal)
      }
    });

    const solicitudActualizada = await solicitudRepo.findSolicitudById(solicitudId, tx);

    return {
      solicitud: solicitudActualizada,
      rifa
    };
  });

  invalidateUserPermissions(solicitud.usuarioId);

  await notificacionService.notificar('SOLICITUD_APROBADA', [solicitud.usuarioId], {
    nombreRifa: resultado.rifa.nombre
  });

  return {
    solicitud: formatSolicitud(resultado.solicitud),
    rifa: {
      ...resultado.rifa,
      precioTicket: formatDecimal(resultado.rifa.precioTicket)
    }
  };
}

