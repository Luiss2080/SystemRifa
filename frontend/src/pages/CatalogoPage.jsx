import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, HeartHandshake, Ticket, Trophy } from 'lucide-react';
import { getCatalogoRifas, getCausasPublicas } from '../features/rifas/publicApi.js';
import { formatearBs, formatearFechaCorta } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { Select } from '../components/ui/Select.jsx';

export function CatalogoPage() {
  const [causaId, setCausaId] = useState('');
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

  const causasOpciones = (causasData?.items || []).map((c) => ({
    value: String(c.causaId),
    label: c.nombre,
  }));

  const rifas = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <HeartHandshake className="h-3.5 w-3.5" />
              Apoyo directo y sorteos transparentes
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Rifas solidarias activas
            </h1>
            <p className="text-sm text-emerald-50 sm:text-base">
              Elige tus números favoritos, apoya una causa social y sigue cada pago y sorteo con transparencia.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/causas">
              <Button variant="secondary" className="border-0 bg-white text-emerald-800 hover:bg-emerald-50">
                Ver causas solidarias
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Catálogo disponible</h2>
          <p className="text-xs text-slate-500">
            Mostrando rifas abiertas para reserva y compra de tickets
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Select
            label="Filtrar por causa"
            placeholder="Todas las causas"
            options={causasOpciones}
            value={causaId}
            onChange={(e) => {
              setCausaId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <FullPageSpinner message="Cargando rifas disponibles..." />
      ) : isError ? (
        <EmptyState
          icon={Ticket}
          title="No se pudo cargar el catálogo"
          description="Verifica tu conexión o intenta recargar la página."
        />
      ) : rifas.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No hay rifas activas para este filtro"
          description="Prueba seleccionando otra causa solidaria o vuelve más tarde."
          action={
            causaId && (
              <Button variant="secondary" onClick={() => setCausaId('')}>
                Ver todas las causas
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rifas.map((rifa) => {
              const disponibles = rifa.ticketsDisponibles ?? 0;
              const pctDisponible = Math.min(
                100,
                Math.round((disponibles / Math.max(1, rifa.cantidadTickets)) * 100)
              );

              return (
                <article
                  key={rifa.rifaId}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        {rifa.causa?.nombre || 'Causa solidaria'}
                      </span>
                      <Badge estado={rifa.estado} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{rifa.nombre}</h3>
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

                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${100 - pctDisponible}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Cierre: {formatearFechaCorta(rifa.fechaFin)}
                        </span>
                        <span>{100 - pctDisponible}% avanzado</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link to={`/rifas/${rifa.rifaId}`} className="flex-1">
                      <Button className="w-full">Elegir números</Button>
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

