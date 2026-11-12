import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import * as causaRepo from '../repositories/causa.repository.js';

function formatCausa(causa) {
  return {
    causaId: causa.causaId,
    nombre: causa.nombre,
    descripcion: causa.descripcion,
    meta: formatDecimal(causa.meta),
    ...(causa._count
      ? {
          rifasCount: causa._count.rifas,
          solicitudesCount: causa._count.solicitudes
        }
      : {})
  };
}

export async function listarCausas() {
  const items = await causaRepo.findAllCausas();
  return { items: items.map(formatCausa) };
}

export async function obtenerCausa(causaId) {
  const causa = await causaRepo.findCausaById(causaId);
  if (!causa) {
    throw new AppError(404, 'CAUSE_NOT_FOUND', 'Causa solidaria no encontrada.');
  }
  return { causa: formatCausa(causa) };
}

export async function crearCausa(data) {
  const creada = await causaRepo.createCausa(data);
  return { causa: formatCausa(creada) };
}

export async function actualizarCausa(causaId, data) {
  const existente = await causaRepo.findCausaById(causaId);
  if (!existente) {
    throw new AppError(404, 'CAUSE_NOT_FOUND', 'Causa solidaria no encontrada.');
  }

  const actualizada = await causaRepo.updateCausa(causaId, data);
  return { causa: formatCausa(actualizada) };
}

export async function eliminarCausa(causaId) {
  const existente = await causaRepo.findCausaById(causaId);
  if (!existente) {
    throw new AppError(404, 'CAUSE_NOT_FOUND', 'Causa solidaria no encontrada.');
  }

  if (existente._count.rifas > 0 || existente._count.solicitudes > 0) {
    throw new AppError(
      409,
      'CAUSE_IN_USE',
      'No se puede eliminar la causa porque tiene rifas o solicitudes asociadas.'
    );
  }

  await causaRepo.deleteCausa(causaId);
  return { message: 'Causa solidaria eliminada correctamente.' };
}
