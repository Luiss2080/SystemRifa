import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Check, CheckCircle2, Clock, Share2, Trophy } from 'lucide-react';
import { getResultadoRifa } from '../features/rifas/publicApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { formatearBs, formatearFecha } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export function ResultadoPublicoPage() {
  const { id } = useParams();
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['rifa-resultado', id],
    queryFn: () => getResultadoRifa(id),
    retry: false,
  });

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      toast.success('Enlace copiado', 'Puedes compartir el resultado transparente del sorteo.');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.info('Copia la URL', 'Copia la dirección del navegador para compartir.');
    }
  }

  if (isLoading) return <FullPageSpinner message="Cargando resultados del sorteo..." />;

  if (error) {
    const apiErr = extraerErrorApi(error);
    return (
      <EmptyState
        icon={Trophy}
        title="Resultado aún no disponible"
        description={apiErr.message}
        action={
          <Link to={`/rifas/${id}`}>
            <Button variant="secondary">Volver a la rifa</Button>
          </Link>
        }
      />
    );
  }

  const { rifa, sorteo, premios } = data;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/80 shadow-2xs">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {rifa.nombre}
                </h1>
                <Badge estado={rifa.estado} />
              </div>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Causa solidaria: <strong className="text-slate-700">{rifa.causa?.nombre}</strong>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={copiarEnlace}>
              {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              {copiado ? 'Enlace copiado' : 'Compartir resultado'}
            </Button>
            <Link to={`/rifas/${id}`}>
              <Button variant="secondary" size="sm">
                Volver al detalle
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {sorteo ? (
        <section className="animate-modal-in rounded-3xl bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Trophy className="h-3.5 w-3.5" />
                Sorteo oficial realizado el {formatearFecha(sorteo.fecha)}
              </span>
              <h2 className="text-2xl font-bold">
                Ticket ganador principal: #{sorteo.numeroGanadorPrincipal}
              </h2>
              <p className="text-sm text-amber-50">
                Ganador: <strong>{sorteo.ganadorPrincipal?.alias}</strong> (
                {sorteo.ganadorPrincipal?.iniciales})
              </p>
              {sorteo.observacion && (
                <p className="mt-2 rounded-lg bg-black/15 px-3 py-2 text-xs text-white/95">
                  Observación: {sorteo.observacion}
                </p>
              )}
            </div>
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-amber-600 shadow-md ring-4 ring-white/30">
              <span className="text-[11px] font-semibold uppercase">Ticket N°</span>
              <span className="text-3xl font-extrabold">{sorteo.numeroGanadorPrincipal}</span>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Esta rifa finalizó sin sorteo registrado (sin tickets vendidos).
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Detalle de premios y ganadores</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {premios.map((p, idx) => (
            <div
              key={p.premioId}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-amber-300"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-400">
                        Premio #{idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900">{p.nombre}</h3>
                    </div>
                  </div>
                  {p.valor && (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {formatearBs(p.valor)}
                    </span>
                  )}
                </div>
                {p.descripcion && <p className="text-sm text-slate-600">{p.descripcion}</p>}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
                {p.numeroTicketGanador ? (
                  <>
                    <div>
                      <span className="text-slate-500">Ticket:</span>{' '}
                      <strong className="text-slate-900">#{p.numeroTicketGanador}</strong> ·{' '}
                      <span className="font-medium text-emerald-700">
                        {p.ganador?.alias} ({p.ganador?.iniciales})
                      </span>
                    </div>
                    <Badge color={p.reclamado ? 'emerald' : 'amber'}>
                      {p.reclamado ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Entregado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Por entregar
                        </span>
                      )}
                    </Badge>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Sin ticket ganador asignado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
