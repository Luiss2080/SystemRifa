import { useEffect, useRef, useState } from 'react';
import { Sparkles, Ticket } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-7 w-7 border-3',
    lg: 'h-10 w-10 border-4',
  };
  return (
    <div
      className={`animate-spin rounded-full border-emerald-600 border-t-transparent ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function FullPageSpinner({ message = 'Cargando información...' }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-3.5 flex h-16 w-16 items-center justify-center">
        <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-full border-2 border-dashed border-emerald-300" />
        <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-1.5 rounded-full border-2 border-transparent border-t-emerald-600 border-r-amber-400" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-xs">
          7
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
          <Ticket className="h-5 w-5 text-amber-300" />
        </div>
      </div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-900">
        Rifas <span className="text-emerald-700">Solidarias</span>
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}

const MIN_SPLASH_MS = 2500; // 2.5 segundos de duración fluida garantizada (2 a 3s)
const FADE_OUT_MS = 350;

const ETAPAS_CARGA = [
  { min: 0, max: 28, texto: 'Mezclando el bolillero digital...' },
  { min: 28, max: 62, texto: 'Cargando boletos y causas benéficas...' },
  { min: 62, max: 88, texto: 'Verificando números y certificados SHA-256...' },
  { min: 88, max: 100, texto: '¡Todo listo! Que la suerte te acompañe' },
];

/**
 * Pantalla de carga limpia, luminosa y elegante con la paleta oficial de la web
 * y animación temático-visual centrada en el bolillero y boletos de rifas.
 */
export function SplashOverlay({ cargando = false }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progreso, setProgreso] = useState(10);
  const [etapaTexto, setEtapaTexto] = useState(ETAPAS_CARGA[0].texto);
  const cargandoRef = useRef(cargando);

  useEffect(() => {
    cargandoRef.current = cargando;
  }, [cargando]);

  useEffect(() => {
    if (!visible) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startTime = Date.now();
    let frameId = 0;
    let hideTimer = 0;
    let completed = false;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.max(10, Math.floor((elapsed / MIN_SPLASH_MS) * 100)));
      setProgreso(pct);

      const etapa = ETAPAS_CARGA.find((e) => pct >= e.min && pct <= e.max);
      if (etapa) {
        setEtapaTexto(etapa.texto);
      }

      if (elapsed >= MIN_SPLASH_MS && !cargandoRef.current) {
        if (!completed) {
          completed = true;
          setProgreso(100);
          setEtapaTexto(ETAPAS_CARGA[ETAPAS_CARGA.length - 1].texto);
          setFading(true);
          document.body.style.overflow = prevOverflow;
          hideTimer = window.setTimeout(() => setVisible(false), FADE_OUT_MS);
        }
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando Rifas Solidarias"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#f8fafc] bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 px-6 select-none transition-opacity duration-350 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Halos atmosféricos suaves con los colores verde y ámbar de la web */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-emerald-200/35 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/30 blur-3xl animate-float-slower" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[26rem] w-[26rem] rounded-full bg-teal-100/30 blur-3xl" />

      {/* Anillos orbitales concéntricos gigantes de fondo */}
      <svg
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] text-emerald-600/[0.07] animate-spin-slow"
        viewBox="0 0 500 500"
        fill="none"
      >
        <circle cx="250" cy="250" r="235" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 10" />
        <circle cx="250" cy="250" r="175" stroke="currentColor" strokeWidth="1" />
        <circle cx="250" cy="250" r="115" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
      </svg>

      {/* Contenido en pantalla completa sin contenedor ni recuadros */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full px-4">
        
        {/* Badge superior temático */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 shadow-xs backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span>Bolillero Digital & Sorteos Auditados</span>
        </div>

        {/* Animación central de rifas: bolillero, ticket y bolitas numeradas de sorteo */}
        <div className="relative my-7 flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center">
          {/* Anillo exterior punteado de bolillero */}
          <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-full border-2 border-dashed border-emerald-300" />
          
          {/* Anillo interior giratorio inverso */}
          <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-3 rounded-full border-2 border-transparent border-t-amber-400 border-r-emerald-500" />

          {/* Bolitas numeradas del sorteo orbitando el centro */}
          <span className="absolute -top-1 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-[11px] font-black text-slate-950 shadow-md ring-2 ring-white animate-bounce">
            77
          </span>
          <span className="absolute top-4 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-black text-white shadow-md ring-2 ring-white animate-pulse">
            15
          </span>
          <span className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-[11px] font-black text-white shadow-md ring-2 ring-white">
            09
          </span>
          <span className="absolute -bottom-1 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-[11px] font-black text-slate-950 shadow-md ring-2 ring-white animate-bounce">
            ★
          </span>

          {/* Núcleo central con Ticket de la Suerte */}
          <div className="relative flex h-18 w-18 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-700/25 ring-4 ring-white/90">
            <Ticket className="h-9 w-9 text-amber-300 drop-shadow-xs" />
          </div>

          <Sparkles className="absolute -top-1.5 -right-1.5 h-5 w-5 animate-bounce text-amber-400" />
        </div>

        {/* Título y subtítulo con la identidad de la web */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
          RIFAS <span className="text-emerald-700">SOLIDARIAS</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500">
          Premios transparentes · Apoyo a causas reales
        </p>

        {/* Progreso dinámico en pantalla completa */}
        <div className="mt-7 w-full max-w-md space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="text-emerald-900 truncate max-w-[80%] text-left">
              {etapaTexto}
            </span>
            <span className="font-mono text-emerald-700 font-extrabold">{progreso}%</span>
          </div>

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/70 p-0.5 border border-emerald-200/70 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-[width] duration-150 ease-out shadow-xs"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Pilares clave del sistema en línea limpia */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700">15 Minutos</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Reserva de boletos</span>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-extrabold text-amber-600">SHA-256</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Sorteo inmutable</span>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-extrabold text-teal-700">Simple QR</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Pago verificado</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function EmptyState({ icon, title = 'Sin resultados', description, action }) {
  const IconComp = icon;
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200/90 bg-white/90 px-6 py-12 text-center shadow-2xs backdrop-blur-sm">
      {IconComp && (
        <div className="mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 shadow-2xs">
          <IconComp className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
