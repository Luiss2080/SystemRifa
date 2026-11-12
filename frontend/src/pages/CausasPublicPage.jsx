import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, HeartHandshake, Search, Target, X } from 'lucide-react';
import { getCausasPublicas } from '../features/rifas/publicApi.js';
import { formatearBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';

export function CausasPublicPage() {
  const [busqueda, setBusqueda] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const causasBase = useMemo(() => data?.items || [], [data]);
  const causas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return causasBase;
    return causasBase.filter(
      (c) => c.nombre?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q)
    );
  }, [causasBase, busqueda]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Causas solidarias</h1>
          <p className="text-sm text-slate-500">
            Conoce las causas beneficiarias respaldadas por nuestras rifas activas
          </p>
        </div>
        <Link to="/">
          <Button variant="secondary">Volver al catálogo</Button>
        </Link>
      </div>

      {causasBase.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar causa solidaria..."
            aria-label="Buscar causas solidarias"
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm text-slate-800 shadow-xs transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
      )}

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : causas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={busqueda ? 'Sin coincidencias' : 'Aún no hay causas registradas'}
          description={
            busqueda
              ? 'Prueba buscando con otro término.'
              : 'Cuando se registren causas solidarias aparecerán aquí.'
          }
          action={
            busqueda && (
              <Button variant="secondary" onClick={() => setBusqueda('')}>
                Limpiar búsqueda
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {causas.map((causa) => (
            <article
              key={causa.causaId}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  {causa.rifasCount !== undefined && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {causa.rifasCount} rifa(s)
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 transition group-hover:text-emerald-700">
                  {causa.nombre}
                </h2>
                <p className="text-sm text-slate-600">{causa.descripcion}</p>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-emerald-800">
                    <Target className="h-4 w-4" />
                    Meta solidaria
                  </span>
                  <span className="font-bold text-emerald-800">{formatearBs(causa.meta)}</span>
                </div>
                <Link
                  to={`/?causaId=${causa.causaId}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Ver rifas de esta causa <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
