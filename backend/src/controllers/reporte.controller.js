import * as reporteService from '../services/reporte.service.js';

export async function getReporteRifa(req, res, next) {
  try {
    const data = await reporteService.obtenerReporteRifa(req.user, req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getReporteCausas(req, res, next) {
  try {
    const data = await reporteService.obtenerReporteCausas(req.user);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getReporteResumen(req, res, next) {
  try {
    const data = await reporteService.obtenerResumenGlobal(req.user);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getAuditoria(req, res, next) {
  try {
    const data = await reporteService.listarAuditoria(req.user, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

