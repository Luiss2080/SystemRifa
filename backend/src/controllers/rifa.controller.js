import * as rifaService from '../services/rifa.service.js';

export async function getResumenPublico(_req, res, next) {
  try {
    const data = await rifaService.obtenerResumenPublico();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getCatalogoPublico(req, res, next) {
  try {
    const data = await rifaService.listarCatalogoPublico(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMisRifas(req, res, next) {
  try {
    const data = await rifaService.listarMisRifas(req.user.usuarioId, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getRifaById(req, res, next) {
  try {
    const data = await rifaService.obtenerDetallePublico(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchExtenderRifa(req, res, next) {
  try {
    const data = await rifaService.extenderRifa(req.user, req.params.id, req.body.fechaFin);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

