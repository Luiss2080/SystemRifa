import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { validarPuedeModificarPremiosRifa } from '../utils/rifa.estados.js';
import { assertPropietarioORAdmin } from '../middlewares/authorize.js';
import * as rifaRepo from '../repositories/rifa.repository.js';
import * as premioRepo from '../repositories/premio.repository.js';

function formatPremio(p) {
  return {
    premioId: p.premioId,
    rifaId: p.rifaId,
    ticketGanadorId: p.ticketGanadorId,
    nombre: p.nombre,
    descripcion: p.descripcion,
    valor: formatDecimal(p.valor),
    activo: p.activo,
    reclamado: p.reclamado
  };
}

export async function listarPremiosPublicos(rifaId) {
  const rifa = await rifaRepo.findRifaOwnershipById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  const items = await premioRepo.findPremiosActivosByRifa(rifaId);
  return { items: items.map(formatPremio) };
}

export async function crearPremio(usuario, rifaId, data) {
  const rifa = await rifaRepo.findRifaOwnershipById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  assertPropietarioORAdmin(usuario, rifa);
  validarPuedeModificarPremiosRifa(rifa);

  const creado = await premioRepo.createPremio({
    rifaId,
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    valor: data.valor ?? null,
    activo: true
  });

  return { premio: formatPremio(creado) };
}

export async function actualizarPremio(usuario, premioId, data) {
  const premio = await premioRepo.findPremioWithRifaById(premioId);
  if (!premio) {
    throw new AppError(404, 'PRIZE_NOT_FOUND', 'Premio no encontrado.');
  }

  assertPropietarioORAdmin(usuario, premio.rifa);
  validarPuedeModificarPremiosRifa(premio.rifa);

  if (data.activo === false && premio.ticketGanadorId !== null) {
    throw new AppError(
      409,
      'PRIZE_HAS_WINNER',
      'No se puede desactivar un premio que ya tiene un ticket ganador.'
    );
  }

  const actualizado = await premioRepo.updatePremio(premioId, data);
  return { premio: formatPremio(actualizado) };
}

export async function desactivarPremio(usuario, premioId) {
  const premio = await premioRepo.findPremioWithRifaById(premioId);
  if (!premio) {
    throw new AppError(404, 'PRIZE_NOT_FOUND', 'Premio no encontrado.');
  }

  assertPropietarioORAdmin(usuario, premio.rifa);
  validarPuedeModificarPremiosRifa(premio.rifa);

  if (premio.ticketGanadorId !== null) {
    throw new AppError(
      409,
      'PRIZE_HAS_WINNER',
      'No se puede desactivar un premio que ya tiene un ticket ganador.'
    );
  }

  const desactivado = await premioRepo.updatePremio(premioId, { activo: false });
  return { premio: formatPremio(desactivado) };
}

