import * as sorteoService from '../services/sorteo.service.js';

export async function postSorteoRifa(req, res, next) {
  try {
    const data = await sorteoService.realizarSorteo(req.user, req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postFinalizarRifa(req, res, next) {
  try {
    const data = await sorteoService.finalizarSinVentas(
      req.user,
      req.params.id,
      req.body.motivo
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getResultadoRifa(req, res, next) {
  try {
    const data = await sorteoService.obtenerResultadoPublico(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchEntregaPremio(req, res, next) {
  try {
    const data = await sorteoService.registrarEntregaPremio(req.user, req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
