import * as pagoService from '../services/pago.service.js';

export async function postPago(req, res, next) {
  try {
    const data = await pagoService.registrarPago(req.user, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMisPagos(req, res, next) {
  try {
    const data = await pagoService.listarMisPagos(req.user.usuarioId, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPagos(req, res, next) {
  try {
    const data = await pagoService.listarPagosAdmin(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchVerificarPago(req, res, next) {
  try {
    const data = await pagoService.verificarPago(req.user.usuarioId, req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
