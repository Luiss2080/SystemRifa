import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpDown,
  FilePlus2,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  X,
} from 'lucide-react';
import { getCausasPublicas } from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { formatearBs, sumarMontosBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';

const PALETAS_CAUSA = [
  {
    stripe: 'from-emerald-600 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badge: 'bg-emerald-50 text-emerald-800',
    hoverBorder: 'hover:border-emerald-300',
  },
  {
    stripe: 'from-sky-500 to-indigo-600',
    iconBg: 'bg-sky-50 text-sky-700 ring-sky-200',
    badge: 'bg-sky-50 text-sky-800',
    hoverBorder: 'hover:border-sky-300',
  },
  {
    stripe: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-50 text-teal-700 ring-teal-200',
    badge: 'bg-teal-50 text-teal-800',
    hoverBorder: 'hover:border-teal-300',
  },
  {
    stripe: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 text-amber-700 ring-amber-200',
    badge: 'bg-amber-50 text-amber-800',
    hoverBorder: 'hover:border-amber-300',
  },
];

export function CausasPublicPage() {
  const { autenticado, esAdmin, esOrganizador } = useAuth();
  const catalogoRuta = autenticado ? '/explorar' : '/';
  const [busqueda, setBusqueda] = useState('');
  const [soloConRifas, setSoloConRifas] = useState(false);
  const [orden, setOrden] = useState('rifas');

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const causasBase = useMemo(() => data?.items || [], [data]);

  const metricas = useMemo(() => {
    const totalRifas = causasBase.reduce((acc, c) => acc + (c.rifasCount ?? 0), 0);
    const metaGlobal = sumarMontosBs(causasBase.map((c) => c.meta || '0'));
    return {
      totalCausas: causasBase.length,
      totalRifas,
      metaGlobal,
    };
  }, [causasBase]);

  const causas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = causasBase.filter((c) => {
      if (soloConRifas && (c.rifasCount ?? 0) === 0) return false;
      if (!q) return true;
      return c.nombre?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q);
    });

    return [...filtradas].sort((a, b) => {
      if (orden === 'meta') return Number(b.meta || 0) - Number(a.meta || 0);
      return (b.rifasCount ?? 0) - (a.rifasCount ?? 0);
    });
  }, [causasBase, busqueda, soloConRifas, orden]);

  return (
    <div className="space-y-8">
      {/* Cabecera editorial centrada sin caja envolvente innecesaria */}
      <section className="mx-auto max-w-3xl space-y-4 pt-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
          <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" />
          Directorio editorial de impacto social
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Causas solidarias con propósito real
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Descubre las iniciativas comunitarias, de salud y educación que reciben respaldo directo a
          través de campañas auditadas en tiempo real.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {esAdmin ? (
            <>
              <Link to="/admin/causas">
                <Button size="md">
                  <ShieldCheck className="h-4 w-4" />
                  Administrar causas
                </Button>
              </Link>
              <Link to="/admin/reportes">
                <Button variant="secondary" size="md">
                  Ver reportes por causa
                </Button>
              </Link>
            </>
          ) : esOrganizador ? (
            <>
              <Link to="/solicitudes/nueva">
                <Button size="md">
                  <FilePlus2 className="h-4 w-4" />
                  Nueva campaña para causa
                </Button>
              </Link>
              <Link to="/organizador/rifas">
                <Button variant="secondary" size="md">
                  Gestionar mis rifas
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={catalogoRuta}>
                <Button size="md">
                  <Ticket className="h-4 w-4" />
                  Explorar catálogo activo
                </Button>
              </Link>
              <Link to="/solicitudes/nueva">
                <Button variant="secondary" size="md">
                  <FilePlus2 className="h-4 w-4 text-emerald-600" />
                  Proponer una rifa
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 font-semibold text-slate-700 shadow-2xs">
            <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" />
            <strong className="font-extrabold text-slate-900">{metricas.totalCausas}</strong> causas verificadas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-4 py-1.5 font-semibold text-slate-700 shadow-2xs">
            <Ticket className="h-3.5 w-3.5 text-teal-600" />
            <strong className="font-extrabold text-teal-700">{metricas.totalRifas}</strong> campañas vinculadas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/90 px-4 py-1.5 font-semibold text-slate-700 shadow-2xs">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            Meta acumulada: <strong className="font-extrabold text-emerald-700">{formatearBs(metricas.metaGlobal)}</strong>
          </span>
        </div>
      </section>

      {/* Buscador + botones de acción en la misma fila */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-xs backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar causa solidaria por nombre o impacto..."
            aria-label="Buscar causas solidarias"
            className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2 pr-9 pl-9 text-sm text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoloConRifas((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
              soloConRifas
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Con rifas activas
          </button>

          <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span>Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar causas"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="rifas">Más rifas</option>
              <option value="meta">Mayor meta</option>
            </select>
          </label>

          <Link to="/solicitudes/nueva">
            <Button size="sm">
              <FilePlus2 className="h-4 w-4" />
              Nueva campaña
            </Button>
          </Link>

          <Link to={catalogoRuta}>
            <Button variant="secondary" size="sm">
              Ver todas las rifas
            </Button>
          </Link>
        </div>
      </section>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : causas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={busqueda || soloConRifas ? 'Sin coincidencias' : 'Aún no hay causas registradas'}
          description={
            busqueda || soloConRifas
              ? 'Prueba limpiando los filtros para explorar todas las causas.'
              : 'Cuando se registren causas solidarias aparecerán aquí.'
          }
          action={
            (busqueda || soloConRifas) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setBusqueda('');
                  setSoloConRifas(false);
                }}
              >
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {causas.map((causa, idx) => {
            const cantRifas = causa.rifasCount ?? 0;
            const paleta = PALETAS_CAUSA[idx % PALETAS_CAUSA.length];
            return (
              <article
                key={causa.causaId}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row ${paleta.hoverBorder}`}
              >
                {/* Franja lateral editorial en vez de cabecera superior repetida */}
                <div
                  className={`flex shrink-0 items-center justify-between bg-gradient-to-b ${paleta.stripe} p-4 text-white sm:w-20 sm:flex-col sm:justify-center sm:gap-2 sm:py-6`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs">
                    <HeartHandshake className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-bold">
                    #{causa.causaId}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${paleta.iconBg}`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Causa verificada
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          cantRifas > 0 ? paleta.badge : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        {cantRifas} rifa(s)
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{causa.nombre}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {causa.descripcion || 'Iniciativa solidaria respaldada por sorteos públicos.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Target className="h-3.5 w-3.5 text-emerald-600" />
                        Meta solidaria
                      </p>
                      <p className="text-lg font-extrabold text-emerald-700">
                        {formatearBs(causa.meta)}
                      </p>
                    </div>

                    <Link to={`${catalogoRuta}?causaId=${causa.causaId}`}>
                      <Button size="sm">
                        Ver rifas ({cantRifas})
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && causas.length > 0 && (
        <section className="mx-auto max-w-2xl space-y-4 py-4 text-center">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              ¿Listo para apoyar una de estas causas?
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              Explora las rifas activas asociadas o envía una solicitud para impulsar un nuevo sorteo solidario.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link to={catalogoRuta}>
              <Button size="sm">
                <Ticket className="h-4 w-4" />
                Explorar catálogo
              </Button>
            </Link>
            <Link to="/solicitudes/nueva">
              <Button variant="secondary" size="sm">
                <FilePlus2 className="h-4 w-4 text-emerald-600" />
                Proponer campaña
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
