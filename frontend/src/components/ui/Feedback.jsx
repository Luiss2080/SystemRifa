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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/50 to-teal-50/60 px-4 backdrop-blur-md transition-opacity duration-350 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Halos atmosféricos suaves con los colores verde y amarillo de la web */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-teal-100/30 blur-3xl" />

      {/* Anillos orbitales geométricos sutiles */}
      <svg
        className="pointer-events-none absolute h-[600px] w-[600px] text-emerald-600/[0.07] animate-spin-slow"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Tarjeta central limpia, blanca y elegante */}
      <div className="relative mx-auto flex w-full max-w-sm sm:max-w-md flex-col items-center rounded-[32px] border border-emerald-100/90 bg-white/95 p-7 sm:p-9 text-center shadow-2xl shadow-emerald-950/10 backdrop-blur-md ring-1 ring-slate-900/5 overflow-hidden">
        
        {/* Barra superior con gradiente de la marca */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

        {/* Badge superior temático */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Bolillero Digital & Sorteos Auditados</span>
        </div>

        {/* Animación central de rifas: bolillero, ticket y bolitas numeradas de sorteo */}
        <div className="relative my-5 flex h-28 w-28 items-center justify-center">
          {/* Anillo exterior punteado de bolillero */}
          <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-full border-2 border-dashed border-emerald-300" />
          
          {/* Anillo interior giratorio inverso */}
          <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400 border-r-emerald-500" />

          {/* Bolitas numeradas del sorteo orbitando el centro */}
          <span className="absolute -top-1 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[10px] font-black text-slate-950 shadow-md ring-2 ring-white animate-bounce">
            77
          </span>
          <span className="absolute top-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-black text-white shadow-md ring-2 ring-white animate-pulse">
            15
          </span>
          <span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-[10px] font-black text-white shadow-md ring-2 ring-white">
            09
          </span>
          <span className="absolute -bottom-1 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-[10px] font-black text-slate-950 shadow-md ring-2 ring-white animate-bounce">
            ★
          </span>

          {/* Núcleo central con Ticket de la Suerte */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-700/25 ring-4 ring-emerald-50">
            <Ticket className="h-7 w-7 text-amber-300 drop-shadow-xs" />
          </div>

          <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 animate-bounce text-amber-400" />
        </div>

        {/* Título y subtítulo con la identidad de la web */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          RIFAS <span className="text-emerald-700">SOLIDARIAS</span>
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Premios transparentes · Apoyo a causas reales
        </p>

        {/* Progreso dinámico con mensaje del sorteo y porcentaje */}
        <div className="mt-5 w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-800 truncate max-w-[80%] text-left">
              {etapaTexto}
            </span>
            <span className="font-mono text-emerald-700 font-extrabold">{progreso}%</span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-emerald-100/60 p-0.5 border border-emerald-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-[width] duration-150 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Pilares clave del sistema de rifas */}
        <div className="mt-5 grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-extrabold text-emerald-700">15 Minutos</span>
            <span className="text-[9.5px] font-medium text-slate-400">Reserva de boletos</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-100">
            <span className="text-[11px] font-extrabold text-amber-600">SHA-256</span>
            <span className="text-[9.5px] font-medium text-slate-400">Sorteo inmutable</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-extrabold text-teal-700">Simple QR</span>
            <span className="text-[9.5px] font-medium text-slate-400">Pago verificado</span>
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
