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
import { formatearBs, sumarMontosBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';

export function CausasPublicPage() {
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <HeartHandshake className="h-3.5 w-3.5" />
              Impacto social verificado y 100% trazable
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Causas solidarias con propósito real
            </h1>
            <p className="text-sm leading-relaxed text-emerald-50 sm:text-base">
              Cada rifa publicada respalda una meta concreta. Elige una causa que te inspire, revisa
              sus campañas activas y participa con números auditados en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/">
              <Button variant="secondary" className="border-0 bg-white text-emerald-800 shadow-md hover:bg-emerald-50">
                <Ticket className="h-4 w-4" />
                Explorar catálogo
              </Button>
            </Link>
            <Link to="/solicitudes/nueva">
              <Button className="bg-emerald-950/45 text-white ring-1 ring-white/25 hover:bg-emerald-950/65">
                <FilePlus2 className="h-4 w-4" />
                Proponer una rifa
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xs">
            <p className="text-xs text-emerald-100">Causas respaldadas</p>
            <p className="mt-0.5 text-xl font-extrabold">{metricas.totalCausas}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xs">
            <p className="text-xs text-emerald-100">Rifas asociadas</p>
            <p className="mt-0.5 text-xl font-extrabold">{metricas.totalRifas}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xs">
            <p className="text-xs text-emerald-100">Meta solidaria acumulada</p>
            <p className="mt-0.5 text-xl font-extrabold">{formatearBs(metricas.metaGlobal)}</p>
          </div>
        </div>
      </section>

      {/* Buscador + botones de acción en la misma fila */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
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

          <Link to="/">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {causas.map((causa) => {
            const cantRifas = causa.rifasCount ?? 0;
            return (
              <article
                key={causa.causaId}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
                        <HeartHandshake className="h-4 w-4 text-emerald-600" />
                        Causa verificada
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          cantRifas > 0
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        {cantRifas} rifa(s)
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900 transition group-hover:text-emerald-700">
                        {causa.nombre}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {causa.descripcion || 'Iniciativa solidaria respaldada por sorteos públicos.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/90 p-3.5">
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Target className="h-3.5 w-3.5 text-emerald-600" />
                          Meta solidaria
                        </p>
                        <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                          {formatearBs(causa.meta)}
                        </p>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                          Estado
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">
                          {cantRifas > 0 ? 'Campañas activas' : 'Lista para apoyar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Link to={`/?causaId=${causa.causaId}`} className="block">
                      <Button className="w-full" size="md">
                        Explorar rifas de esta causa
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
    </div>
  );
}
