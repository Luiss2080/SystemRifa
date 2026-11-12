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

