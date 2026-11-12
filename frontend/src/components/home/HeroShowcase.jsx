import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FilePlus2,
  HeartHandshake,
  HelpCircle,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Ticket,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { formatearBs, formatearFechaCorta } from '../../utils/format.js';

const CARD_PALETTES = [
  'from-emerald-800 via-teal-800 to-slate-900',
  'from-slate-900 via-emerald-900 to-teal-950',
  'from-teal-800 via-emerald-700 to-emerald-950',
  'from-amber-800 via-orange-900 to-slate-950',
  'from-cyan-900 via-slate-900 to-emerald-950',
];

export function CauseMarqueeTicker({ causas = [], onSelectCausa, fullBleed = true }) {
  const items = useMemo(() => {
    if (!causas || causas.length === 0) return [];
    return causas.map((c, idx) => ({
      causaId: c.causaId,
      code: String(idx + 1).padStart(2, '0'),
      nombre: c.nombre,
      rifasCount: c.rifasCount ?? 0,
      meta: c.meta,
    }));
  }, [causas]);

  if (items.length === 0) return null;

  const looped = [...items, ...items, ...items, ...items];

  return (
    <section
      aria-label="Causas verificadas en plataforma"
      className={`marquee-wrapper overflow-hidden border-y border-emerald-950/30 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 py-4 shadow-md ${
        fullBleed
          ? 'relative left-1/2 w-screen -translate-x-1/2'
          : '-mx-4 sm:-mx-6 lg:-mx-8'
      }`}
    >
      <div className="animate-marquee items-center gap-4 px-4">
        {looped.map((c, idx) => (
          <button
            key={`${c.code}-${idx}`}
            type="button"
            onClick={() => {
              if (c.causaId && onSelectCausa) {
                onSelectCausa(String(c.causaId));
                document.getElementById('catalogo-activo')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex min-w-[245px] shrink-0 items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-2.5 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold uppercase tracking-tight text-slate-900">
                <span className="mr-1 text-emerald-700">{c.code}</span>
                {c.nombre}
              </p>
              <p className="truncate text-[11px] font-medium text-slate-500">
                {c.meta ? `Meta: ${formatearBs(c.meta)}` : `${c.rifasCount} rifa(s) asociadas`}
              </p>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-700">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Causa verificada
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HeroShowcase({
  rifas = [],
  causas = [],
  resumenPublico = null,
  loadingRifas = false,
  onSelectCausa,
}) {
  const navigate = useNavigate();
  const [centerIndex, setCenterIndex] = useState(2);
  const [isCompactScreen, setIsCompactScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    function onResize() {
      setIsCompactScreen(window.innerWidth < 640);
    }
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cards = useMemo(() => {
    return rifas.slice(0, 5).map((r, idx) => ({
      id: r.rifaId,
      rifaId: r.rifaId,
      nombre: r.nombre,
      causa: r.causa,
      premios: r.premios || [],
      precioTicket: r.precioTicket,
      ticketsDisponibles: r.ticketsDisponibles ?? 0,
      cantidadTickets: r.cantidadTickets || 100,
      estado: r.estado || 'ACTIVA',
      fechaFin: r.fechaFin,
      palette: CARD_PALETTES[idx % CARD_PALETTES.length],
    }));
  }, [rifas]);

  const metricas = resumenPublico?.metricas;
  const activeIdx = cards.length > 0 ? Math.min(centerIndex, cards.length - 1) : 0;
  const fanStepX = isCompactScreen ? 56 : 86;

  return (
    <div className="space-y-12">
      {/* Hero abierto sin caja envolvente innecesaria + Tarjetas verticales de rifas */}
      <section className="relative py-2 sm:py-6">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Columna Izquierda: Titular, Subtítulo, CTAs y Prueba Social */}
          <div className="space-y-6 text-center lg:col-span-6 lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Plataforma auditada · Bolivia
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl xl:text-[56px]">
              La transparencia
              <br />
              que tu causa{' '}
              <span className="relative inline-block text-emerald-700">
                necesita
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 18"
                  className="absolute -bottom-2 left-0 w-full text-amber-400"
                  fill="none"
                >
                  <path
                    d="M3 12C55 4 148 3 217 11"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0">
              <strong className="font-bold text-slate-900">Rifas Solidarias</strong> es una
              plataforma de campañas y sorteos digitales auditados, diseñada para apoyar causas
              reales con reservas instantáneas de 15 minutos y verificación transparente de pagos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 lg:justify-start">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('catalogo-activo')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:brightness-105 cursor-pointer"
              >
                <Ticket className="h-4 w-4" />
                Ver rifas activas
              </button>

              <Link
                to="/causas"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800"
              >
                <HeartHandshake className="h-4 w-4" />
                Ver causas
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                    <HeartHandshake className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {metricas
                    ? `${metricas.participantesActivos} participantes · ${metricas.ticketsVendidosTotal} tickets vendidos · ${metricas.causasActivas} causas verificadas`
                    : rifas.length > 0 || causas.length > 0
                      ? `${rifas.length} rifas activas · ${causas.length} causas verificadas`
                      : 'Cargando estadísticas en vivo...'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80">
                <Lock className="h-3 w-3 text-emerald-600" />
                Sin doble reserva
              </span>
            </div>
          </div>

          {/* Columna Derecha: Carteles / Rifas en Vertical */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto flex h-[390px] max-w-[560px] items-center justify-center overflow-hidden sm:h-[430px] sm:overflow-visible">
              {loadingRifas && cards.length === 0 ? (
                <div className="flex h-[370px] w-[264px] flex-col justify-between rounded-[24px] border border-emerald-200 bg-white/90 p-5 shadow-xl">
                  <div className="h-32 animate-pulse rounded-2xl bg-emerald-100/70" />
                  <div className="space-y-2.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-10 animate-pulse rounded-xl bg-emerald-100/60" />
                </div>
              ) : cards.length === 0 ? (
                <div className="flex h-[370px] w-[280px] flex-col items-center justify-center gap-4 rounded-[24px] border border-emerald-200 bg-white/95 p-6 text-center shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <HeartHandshake className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-900">
                      Próximas campañas solidarias
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Explora nuestras causas verificadas o solicita organizar una nueva rifa.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/causas"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      Ver causas activas
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/solicitudes/nueva"
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Organizar una rifa
                    </Link>
                  </div>
                </div>
              ) : (
                cards.map((card, idx) => {
                const offset = idx - activeIdx;
                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                const translateX = offset * fanStepX;
                const translateY = absOffset * 14;
                const scale = isCenter ? 1 : Math.max(0.76, 1 - absOffset * 0.11);
                const zIndex = 30 - absOffset * 5;
                const opacity = absOffset > 2 ? 0 : isCenter ? 1 : absOffset === 1 ? 0.92 : 0.72;
                const premioPrincipal = card.premios?.[0]?.nombre;

                const pctAvance =
                  100 -
                  Math.min(
                    100,
                    Math.round(
                      ((card.ticketsDisponibles ?? 0) / Math.max(1, card.cantidadTickets)) * 100
                    )
                  );

                return (
                  <div
                    key={`${card.id}-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!isCenter) {
                        setCenterIndex(idx);
                      } else if (card.rifaId) {
                        navigate(`/rifas/${card.rifaId}`);
                      } else {
                        document
                          .getElementById('catalogo-activo')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isCenter) setCenterIndex(idx);
                        else if (card.rifaId) navigate(`/rifas/${card.rifaId}`);
                      }
                    }}
                    style={{
                      transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                      zIndex,
                      opacity,
                    }}
                    className={`absolute flex h-[356px] w-[198px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-b ${card.palette} text-white shadow-2xl transition-all duration-300 cursor-pointer sm:h-[396px] sm:w-[224px] ${
                      isCenter
                        ? 'ring-3 ring-emerald-400 shadow-emerald-950/40'
                        : 'ring-2 ring-white/80 hover:ring-amber-300'
                    }`}
                  >
                    {/* Cabecera visual vertical tipo cartel/póster de rifa */}
                    <div className="relative flex flex-col justify-between bg-black/20 px-4 pt-3.5 pb-4">
                      <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          {card.estado === 'FINALIZADA' ? 'Sorteada' : 'Activa'}
                        </span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs">
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        </span>
                      </div>

                      {/* Ilustración vertical de premio / boleto */}
                      <div className="mt-3 flex flex-col items-center py-1 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/25 backdrop-blur-xs sm:h-20 sm:w-20">
                          <Ticket className="h-8 w-8 text-amber-300 sm:h-9 sm:w-9" />
                          <span className="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm ring-2 ring-slate-900/40">
                            <Award className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <span className="mt-2.5 inline-flex max-w-full items-center gap-1 truncate rounded-full bg-white/12 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                          <HeartHandshake className="h-3 w-3 shrink-0" />
                          <span className="truncate">{card.causa?.nombre || 'Causa Solidaria'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Muesca divisoria horizontal de ticket */}
                    <div className="relative flex items-center">
                      <span className="h-4 w-2 rounded-r-full bg-slate-50/95" />
                      <div className="mx-1.5 flex-1 border-t border-dashed border-white/30" />
                      <span className="h-4 w-2 rounded-l-full bg-slate-50/95" />
                    </div>

                    {/* Cuerpo vertical de detalle */}
                    <div className="flex flex-1 flex-col justify-between px-4 pt-2 pb-4">
                      <div className="space-y-1.5 text-center">
                        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">
                          {card.nombre}
                        </h3>
                        {premioPrincipal && (
                          <p className="inline-flex max-w-full items-center justify-center gap-1 truncate rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                            <Award className="h-3 w-3 shrink-0 text-amber-300" />
                            <span className="truncate">{premioPrincipal}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl bg-black/25 p-2.5 backdrop-blur-xs">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-medium text-slate-300">Ticket</span>
                            <span className="text-base font-extrabold text-amber-300">
                              {formatearBs(card.precioTicket)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
                              style={{ width: `${Math.max(12, pctAvance)}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
                            <span>{card.ticketsDisponibles} disp.</span>
                            <span>{pctAvance}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="truncate text-[10px] font-medium text-slate-200">
                            {card.fechaFin ? `Cierra ${formatearFechaCorta(card.fechaFin)}` : 'Reserva 15 min'}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-slate-900">
                            {isCenter ? 'Participar' : 'Ver'}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>

            {/* Controles e indicadores del showcase vertical */}
            {cards.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCenterIndex((cur) => (cur - 1 + cards.length) % cards.length)}
                aria-label="Rifa anterior"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-emerald-300 hover:text-emerald-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {cards.map((c, idx) => (
                  <button
                    key={`dot-${c.id}-${idx}`}
                    type="button"
                    onClick={() => setCenterIndex(idx)}
                    aria-label={`Destacar rifa ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIdx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCenterIndex((cur) => (cur + 1) % cards.length)}
                aria-label="Siguiente rifa"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-emerald-300 hover:text-emerald-700 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Banner Marquee Deslizante en Pantalla Completa */}
      <CauseMarqueeTicker causas={causas} onSelectCausa={onSelectCausa} fullBleed />

      {/* Cómo funciona: 4 pasos simples con cabecera centrada */}
      <section id="como-funciona" className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/80">
            Proceso simple en 4 pasos
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Cómo participar de forma segura
          </h2>
          <button
            type="button"
            onClick={() =>
              document.getElementById('garantias')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Ver garantías del sistema
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Paso 01
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                Elige tus números
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Selecciona tus boletos disponibles en el tablero en vivo o al azar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm transition hover:border-amber-300 hover:shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Paso 02
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                Reserva 15 minutos
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Bloqueo atómico sin colisiones mientras envías tu comprobante.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm transition hover:border-sky-300 hover:shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                Paso 03
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                Pago verificado
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Validación manual con auditoría y notificación inmediata.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm transition hover:border-rose-300 hover:shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Paso 04
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                Sorteo auditable
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Solo tickets aprobados participan y el alias ganador es público.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CausasDestacadasSection({ causas = [], onSelectCausa }) {
  const destacadas = causas.slice(0, 3);

  return (
    <section id="causas-destacadas" className="space-y-6 pt-4">
      <div className="mx-auto max-w-2xl space-y-2.5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
          <HeartHandshake className="h-3.5 w-3.5" />
          Impacto social verificado
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Causas que transforman realidades
        </h2>
        <p className="text-sm text-slate-600">
          Cada ticket vendido respalda una causa aprobada con metas claras y trazabilidad pública.
        </p>
        <div className="pt-1">
          <Link
            to="/causas"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-extrabold text-emerald-800 shadow-2xs transition hover:bg-emerald-50"
          >
            Ver todas las causas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {destacadas.length === 0 ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">
              Explora el directorio completo de causas solidarias
            </p>
            <p className="text-xs text-slate-600">
              Consulta las metas, campañas activas y propuestas comunitarias disponibles en la plataforma.
            </p>
          </div>
          <Link
            to="/causas"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
          >
            Ir al directorio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {destacadas.map((causa) => {
            const cantRifas = causa.rifasCount ?? 0;
            return (
              <article
                key={causa.causaId}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Verificada
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      <Ticket className="h-3 w-3 text-emerald-600" />
                      {cantRifas} rifa(s)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700">
                      {causa.nombre}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {causa.descripcion || 'Iniciativa solidaria respaldada por sorteos auditados.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3.5">
                  <div>
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <Target className="h-3 w-3 text-emerald-600" />
                      Meta
                    </p>
                    <p className="text-sm font-extrabold text-emerald-700">
                      {formatearBs(causa.meta)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCausa) {
                        onSelectCausa(String(causa.causaId));
                        document
                          .getElementById('catalogo-activo')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-slate-200 transition hover:bg-emerald-600 hover:text-white hover:ring-emerald-600 cursor-pointer"
                  >
                    Filtrar rifas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function GarantiasSection() {
  const garantias = [
    {
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
      title: 'Reservas atómicas de 15 min',
      desc: 'Bloqueo transaccional en base de datos para que dos personas nunca puedan tomar el mismo número al mismo tiempo.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700',
      title: 'Pagos validados con respaldo',
      desc: 'Cada transferencia bancaria o QR se registra con número de referencia y pasa por verificación administrativa antes de emitir el ticket vendido.',
    },
    {
      icon: Eye,
      color: 'bg-sky-100 text-sky-700',
      title: 'Privacidad por alias público',
      desc: 'En el tablero de resultados y ganadores se publica únicamente tu alias elegido, protegiendo tu correo, nombre completo y teléfono.',
    },
    {
      icon: Lock,
      color: 'bg-indigo-100 text-indigo-700',
      title: 'Auditoría y entrega trazable',
      desc: 'Aprobaciones, pagos, sorteos y entregas de premios quedan guardados con fecha, hora y actor en bitácora inmutable.',
    },
  ];

  return (
    <section id="garantias" className="space-y-6 pt-4">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Garantías del sistema
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Transparencia técnica en cada boleto y sorteo
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Nuestra arquitectura protege a participantes y organizadores, asegurando equidad real desde la reserva hasta la entrega del premio.
        </p>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {garantias.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.title}
                className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${g.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-slate-900">{g.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{g.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/90 p-6 text-slate-900 shadow-sm lg:col-span-5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            Ciclo de confianza verificado
          </div>

          <h3 className="text-xl font-extrabold leading-snug text-slate-900">
            Solo los tickets con pago aprobado participan en el sorteo oficial
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Tablero sincronizado en vivo cada pocos segundos con estados claros: Disponible,
                Reservado y Vendido.
              </span>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                Liberación automática tras 15 minutos si una reserva no registra comprobante de pago.
              </span>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <span>
                URL pública por campaña para auditar premios entregados y ganadores por alias.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-emerald-200/70 pt-4">
          <Link
            to="/registro"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-xs transition hover:brightness-105"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Crear cuenta
          </Link>
          <Link
            to="/causas"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Ver causas
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}

export function LandingFinalCta() {
  return (
    <section className="py-6 text-center text-slate-900">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            Comienza hoy mismo
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            ¿Listo para elegir tus números y apoyar una causa real?
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Regístrate gratis en menos de un minuto para reservar boletos con seguridad, validar pagos y seguir sorteos auditados.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <UserPlus className="h-4 w-4" />
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/causas"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-emerald-800 shadow-2xs transition hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
            Explorar causas
          </Link>
        </div>
      </div>
    </section>
  );
}

export function UltimosSorteosSection({ sorteos = [] }) {
  if (!sorteos.length) return null;

  return (
    <section id="ultimos-sorteos" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            Resultados reales verificados
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Últimos sorteos auditados y ganadores
          </h2>
          <p className="text-sm text-slate-600">
            Ganadores publicados desde nuestra base de datos protegidos con alias público e iniciales.
          </p>
        </div>
        <Link
          to="/explorar"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Ver rifas activas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorteos.map((sorteo) => (
          <article
            key={sorteo.sorteoId}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <HeartHandshake className="h-3 w-3" />
                  {sorteo.causa?.nombre || 'Causa verificada'}
                </span>
                {sorteo.premioPrincipal ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      sorteo.premioPrincipal.reclamado
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {sorteo.premioPrincipal.reclamado ? 'Premio entregado' : 'Entrega en curso'}
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">{sorteo.nombreRifa}</h3>
                {sorteo.premioPrincipal && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {sorteo.premioPrincipal.nombre}
                      {sorteo.premiosCount > 1 ? ` (+${sorteo.premiosCount - 1} más)` : ''}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-extrabold text-white">
                    {sorteo.ganador?.iniciales || 'RF'}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Ganador verificado
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">
                      {sorteo.ganador?.alias ? `@${sorteo.ganador.alias}` : 'Participante'}
                    </p>
                  </div>
                </div>
                {sorteo.numeroGanadorPrincipal !== null &&
                  sorteo.numeroGanadorPrincipal !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Ticket ganador
                      </p>
                      <span className="inline-block rounded-lg bg-amber-100 px-2.5 py-0.5 font-mono text-sm font-extrabold text-amber-900">
                        #{sorteo.numeroGanadorPrincipal}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500">
                Sorteado el {formatearFechaCorta(sorteo.fechaSorteo)}
              </span>
              <Link
                to={`/rifas/${sorteo.rifaId}/resultado`}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800"
              >
                Ver resultado
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: '¿Cómo funciona la reserva temporal de 15 minutos?',
    a: 'Cuando seleccionas tus números en una rifa activa y confirmas la reserva, el sistema bloquea esos boletos de forma atómica exclusivamente para ti durante 15 minutos, evitando que otra persona los tome mientras realizas y subes tu comprobante de pago.',
  },
  {
    q: '¿Qué métodos de pago se aceptan y cuánto tarda la verificación?',
    a: 'Puedes registrar transferencias bancarias, pagos QR o efectivo indicando tu número de referencia. Nuestro equipo administrativo verifica cada comprobante y recibirás una notificación automática en tu perfil cuando tus tickets pasen a estado VENDIDO.',
  },
  {
    q: '¿Puedo elegir números al azar o liberar una reserva?',
    a: 'Sí. En el tablero de cada rifa puedes usar los botones "+1", "+3" o "+5" para seleccionar números disponibles al azar, y si ya confirmaste una reserva antes de pagar, puedes liberarla manualmente desde el modal de pago o desde "Mis tickets".',
  },
  {
    q: '¿Qué necesito para organizar una rifa solidaria?',
    a: 'Solo crea una cuenta gratuita, ingresa a "Organizar rifa" y completa el formulario indicando el nombre de la campaña, la causa solidaria, el precio por ticket, la cantidad de números y la fecha de cierre. Una vez aprobada por administración, podrás cargar los premios y publicarla.',
  },
  {
    q: '¿Cómo se protege mi privacidad en los resultados públicos?',
    a: 'En la pantalla pública de resultados y ganadores únicamente se muestra tu alias público junto al número ganador y el premio adjudicado. Tus datos personales y de contacto se mantienen privados.',
  },
];

export function PlatformContentSection({ totalRifas = 0, totalCausas = 0, metricas = null }) {
  const [openFaq, setOpenFaq] = useState(0);
  const rifasCount = metricas?.rifasActivas ?? totalRifas;
  const causasCount = metricas?.causasActivas ?? totalCausas;

  return (
    <div className="space-y-12 pt-4">
      {/* Beneficios por perfil sin contenedor blanco externo redundante */}
      <section id="beneficios-plataforma" className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            Ecosistema solidario completo
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Diseñado para participantes, organizadores y causas reales
          </h2>
          <p className="text-sm text-slate-600">
            Cada rol cuenta con herramientas claras para participar, recaudar y verificar sorteos en tiempo real.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-700">
              <strong className="font-extrabold">{rifasCount}</strong> rifas activas
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-amber-700">
              <strong className="font-extrabold">{causasCount}</strong> causas activas
            </span>
            {metricas && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-teal-700">
                  <strong className="font-extrabold">{metricas.ticketsVendidosTotal}</strong> tickets vendidos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-slate-700">
                  <strong className="font-extrabold">{metricas.premiosEntregados}</strong> premios entregados
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-md">
            <div className="space-y-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">Para Participantes</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Explora números disponibles al instante, bloquea tus boletos favoritos por 15
                minutos y sigue el estado de tus pagos y sorteos desde tu espacio personal.
              </p>
            </div>
            <Link
              to="/registro"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Crear cuenta gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>

          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-sm transition hover:border-amber-300 hover:shadow-md">
            <div className="space-y-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">Para Organizadores</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Solicita campañas en minutos, configura múltiples premios, monitorea el avance de
                ventas en vivo y ejecuta sorteos transparentes con entrega registrada.
              </p>
            </div>
            <Link
              to="/solicitudes/nueva"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Solicitar nueva rifa
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>

          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-sm transition hover:border-teal-300 hover:shadow-md">
            <div className="space-y-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">Para Causas Verificadas</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Cada recaudación confirmada se vincula a una causa social aprobada, con metas
                visibles y reportes ejecutivos auditables en todo momento.
              </p>
            </div>
            <Link
              to="/causas"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              Explorar directorio de causas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        </div>
      </section>

      {/* Preguntas Frecuentes Interactivas */}
      <section id="preguntas-frecuentes" className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            Centro de dudas
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Resolvemos las consultas más habituales sobre reservas, pagos, sorteos y creación de campañas solidarias.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new window.CustomEvent('open-help-widget'))}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-sm shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              Chatear con RifaBot
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-2.5">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? 'border-emerald-300 bg-white shadow-sm'
                    : 'border-slate-200/90 bg-white/90 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-emerald-100 px-5 pt-3 pb-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
