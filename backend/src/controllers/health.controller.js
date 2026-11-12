import { verificarSalud } from '../services/health.service.js';

export async function getHealth(_req, res, next) {
  try {
    const data = await verificarSalud();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
