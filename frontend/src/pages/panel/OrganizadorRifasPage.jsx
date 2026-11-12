import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink, PlusCircle, Search, Settings2, Ticket, X } from 'lucide-react';
import { getMisRifasApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFechaCorta } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../../components/ui/Skeleton.jsx';

const ESTADOS_RIFA = [
  { key: '', label: 'Todas' },
  { key: 'ACTIVA', label: 'Activas' },
  { key: 'EXTENDIDA', label: 'Extendidas' },
  { key: 'FINALIZADA', label: 'Finalizadas' },
];

export function OrganizadorRifasPage() {
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-rifas-org', { estado, page }],
    queryFn: () =>
      getMisRifasApi({
        page,
        limit: 12,
        ...(estado ? { estado } : {}),
      }),
  });

  const items = useMemo(() => {
    const raw = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (r) =>
        r.nombre?.toLowerCase().includes(q) || r.causa?.nombre?.toLowerCase().includes(q)
    );
  }, [data, busqueda]);
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Ticket className="h-3.5 w-3.5" />
            Gestión de campañas
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Mis rifas aprobadas</h1>
          <p className="text-sm text-slate-600">
            Configura premios, controla fechas de cierre, ejecuta sorteos verificables y registra entregas.
          </p>
        </div>

        <Link to="/solicitudes/nueva">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            Nueva solicitud de rifa
          </Button>
        </Link>
      </div>

      {/* Barra de búsqueda + filtros y accesos rápidos */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar rifa por nombre o causa..."
            aria-label="Buscar en mis rifas"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-9 pl-9 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ESTADOS_RIFA.map((tab) => (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => {
                setEstado(tab.key);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                estado === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <Link to="/solicitudes/mias">
            <Button variant="secondary" size="sm">
              Mis solicitudes
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={busqueda ? 'Sin coincidencias en tus rifas' : 'No tienes rifas creadas'}
          description={
            busqueda
              ? 'Prueba con otro término o limpia el filtro.'
              : 'Cuando tu solicitud sea aprobada por un administrador aparecerá aquí.'
          }
          action={
            busqueda ? (
              <Button variant="secondary" onClick={() => setBusqueda('')}>
                Limpiar búsqueda
              </Button>
            ) : (
              <Link to="/solicitudes/nueva">
                <Button>Solicitar nueva rifa</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => {
            const vendidos = r.conteos?.VENDIDO ?? 0;
            const totalTickets = Math.max(1, r.cantidadTickets || 1);
            const pctVendido = Math.min(100, Math.round((vendidos / totalTickets) * 100));
            const sinPremios = r.estado !== 'FINALIZADA' && (r.premiosActivosCount ?? 0) === 0;

            return (
              <div
                key={r.rifaId}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    r.estado === 'FINALIZADA'
                      ? 'from-indigo-500 to-purple-500'
                      : r.estado === 'EXTENDIDA'
                      ? 'from-amber-400 to-orange-500'
                      : 'from-emerald-500 to-teal-500'
                  }`}
                />
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Rifa #{r.rifaId} · {r.causa?.nombre || 'Sin causa asignada'}
                        </p>
                        <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">{r.nombre}</h2>
                      </div>
                      <Badge estado={r.estado} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Cierre programado: <span className="font-semibold text-slate-700">{formatearFechaCorta(r.fechaFin)}</span>
                    </p>

                  {sinPremios && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      Falta cargar al menos 1 premio activo
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                    <div>
                      <p className="text-slate-500">Precio</p>
                      <p className="font-bold text-emerald-700">{formatearBs(r.precioTicket)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Disp.</p>
                      <p className="font-bold">{r.conteos?.DISPONIBLE ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Vend.</p>
                      <p className="font-bold text-indigo-700">{vendidos}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Premios</p>
                      <p className="font-bold text-amber-700">{r.premiosActivosCount ?? 0}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pctVendido}%` }}
                      />
                    </div>
                    <p className="text-right text-[11px] font-medium text-slate-500">
                      {pctVendido}% vendido ({vendidos}/{r.cantidadTickets})
                    </p>
                  </div>
                </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    <Link to={`/organizador/rifas/${r.rifaId}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Settings2 className="h-4 w-4" />
                        Gestionar premios y sorteo
                      </Button>
                    </Link>
                    <Link to={`/rifas/${r.rifaId}`}>
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver pública
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="self-center text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
