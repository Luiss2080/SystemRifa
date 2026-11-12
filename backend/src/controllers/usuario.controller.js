import * as usuarioService from '../services/usuario.service.js';

export async function patchMiPerfil(req, res, next) {
  try {
    const data = await usuarioService.actualizarMiPerfil(req.user.usuarioId, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchMiPassword(req, res, next) {
  try {
    const data = await usuarioService.cambiarMiPassword(req.user.usuarioId, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUsuarios(req, res, next) {
  try {
    const data = await usuarioService.listarUsuarios(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUsuarioById(req, res, next) {
  try {
    const data = await usuarioService.obtenerUsuarioDetalle(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchUsuarioActivo(req, res, next) {
  try {
    const data = await usuarioService.cambiarEstadoActivo(
      req.user.usuarioId,
      req.params.id,
      req.body.activo
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
