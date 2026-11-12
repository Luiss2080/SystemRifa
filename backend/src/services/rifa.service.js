import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { validarExtensionRifa } from '../utils/rifa.estados.js';
import { assertPropietarioORAdmin } from '../middlewares/authorize.js';
import { withTransaction } from '../repositories/transaction.js';
import * as rifaRepo from '../repositories/rifa.repository.js';
import * as auditoriaService from './auditoria.service.js';

function formatRifaPublica(r, extras = {}) {
  return {
    rifaId: r.rifaId,
    causaId: r.causaId,
    nombre: r.nombre,
    descripcion: r.descripcion,
    precioTicket: formatDecimal(r.precioTicket),
    cantidadTickets: r.cantidadTickets,
    fechaInicio: r.fechaInicio,
    fechaFin: r.fechaFin,
    estado: r.estado,
    causa: r.causa
      ? {
          causaId: r.causa.causaId,
          nombre: r.causa.nombre,
          ...(r.causa.descripcion !== undefined ? { descripcion: r.causa.descripcion } : {}),
          ...(r.causa.meta !== undefined ? { meta: formatDecimal(r.causa.meta) } : {})
        }
      : null,
    ...(r.premios
      ? {
          premios: r.premios.map((p) => ({
            premioId: p.premioId,
            nombre: p.nombre,
            descripcion: p.descripcion,
            valor: formatDecimal(p.valor),
            reclamado: p.reclamado,
            ticketGanadorId: p.ticketGanadorId
          }))
        }
      : {}),
    ...extras
  };
}

export async function obtenerResumenPublico() {
  const { metricas, ultimosSorteos } = await rifaRepo.findResumenPublico(new Date());

  return {
    metricas,
    ultimosSorteos: ultimosSorteos.map((s) => {
      const u = s.ticketGanador?.usuario;
      const iniciales = u
        ? `${u.nombres || ''} ${u.apellidos || ''}`
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => `${p[0].toUpperCase()}.`)
            .join(' ')
        : '';

      const premioPrincipal = s.rifa.premios?.[0];
      return {
        sorteoId: s.sorteoId,
        rifaId: s.rifa.rifaId,
        nombreRifa: s.rifa.nombre,
        causa: s.rifa.causa,
        fechaSorteo: s.fecha,
        numeroGanadorPrincipal: s.ticketGanador?.numeroTicket ?? null,
        ganador: u ? { alias: u.alias, iniciales } : null,
        premioPrincipal: premioPrincipal
          ? {
              nombre: premioPrincipal.nombre,
              valor: formatDecimal(premioPrincipal.valor),
              reclamado: premioPrincipal.reclamado
            }
          : null,
        premiosCount: s.rifa.premios?.length ?? 0
      };
    })
  };
}

export async function listarCatalogoPublico({ page, limit, causaId }) {
  const ahora = new Date();
  const { items, total, disponiblesMap } = await rifaRepo.findCatalogoPublico({
    page,
    limit,
    causaId,
    ahora
  });

  return {
    items: items.map((r) =>
      formatRifaPublica(r, {
        ticketsDisponibles: disponiblesMap.get(r.rifaId) ?? 0
      })
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function obtenerDetallePublico(rifaId) {
  const rifa = await rifaRepo.findRifaById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  const conteos = await rifaRepo.getTicketCountsByEstado(rifaId);
  return {
    rifa: formatRifaPublica(rifa, { conteos })
  };
}

export async function listarMisRifas(usuarioId, { page, limit, estado }) {
  const { items, total, countsByRifa } = await rifaRepo.findMisRifas({
    usuarioCreadorId: usuarioId,
    page,
    limit,
    estado
  });

  return {
    items: items.map((r) => ({
      rifaId: r.rifaId,
      usuarioCreadorId: r.usuarioCreadorId,
      causaId: r.causaId,
      nombre: r.nombre,
      descripcion: r.descripcion,
      precioTicket: formatDecimal(r.precioTicket),
      cantidadTickets: r.cantidadTickets,
      fechaInicio: r.fechaInicio,
      fechaFin: r.fechaFin,
      estado: r.estado,
      causa: r.causa,
      premiosActivosCount: r._count.premios,
      conteos: countsByRifa.get(r.rifaId) ?? {
        DISPONIBLE: 0,
        RESERVADO: 0,
        VENDIDO: 0,
        ANULADO: 0
      }
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function extenderRifa(usuario, rifaId, nuevaFechaFin) {
  const rifa = await rifaRepo.findRifaById(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  assertPropietarioORAdmin(usuario, rifa);
  validarExtensionRifa(rifa, nuevaFechaFin);

  const actualizada = await withTransaction(async (tx) => {
    const updated = await rifaRepo.extendRifa(rifaId, nuevaFechaFin, tx);
    await auditoriaService.registrar(tx, {
      usuarioId: usuario.usuarioId,
      entidad: 'rifa',
      entidadId: rifaId,
      accion: 'EXTENDER_RIFA',
      detalle: {
        fechaFinAnterior: rifa.fechaFin.toISOString(),
        fechaFinNueva: nuevaFechaFin.toISOString()
      }
    });
    return updated;
  });

  return {
    rifa: {
      ...actualizada,
      precioTicket: formatDecimal(actualizada.precioTicket)
    }
  };
}

