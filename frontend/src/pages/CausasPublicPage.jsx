import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { getCausasPublicas } from '../features/rifas/publicApi.js';
import { formatearBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';

export function CausasPublicPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  if (isLoading) return <FullPageSpinner message="Cargando causas solidarias..." />;

  const causas = data?.items || [];

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

      {causas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="Aún no hay causas registradas"
          description="Cuando se registren causas solidarias aparecerán aquí."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {causas.map((causa) => (
            <article
              key={causa.causaId}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{causa.nombre}</h2>
                <p className="text-sm text-slate-600">{causa.descripcion}</p>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Meta solidaria</span>
                  <span className="font-bold text-emerald-700">{formatearBs(causa.meta)}</span>
                </div>
                {causa.rifasCount !== undefined && (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Rifas asociadas</span>
                    <span className="font-semibold text-slate-700">{causa.rifasCount}</span>
                  </div>
                )}
                <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  Explorar rifas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
