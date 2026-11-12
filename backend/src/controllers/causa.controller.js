import * as causaService from '../services/causa.service.js';

export async function getCausas(_req, res, next) {
  try {
    const data = await causaService.listarCausas();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getCausaById(req, res, next) {
  try {
    const data = await causaService.obtenerCausa(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postCausa(req, res, next) {
  try {
    const data = await causaService.crearCausa(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchCausa(req, res, next) {
  try {
    const data = await causaService.actualizarCausa(req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteCausa(req, res, next) {
  try {
    const data = await causaService.eliminarCausa(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
