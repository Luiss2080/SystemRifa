import * as premioService from '../services/premio.service.js';

export async function getPremiosRifa(req, res, next) {
  try {
    const data = await premioService.listarPremiosPublicos(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postPremioRifa(req, res, next) {
  try {
    const data = await premioService.crearPremio(req.user, req.params.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchPremio(req, res, next) {
  try {
    const data = await premioService.actualizarPremio(req.user, req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePremio(req, res, next) {
  try {
    const data = await premioService.desactivarPremio(req.user, req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
