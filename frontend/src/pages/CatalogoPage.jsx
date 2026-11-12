import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpDown,
  Calendar,
  Clock,
  HeartHandshake,
  Search,
  Sparkles,
  Ticket,
  Trophy,
  X,
} from 'lucide-react';
import { getCatalogoRifas, getCausasPublicas } from '../features/rifas/publicApi.js';
import { formatearBs, formatearFechaCorta } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';

const HORAS_URGENCIA = 48;

function horasRestantes(fechaFin) {
  return (new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function CatalogoPage() {
  const [causaId, setCausaId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [soloCierraPronto, setSoloCierraPronto] = useState(false);
  const [orden, setOrden] = useState('cierre');
  const [page, setPage] = useState(1);

  const { data: causasData } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalogo-rifas', { causaId, page }],
    queryFn: () =>
      getCatalogoRifas({
        page,
        limit: 9,
        ...(causaId ? { causaId: Number(causaId) } : {}),
      }),
  });

  const causas = causasData?.items || [];
  const rifasBase = useMemo(() => data?.items || [], [data]);
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const rifasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = rifasBase.filter((r) => {
      if (soloCierraPronto) {
        const hrs = horasRestantes(r.fechaFin);
        if (hrs <= 0 || hrs > HORAS_URGENCIA) return false;
      }
      if (!q) return true;
      return (
        r.nombre?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q) ||
        r.causa?.nombre?.toLowerCase().includes(q)
      );
    });

    lista = [...lista].sort((a, b) => {
      if (orden === 'precio') return Number(a.precioTicket) - Number(b.precioTicket);
      if (orden === 'disponibles') {
        return (b.ticketsDisponibles ?? 0) - (a.ticketsDisponibles ?? 0);
      }
      return new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime();
    });

    return lista;
  }, [rifasBase, busqueda, soloCierraPronto, orden]);

  const hayFiltrosLocales = Boolean(causaId || busqueda.trim() || soloCierraPronto);

  function limpiarFiltros() {
    setCausaId('');
    setBusqueda('');
    setSoloCierraPronto(false);
    setOrden('cierre');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <HeartHandshake className="h-3.5 w-3.5" />
              Apoyo directo y sorteos transparentes
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Rifas solidarias activas
            </h1>
            <p className="text-sm text-emerald-50 sm:text-base">
              Elige tus números favoritos, apoya una causa social y sigue cada pago y sorteo en tiempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/causas">
              <Button variant="secondary" className="border-0 bg-white text-emerald-800 hover:bg-emerald-50">
                Ver causas solidarias
              </Button>
            </Link>
            <Link to="/solicitudes/nueva">
              <Button className="bg-emerald-900/40 text-white hover:bg-emerald-900/60">
                <Sparkles className="h-4 w-4" />
                Organizar una rifa
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-2.5 border-t border-white/15 pt-5 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-800">
              1
            </span>
            <span>Explora una causa y elige tus números disponibles</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-800">
              2
            </span>
            <span>Resérvalos al instante por 15 minutos sin perderlos</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-800">
              3
            </span>
            <span>Registra tu comprobante y participa en el sorteo</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, descripción o causa..."
              aria-label="Buscar rifas"
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pr-9 pl-9 text-sm text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSoloCierraPronto((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                soloCierraPronto
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Cierra pronto (&le; 48h)
            </button>

            <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar catálogo"
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="cierre">Cierre más próximo</option>
                <option value="precio">Menor precio</option>
                <option value="disponibles">Más disponibles</option>
              </select>
            </label>
          </div>
        </div>

        {causas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setCausaId('');
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                !causaId
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas las causas
            </button>
            {causas.map((c) => {
              const activa = String(causaId) === String(c.causaId);
              return (
                <button
                  key={c.causaId}
                  type="button"
                  onClick={() => {
                    setCausaId(activa ? '' : String(c.causaId));
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    activa
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.nombre}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <EmptyState
          icon={Ticket}
          title="No se pudo cargar el catálogo"
          description="Verifica tu conexión o intenta recargar la página."
        />
      ) : rifasFiltradas.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No hay rifas que coincidan con tu filtro"
          description="Prueba limpiando la búsqueda o seleccionando otra causa solidaria."
          action={
            hayFiltrosLocales && (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rifasFiltradas.map((rifa) => {
              const disponibles = rifa.ticketsDisponibles ?? 0;
              const pctDisponible = Math.min(
                100,
                Math.round((disponibles / Math.max(1, rifa.cantidadTickets)) * 100)
              );
              const pctAvance = 100 - pctDisponible;
              const hrs = horasRestantes(rifa.fechaFin);
              const porCerrar = rifa.estado !== 'FINALIZADA' && hrs > 0 && hrs <= HORAS_URGENCIA;

              return (
                <article
                  key={rifa.rifaId}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        {rifa.causa?.nombre || 'Causa solidaria'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {porCerrar && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            <Clock className="h-3 w-3" />
                            {Math.max(1, Math.ceil(hrs))}h
                          </span>
                        )}
                        <Badge estado={rifa.estado} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-emerald-700">
                        {rifa.nombre}
                      </h3>
                      {rifa.descripcion && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{rifa.descripcion}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                      <div>
                        <p className="text-slate-500">Precio por ticket</p>
                        <p className="text-base font-bold text-emerald-700">
                          {formatearBs(rifa.precioTicket)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Disponibles</p>
                        <p className="text-base font-bold text-slate-900">
                          {disponibles} / {rifa.cantidadTickets}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${pctAvance}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Cierre: {formatearFechaCorta(rifa.fechaFin)}
                        </span>
                        <span className="font-medium text-slate-700">{pctAvance}% completado</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link to={`/rifas/${rifa.rifaId}`} className="flex-1">
                      <Button className="w-full">
                        {rifa.estado === 'FINALIZADA' ? 'Ver detalle' : 'Elegir números'}
                      </Button>
                    </Link>
                    {rifa.estado === 'FINALIZADA' && (
                      <Link to={`/rifas/${rifa.rifaId}/resultado`}>
                        <Button variant="secondary" title="Ver resultado">
                          <Trophy className="h-4 w-4 text-amber-600" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-600">
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
        </>
      )}
    </div>
  );
}
