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
  UserPlus,
  Users,
} from 'lucide-react';
import { formatearBs, formatearFechaCorta } from '../../utils/format.js';

const FALLBACK_CARDS = [
  {
    id: 'demo-1',
    nombre: 'Gran Rifa Solidaria Pro-Salud',
    causa: { nombre: 'Salud Comunitaria' },
    precioTicket: 20,
    ticketsDisponibles: 64,
    cantidadTickets: 100,
    estado: 'ACTIVA',
    fechaFin: null,
    isDemo: true,
    palette: 'from-emerald-700 via-teal-700 to-emerald-900',
  },
  {
    id: 'demo-2',
    nombre: 'Kit Robótica y Becas Escolares',
    causa: { nombre: 'Educación Digital' },
    precioTicket: 15,
    ticketsDisponibles: 42,
    cantidadTickets: 100,
    estado: 'ACTIVA',
    fechaFin: null,
    isDemo: true,
    palette: 'from-slate-800 via-slate-900 to-emerald-950',
  },
  {
    id: 'demo-3',
    nombre: 'Campaña Equipamiento Infantil',
    causa: { nombre: 'Niñez Protegida' },
    precioTicket: 25,
    ticketsDisponibles: 58,
    cantidadTickets: 100,
    estado: 'ACTIVA',
    fechaFin: null,
    isDemo: true,
    palette: 'from-teal-700 via-emerald-800 to-slate-900',
  },
  {
    id: 'demo-4',
    nombre: 'Rifa Tecnológica Universitaria',
    causa: { nombre: 'Talento Joven' },
    precioTicket: 10,
    ticketsDisponibles: 75,
    cantidadTickets: 100,
    estado: 'ACTIVA',
    fechaFin: null,
    isDemo: true,
    palette: 'from-amber-700 via-orange-800 to-slate-900',
  },
  {
    id: 'demo-5',
    nombre: 'Apoyo Refugio Esperanza',
    causa: { nombre: 'Bienestar Animal' },
    precioTicket: 12,
    ticketsDisponibles: 80,
    cantidadTickets: 100,
    estado: 'ACTIVA',
    fechaFin: null,
    isDemo: true,
    palette: 'from-emerald-800 via-cyan-900 to-slate-950',
  },
];

const CARD_PALETTES = [
  'from-emerald-800 via-teal-800 to-slate-900',
  'from-slate-900 via-emerald-900 to-teal-950',
  'from-teal-800 via-emerald-700 to-emerald-950',
  'from-amber-800 via-orange-900 to-slate-950',
  'from-cyan-900 via-slate-900 to-emerald-950',
];

export function CauseMarqueeTicker({ causas = [], onSelectCausa }) {
  const items = useMemo(() => {
    if (causas.length > 0) {
      return causas.map((c, idx) => ({
        causaId: c.causaId,
        code: String(idx + 1).padStart(2, '0'),
        nombre: c.nombre,
        rifasCount: c.rifasCount ?? 0,
        meta: c.meta,
      }));
    }
    return [
      { causaId: null, code: '01', nombre: 'SALUD COMUNITARIA', rifasCount: 3, meta: 15000 },
      { causaId: null, code: '02', nombre: 'EDUCACIÓN Y BECAS', rifasCount: 2, meta: 12000 },
      { causaId: null, code: '03', nombre: 'HOGAR ESPERANZA', rifasCount: 4, meta: 20000 },
      { causaId: null, code: '04', nombre: 'APOYO SOCIAL ACTIVO', rifasCount: 2, meta: 10000 },
    ];
  }, [causas]);

  const looped = [...items, ...items, ...items];

  return (
    <section
      aria-label="Causas verificadas en plataforma"
      className="marquee-wrapper -mx-4 overflow-hidden border-y border-emerald-950/30 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 py-4 shadow-md sm:-mx-6 lg:-mx-8"
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
            className="flex min-w-[250px] shrink-0 items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-2.5 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
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
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="flex items-center text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </span>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700">
                  Verificada: 100%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HeroShowcase({ rifas = [], causas = [], onSelectCausa }) {
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
    const reales = rifas.slice(0, 5).map((r, idx) => ({
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
      isDemo: false,
      palette: CARD_PALETTES[idx % CARD_PALETTES.length],
    }));

    if (reales.length === 0) return FALLBACK_CARDS;
    if (reales.length >= 5) return reales;

    const merged = [...reales];
    let i = 0;
    while (merged.length < 5) {
      merged.push(FALLBACK_CARDS[i % FALLBACK_CARDS.length]);
      i += 1;
    }
    return merged;
  }, [rifas]);

  const activeIdx = Math.min(centerIndex, cards.length - 1);
  const fanStepX = isCompactScreen ? 42 : 68;

  return (
    <div className="space-y-6">
      {/* Hero comercial de 2 columnas con abanico interactivo */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-8 shadow-sm backdrop-blur-md sm:px-10 sm:py-12">
        {/* Líneas tecnológicas sutiles decorativas como en la imagen de referencia */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 400"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
          fill="none"
        >
          <path
            d="M0 160 H180 L210 190 H320"
            stroke="#10b981"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
          <circle cx="180" cy="160" r="3" fill="#10b981" fillOpacity="0.45" />
          <path
            d="M0 240 H140 L170 210 H280"
            stroke="#f59e0b"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
          <circle cx="140" cy="240" r="3" fill="#f59e0b" fillOpacity="0.45" />
          <path
            d="M800 120 H640 L600 160 H490"
            stroke="#0ea5e9"
            strokeOpacity="0.3"
            strokeWidth="1.2"
          />
          <circle cx="640" cy="120" r="3" fill="#0ea5e9" fillOpacity="0.45" />
        </svg>

        <div className="relative grid items-center gap-10 lg:grid-cols-12">
          {/* Columna Izquierda: Titular, Subtítulo, CTAs y Prueba Social */}
          <div className="space-y-5 lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Plataforma auditada · Bolivia
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl xl:text-[54px]">
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

            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              <strong className="font-bold text-slate-900">Rifas Solidarias</strong> es una
              plataforma de campañas y sorteos digitales auditados, diseñada para apoyar causas
              reales con reservas instantáneas de 15 minutos y verificación transparente de pagos.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('catalogo-activo')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105 cursor-pointer"
              >
                <Ticket className="h-4 w-4" />
                Ver rifas
              </button>

              <Link
                to="/causas"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800"
              >
                <HeartHandshake className="h-4 w-4" />
                Ver causas
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                +500 participantes y causas confían en Rifas Solidarias
              </p>
            </div>
          </div>

          {/* Columna Derecha: Abanico Interactivo de 5 Tarjetas (como las historias de la imagen) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto flex h-[340px] max-w-[520px] items-center justify-center sm:h-[380px]">
              {cards.map((card, idx) => {
                const offset = idx - activeIdx;
                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                const translateX = offset * 68;
                const translateY = absOffset * 12;
                const rotate = offset * 6.5;
                const scale = isCenter ? 1.04 : Math.max(0.78, 1 - absOffset * 0.09);
                const zIndex = 30 - absOffset * 5;
                const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.08;

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
                      } else if (!card.isDemo && card.rifaId) {
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
                        else if (!card.isDemo && card.rifaId) navigate(`/rifas/${card.rifaId}`);
                      }
                    }}
                    style={{
                      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                    }}
                    className={`absolute flex h-[300px] w-[196px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${card.palette} p-4 text-white shadow-2xl transition-all duration-300 cursor-pointer sm:h-[336px] sm:w-[222px] ${
                      isCenter
                        ? 'ring-3 ring-emerald-400 shadow-emerald-950/35'
                        : 'ring-2 ring-white/80 hover:ring-amber-300'
                    }`}
                  >
                    {/* Header de tarjeta tipo story */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        {card.estado === 'FINALIZADA' ? 'Sorteada' : 'Activa'}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      </span>
                    </div>

                    {/* Centro visual */}
                    <div className="my-auto space-y-2.5 py-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur-xs">
                        <HeartHandshake className="h-3 w-3" />
                        {card.causa?.nombre || 'Causa Solidaria'}
                      </span>

                      <h3 className="line-clamp-3 text-base font-extrabold leading-snug text-white sm:text-lg">
                        {card.nombre}
                      </h3>

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
                    </div>

                    {/* Footer de tarjeta */}
                    <div className="flex items-center justify-between gap-2 border-t border-white/15 pt-2.5">
                      <span className="truncate text-[10px] font-medium text-slate-200">
                        {card.fechaFin ? `Cierra ${formatearFechaCorta(card.fechaFin)}` : 'Reserva 15 min'}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-slate-900">
                        {isCenter ? 'Participar' : 'Ver'}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicadores del abanico */}
            <div className="mt-1 flex items-center justify-center gap-1.5">
              {cards.map((c, idx) => (
                <button
                  key={`dot-${c.id}-${idx}`}
                  type="button"
                  onClick={() => setCenterIndex(idx)}
                  aria-label={`Destacar tarjeta ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === activeIdx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner Marquee Deslizante de Causas Verificadas (como la franja inferior de la imagen 1) */}
      <CauseMarqueeTicker causas={causas} onSelectCausa={onSelectCausa} />

      {/* Widgets de Proceso y Garantías */}
      <section
        id="como-funciona"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          id="garantias"
          className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Ticket className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              1. Elige tus números
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Selecciona tus boletos disponibles en el tablero en vivo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              2. Reserva 15 minutos
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Bloqueo atómico sin colisiones mientras envías tu pago.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              3. Pago verificado
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Validación manual con auditoría y notificación inmediata.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              4. Sorteo auditable
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Solo tickets aprobados participan y el alias ganador es público.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const FAQS = [
  {
    q: '¿Cómo funciona la reserva temporal de 15 minutos?',
    a: 'Cuando seleccionas tus números en una rifa activa y confirmas la reserva, el sistema bloquea esos boletos de forma atómica exclusivamente para ti durante 15 minutos, evitando que otra persona los tome mientras realizas y subes tu comprobante de pago.',
  },
  {
    q: '¿Qué métodos de pago se aceptan y cuánto tarda la verificación?',
    a: 'Puedes registrar transferencias bancarias o pagos QR indicando tu número de referencia y adjuntando el comprobante. Nuestro equipo administrativo verifica cada comprobante y recibirás una notificación automática en tu perfil cuando tus tickets pasen a estado VENDIDO.',
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

export function PlatformContentSection({ totalRifas = 0, totalCausas = 0 }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-8 pt-4">
      {/* Beneficios por perfil (Contenido Comercial) */}
      <section
        id="beneficios-plataforma"
        className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-md sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="max-w-2xl space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Ecosistema solidario completo
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Diseñado para participantes, organizadores y causas reales
            </h2>
            <p className="text-sm text-slate-600">
              Cada rol cuenta con herramientas claras para participar, recaudar y verificar sorteos
              en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-center">
              <p className="text-lg font-extrabold text-emerald-700">{totalRifas}</p>
              <p className="text-[11px] font-semibold text-slate-600">Rifas en catálogo</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-2 text-center">
              <p className="text-lg font-extrabold text-amber-700">{totalCausas}</p>
              <p className="text-[11px] font-semibold text-slate-600">Causas activas</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm">
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

          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition hover:border-amber-300 hover:bg-white hover:shadow-sm">
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

          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition hover:border-teal-300 hover:bg-white hover:shadow-sm">
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
      <section
        id="preguntas-frecuentes"
        className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-md lg:grid-cols-12 lg:p-8"
      >
        <div className="space-y-3 lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            Centro de dudas
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Preguntas frecuentes
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Resolvemos las consultas más habituales sobre reservas, pagos, sorteos y creación de
            campañas solidarias.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new window.CustomEvent('open-help-widget'))}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            Chatear con RifaBot
          </button>
        </div>

        <div className="space-y-2.5 lg:col-span-7">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-emerald-100 px-4 pt-2.5 pb-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
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
