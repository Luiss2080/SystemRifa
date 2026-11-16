import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  Lock,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
} from 'lucide-react';
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
  const entregadosCount = (premios || []).filter((p) => p.reclamado).length;

  return (
    <div className="space-y-8 py-2 sm:py-4">
      {/* 1. Cabecera comercial de la rifa */}
      <section className="overflow-hidden rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 ring-4 ring-amber-100">
              <Trophy className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Acta Oficial de Sorteo
                </span>
                <Badge estado={rifa.estado} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {rifa.nombre}
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Causa solidaria:{' '}
                <strong className="text-slate-800">{rifa.causa?.nombre || 'Iniciativa Solidaria'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <Button variant="secondary" size="sm" onClick={copiarEnlace}>
              {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              {copiado ? 'Enlace copiado' : 'Compartir resultado'}
            </Button>
            <Link to={`/rifas/${id}`}>
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Volver a la rifa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Gran tarjeta de felicitación y ticket ganador principal */}
      {sorteo ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-6 text-slate-950 shadow-xl shadow-amber-500/20 sm:p-10">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-950 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Sorteo oficial verificado
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                ¡Boleto Ganador: #{sorteo.numeroGanadorPrincipal}!
              </h2>
              <p className="text-sm font-semibold text-amber-950/90 sm:text-base">
                Alias de usuario: <strong className="text-slate-950 underline decoration-white/70">{sorteo.ganadorPrincipal?.alias}</strong>{' '}
                <span className="text-xs text-amber-900">({sorteo.ganadorPrincipal?.iniciales})</span>
              </p>
              <p className="text-xs font-medium text-amber-900">
                Sorteado el {formatearFecha(sorteo.fecha)} bajo protocolo de auditoría inmutable.
              </p>
              {sorteo.observacion && (
                <p className="mt-2 inline-block rounded-xl bg-black/10 px-3.5 py-1.5 text-xs font-medium text-amber-950 backdrop-blur-xs">
                  Observación de auditoría: {sorteo.observacion}
                </p>
              )}
            </div>

            {/* Insignia visual gigante del ticket ganador */}
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-3xl bg-white text-slate-950 shadow-2xl ring-4 ring-white/40 sm:h-32 sm:w-32">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Ticket N°
              </span>
              <span className="text-4xl font-black text-amber-600 sm:text-5xl">
                {sorteo.numeroGanadorPrincipal}
              </span>
              <span className="text-[10px] font-bold text-slate-500">Premio Mayor</span>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-600">
            Esta rifa finalizó sin sorteo registrado (sin tickets con pago confirmado).
          </p>
        </div>
      )}

      {/* 3. Métricas públicas de auditoría (estilo comercial y transparente) */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Trophy className="h-5 w-5" />
          </span>
          <p className="text-xs font-medium text-slate-500">Boleto Ganador Principal</p>
          <p className="text-xl font-extrabold text-slate-900">
            {sorteo ? `#${sorteo.numeroGanadorPrincipal}` : '—'}
          </p>
          <p className="text-xs font-bold text-emerald-700">
            {sorteo?.ganadorPrincipal?.alias || 'Sin ganador'}
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 space-y-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Award className="h-5 w-5" />
          </span>
          <p className="text-xs font-medium text-slate-500">Total Premios Sorteados</p>
          <p className="text-xl font-extrabold text-slate-900">{premios.length}</p>
          <p className="text-xs font-bold text-sky-700">Incentivos certificados</p>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 space-y-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="text-xs font-medium text-slate-500">Estado de Entrega</p>
          <p className="text-xl font-extrabold text-slate-900">
            {entregadosCount} / {premios.length}
          </p>
          <p className="text-xs font-bold text-teal-700">
            {entregadosCount === premios.length ? '100% Entregados' : 'Entregas en proceso'}
          </p>
        </div>
      </section>

      {/* 4. Lista detallada de todos los premios y sus ganadores */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Adjudicación de premios
          </span>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            Detalle de premios y boletos adjudicados
          </h2>
          <p className="text-xs text-slate-600 sm:text-sm">
            Para proteger la privacidad de los participantes, solo se publican alias y las iniciales de sus nombres.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {premios.map((p, idx) => (
            <article
              key={p.premioId}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                      <Award className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Premio #{idx + 1}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">{p.nombre}</h3>
                    </div>
                  </div>

                  {p.valor && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                      Valor: {formatearBs(p.valor)}
                    </span>
                  )}
                </div>

                {p.descripcion && (
                  <p className="text-xs leading-relaxed text-slate-600">{p.descripcion}</p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
                {p.numeroTicketGanador ? (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-slate-500">Boleto asignado:</p>
                      <p className="font-extrabold text-slate-900">
                        <span className="text-sm font-black text-emerald-700">#{p.numeroTicketGanador}</span>{' '}
                        · Ganador: <strong className="text-slate-900">{p.ganador?.alias}</strong>{' '}
                        <span className="text-slate-400">({p.ganador?.iniciales})</span>
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        p.reclamado
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.reclamado ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Premio entregado
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Entrega en trámite
                        </>
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-xs italic text-slate-400">Sin boleto ganador asignado</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Garantía de Privacidad y Trazabilidad */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <Lock className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Protección de Datos y Trazabilidad Auditada
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              Cada número participante en este sorteo corresponde a una reserva con comprobante de pago
              verificado. Los datos personales sensibles permanecen cifrados y solo el alias público es revelado.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
