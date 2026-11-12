import { AppError } from '../utils/AppError.js';
import { formatDecimal } from '../utils/money.js';
import { assertPropietarioORAdmin, esAdmin } from '../middlewares/authorize.js';
import * as reporteRepo from '../repositories/reporte.repository.js';
import * as auditoriaRepo from '../repositories/auditoria.repository.js';

function obtenerIniciales(nombres = '', apellidos = '') {
  const partes = `${nombres} ${apellidos}`.trim().split(/\s+/).filter(Boolean);
  return partes.map((p) => `${p[0].toUpperCase()}.`).join(' ');
}

function exigirAdmin(usuario) {
  if (!esAdmin(usuario)) {
    throw new AppError(403, 'FORBIDDEN', 'Solo un administrador puede consultar este reporte.');
  }
}

export async function obtenerReporteRifa(usuario, rifaId) {
  const rifa = await reporteRepo.findRifaReporteBase(rifaId);
  if (!rifa) {
    throw new AppError(404, 'RIFA_NOT_FOUND', 'Rifa no encontrada.');
  }

  assertPropietarioORAdmin(usuario, rifa);

  const [ticketsGroup, pagosGroup] = await Promise.all([
    reporteRepo.getTicketsEstadoGroupByRifa(rifaId),
    reporteRepo.getPagosAggregateByRifa(rifaId)
  ]);

  const ticketsPorEstado = {
    DISPONIBLE: 0,
    RESERVADO: 0,
    VENDIDO: 0,
    ANULADO: 0
  };
  for (const row of ticketsGroup) {
    ticketsPorEstado[row.estado] = row._count._all;
  }

  let recaudacionConfirmada = '0.00';
  let recaudacionPendiente = '0.00';
  for (const row of pagosGroup) {
    if (row.estado === 'CONFIRMADO') {
      recaudacionConfirmada = formatDecimal(row._sum.monto ?? 0);
    } else if (row.estado === 'PENDIENTE') {
      recaudacionPendiente = formatDecimal(row._sum.monto ?? 0);
    }
  }

  const porcentajeVendido =
    rifa.cantidadTickets > 0
      ? Number(((ticketsPorEstado.VENDIDO / rifa.cantidadTickets) * 100).toFixed(2))
      : 0;

  return {
    rifa: {
      rifaId: rifa.rifaId,
      nombre: rifa.nombre,
      estado: rifa.estado,
      precioTicket: formatDecimal(rifa.precioTicket),
      cantidadTickets: rifa.cantidadTickets,
      fechaInicio: rifa.fechaInicio,
      fechaFin: rifa.fechaFin,
      causa: rifa.causa
    },
    ticketsPorEstado,
    porcentajeVendido,
    recaudacionConfirmada,
    recaudacionPendiente,
    ganador: rifa.sorteo
      ? {
          sorteoId: rifa.sorteo.sorteoId,
          fecha: rifa.sorteo.fecha,
          numeroTicket: rifa.sorteo.ticketGanador.numeroTicket,
          alias: rifa.sorteo.ticketGanador.usuario?.alias ?? null,
          iniciales: rifa.sorteo.ticketGanador.usuario
            ? obtenerIniciales(
                rifa.sorteo.ticketGanador.usuario.nombres,
                rifa.sorteo.ticketGanador.usuario.apellidos
              )
            : null
        }
      : null
  };
}

export async function obtenerReporteCausas(usuario) {
  exigirAdmin(usuario);

  const { causas, pagosConfirmadosPorRifa, rifasPorCausa } =
    await reporteRepo.getReporteCausasData();

  const pagoCentavosPorRifa = new Map();
  for (const p of pagosConfirmadosPorRifa) {
    const centavos = Math.round(Number(p._sum.monto ?? 0) * 100);
    pagoCentavosPorRifa.set(p.rifaId, centavos);
  }

  const recaudadoCentavosPorCausa = new Map();
  const rifasCountPorCausa = new Map();

  for (const r of rifasPorCausa) {
    rifasCountPorCausa.set(r.causaId, (rifasCountPorCausa.get(r.causaId) ?? 0) + 1);
    const centavos = pagoCentavosPorRifa.get(r.rifaId) ?? 0;
    recaudadoCentavosPorCausa.set(
      r.causaId,
      (recaudadoCentavosPorCausa.get(r.causaId) ?? 0) + centavos
    );
  }

  return {
    items: causas.map((c) => {
      const recaudadoCentavos = recaudadoCentavosPorCausa.get(c.causaId) ?? 0;
      const recaudadoStr = (recaudadoCentavos / 100).toFixed(2);
      const metaNum = c.meta !== null ? Number(c.meta) : null;
      const porcentajeAvance =
        metaNum && metaNum > 0
          ? Number((((recaudadoCentavos / 100) / metaNum) * 100).toFixed(2))
          : null;

      return {
        causaId: c.causaId,
        nombre: c.nombre,
        descripcion: c.descripcion,
        meta: formatDecimal(c.meta),
        rifasCount: rifasCountPorCausa.get(c.causaId) ?? 0,
        recaudadoConfirmado: recaudadoStr,
        entregado: '0.00',
        porcentajeAvance
      };
    })
  };
}

export async function obtenerResumenGlobal(usuario) {
  exigirAdmin(usuario);

  const { rifasPorEstado, usuariosTotales, usuariosActivos, ticketsVendidos, pagosPorEstado } =
    await reporteRepo.getResumenGlobalData();

  const rifasEstadoMap = {
    ACTIVA: 0,
    EXTENDIDA: 0,
    FINALIZADA: 0
  };
  for (const row of rifasPorEstado) {
    rifasEstadoMap[row.estado] = row._count._all;
  }

  let recaudacionTotalConfirmada = '0.00';
  let recaudacionTotalPendiente = '0.00';
  for (const row of pagosPorEstado) {
    if (row.estado === 'CONFIRMADO') {
      recaudacionTotalConfirmada = formatDecimal(row._sum.monto ?? 0);
    } else if (row.estado === 'PENDIENTE') {
      recaudacionTotalPendiente = formatDecimal(row._sum.monto ?? 0);
    }
  }

  return {
    rifasPorEstado: rifasEstadoMap,
    usuarios: {
      totales: usuariosTotales,
      activos: usuariosActivos
    },
    ticketsVendidos,
    recaudacionTotalConfirmada,
    recaudacionTotalPendiente
  };
}

export async function listarAuditoria(usuario, query) {
  exigirAdmin(usuario);

  const { items, total } = await auditoriaRepo.findAuditoriaPaginated(query);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}
