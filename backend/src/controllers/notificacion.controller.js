import * as notificacionService from '../services/notificacion.service.js';

export async function getMisNotificaciones(req, res, next) {
  try {
    const data = await notificacionService.listarMisNotificaciones(req.user.usuarioId, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchMarcarLeida(req, res, next) {
  try {
    const data = await notificacionService.marcarLeida(req.user.usuarioId, req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchMarcarTodasLeidas(req, res, next) {
  try {
    const data = await notificacionService.marcarTodasLeidas(req.user.usuarioId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificacion(req, res, next) {
  try {
    const data = await notificacionService.eliminarNotificacion(req.user.usuarioId, req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getTiposNotificacion(_req, res, next) {
  try {
    const data = await notificacionService.listarTiposNotificacion();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchTipoNotificacion(req, res, next) {
  try {
    const data = await notificacionService.actualizarTipoNotificacion(req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

