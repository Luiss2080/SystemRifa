import { AppError } from '../utils/AppError.js';
import { withTransaction } from '../repositories/transaction.js';
import * as notificacionRepo from '../repositories/notificacion.repository.js';

const PLACEHOLDER_REGEX = /\{([a-zA-Z0-9_]+)\}/g;

export function extraerVariables(texto) {
  const vars = [];
  let match;
  const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');
  while ((match = regex.exec(texto)) !== null) {
    vars.push(match[1]);
  }
  return Array.from(new Set(vars));
}

export function validarVariablesEnPlantilla(texto, variablesAdmitidas) {
  const admitidas = new Set(Array.isArray(variablesAdmitidas) ? variablesAdmitidas : []);
  const usadas = extraerVariables(texto);
  const noAdmitidas = usadas.filter((v) => !admitidas.has(v));

  if (noAdmitidas.length > 0) {
    throw new AppError(
      400,
      'INVALID_TEMPLATE_VARIABLE',
      `Variables no admitidas en la plantilla: ${noAdmitidas.join(', ')}.`,
      { admitidas: Array.from(admitidas), noAdmitidas }
    );
  }
}

export function renderizarTexto(plantilla, variables = {}, variablesAdmitidas = []) {
  validarVariablesEnPlantilla(plantilla, variablesAdmitidas);

  const admitidas = new Set(Array.isArray(variablesAdmitidas) ? variablesAdmitidas : []);
  for (const key of Object.keys(variables)) {
    if (!admitidas.has(key)) {
      throw new AppError(
        400,
        'INVALID_TEMPLATE_VARIABLE',
        `La variable "${key}" no está admitida para este tipo de notificación.`
      );
    }
  }

  return plantilla.replace(PLACEHOLDER_REGEX, (_, key) => {
    const val = variables[key];
    return val === undefined || val === null ? '' : String(val);
  });
}

/**
 * Envía una notificación interna de forma segura post-commit.
 * Nunca propaga excepciones para no afectar la operación principal (Regla 9).
 * @param {string} codigo
 * @param {number[]} destinatarios
 * @param {Record<string, unknown>} [variables={}]
 */
export async function notificar(codigo, destinatarios, variables = {}) {
  try {
    const idsUnicos = Array.from(new Set(destinatarios)).filter((id) => Number.isInteger(id) && id > 0);
    if (idsUnicos.length === 0) {
      return null;
    }

    const tipo = await notificacionRepo.findTipoByCodigo(codigo);
    if (!tipo || !tipo.estaActivo) {
      return null;
    }

    const admitidas = Array.isArray(tipo.variables) ? tipo.variables : [];
    const titulo = renderizarTexto(tipo.plantillaTitulo, variables, admitidas);
    const mensaje = renderizarTexto(tipo.plantillaMensaje, variables, admitidas);

    return await withTransaction((tx) =>
      notificacionRepo.createNotificacionWithDestinatarios(
        {
          tipoNotificacionId: tipo.tipoNotificacionId,
          destinatarios: idsUnicos.map((usuarioId) => ({
            usuarioId,
            titulo: titulo.slice(0, 150),
            mensaje
          }))
        },
        tx
      )
    );
  } catch (err) {
    console.error(`[Notificación ${codigo}] Error al enviar:`, err);
    return null;
  }
}

/**
 * Envía una notificación a todos los usuarios activos con el permiso indicado (`recurso:accion`).
 * Nunca propaga excepciones (Regla 9).
 * @param {string} codigo
 * @param {string} permisoClave
 * @param {Record<string, unknown>} [variables={}]
 */
export async function notificarConPermiso(codigo, permisoClave, variables = {}) {
  try {
    const [recurso, accion] = String(permisoClave).split(':');
    if (!recurso || !accion) {
      throw new Error(`Permiso inválido para notificar: ${permisoClave}`);
    }

    const destinatarios = await notificacionRepo.findActiveUserIdsWithPermission(recurso, accion);
    return await notificar(codigo, destinatarios, variables);
  } catch (err) {
    console.error(`[Notificación ${codigo}] Error resolviendo destinatarios:`, err);
    return null;
  }
}

export async function listarMisNotificaciones(usuarioId, { page, limit, noLeidas }) {
  const { items, total, noLeidasCount } = await notificacionRepo.findUserNotifications({
    usuarioId,
    page,
    limit,
    noLeidas
  });

  return {
    items: items.map((n) => ({
      notificacionId: n.notificacionId,
      codigo: n.notificacion.tipo.codigo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leida: n.leida,
      fechaCreacion: n.notificacion.fechaCreacion
    })),
    noLeidasCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function marcarLeida(usuarioId, notificacionId) {
  const updated = await notificacionRepo.markOneAsRead(notificacionId, usuarioId);
  if (updated.count === 0) {
    throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notificación no encontrada.');
  }
  return { message: 'Notificación marcada como leída.' };
}

export async function marcarTodasLeidas(usuarioId) {
  const updated = await notificacionRepo.markAllAsRead(usuarioId);
  return {
    message: 'Todas las notificaciones fueron marcadas como leídas.',
    actualizadas: updated.count
  };
}

export async function eliminarNotificacion(usuarioId, notificacionId) {
  const updated = await notificacionRepo.softDeleteOne(notificacionId, usuarioId);
  if (updated.count === 0) {
    throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notificación no encontrada.');
  }
  return { message: 'Notificación eliminada.' };
}

export async function listarTiposNotificacion() {
  const items = await notificacionRepo.findAllTipos();
  return { items };
}

export async function actualizarTipoNotificacion(tipoNotificacionId, data) {
  const tipo = await notificacionRepo.findTipoById(tipoNotificacionId);
  if (!tipo) {
    throw new AppError(404, 'NOTIFICATION_TYPE_NOT_FOUND', 'Tipo de notificación no encontrado.');
  }

  const admitidas = Array.isArray(tipo.variables) ? tipo.variables : [];
  if (data.plantillaTitulo !== undefined) {
    validarVariablesEnPlantilla(data.plantillaTitulo, admitidas);
  }
  if (data.plantillaMensaje !== undefined) {
    validarVariablesEnPlantilla(data.plantillaMensaje, admitidas);
  }

  const actualizado = await notificacionRepo.updateTipo(tipoNotificacionId, data);
  return { tipo: actualizado };
}

