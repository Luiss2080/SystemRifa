import * as solicitudService from '../services/solicitud.service.js';

export async function postSolicitud(req, res, next) {
  try {
    const data = await solicitudService.crearSolicitud(req.user, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMisSolicitudes(req, res, next) {
  try {
    const data = await solicitudService.listarMisSolicitudes(req.user.usuarioId, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getSolicitudes(req, res, next) {
  try {
    const data = await solicitudService.listarSolicitudes(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getSolicitudById(req, res, next) {
  try {
    const data = await solicitudService.obtenerSolicitud(req.user, req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchSolicitudEstado(req, res, next) {
  try {
    const data = await solicitudService.cambiarEstadoSolicitud(
      req.user.usuarioId,
      req.params.id,
      req.body
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postAprobarSolicitud(req, res, next) {
  try {
    const data = await solicitudService.aprobarSolicitud(
      req.user.usuarioId,
      req.params.id,
      req.body
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

