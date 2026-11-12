import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { BrandMark } from './BrandLogo.jsx';

const MIN_SPLASH_MS = 2000;
const COMPLETE_HOLD_MS = 180;
const FADE_OUT_MS = 420;

const SPLASH_STEPS = [
  { threshold: 0, label: 'Conexión segura', icon: ShieldCheck },
  { threshold: 35, label: 'Tablero en vivo', icon: Ticket },
  { threshold: 70, label: 'Sorteos auditables', icon: Sparkles },
];

function getSplashMessage(progress) {
  if (progress >= 100) return '¡Plataforma lista para ti!';
  if (progress >= 72) return 'Preparando causas y sorteos verificados...';
  if (progress >= 36) return 'Sincronizando tablero en tiempo real...';
  return 'Iniciando plataforma transparente...';
}

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

export function FullPageSpinner({ message = 'Cargando plataforma...' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/95 px-8 py-8 text-center shadow-xl ring-1 ring-slate-900/5 backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

        <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
          <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-3xl border-2 border-dashed border-emerald-300/80" />
          <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-1.5 rounded-2xl border-2 border-transparent border-t-emerald-600 border-r-teal-500" />
          <BrandMark size="xl" />
        </div>

        <p className="text-sm font-extrabold tracking-tight text-slate-900">
          RIFAS <span className="text-emerald-600">SOLIDARIAS</span>
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">{message}</p>

        <div className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-emerald-100">
          <div className="animate-shimmer-bar h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
        </div>
      </div>
    </div>
  );
}

/**
 * Pantalla de carga inicial (Splash) con duración mínima garantizada de 2 segundos.
 */
export function SplashOverlay({ cargando = false }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(4);
  const cargandoRef = useRef(cargando);

  useEffect(() => {
    cargandoRef.current = cargando;
  }, [cargando]);

  useEffect(() => {
    if (!visible) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    let frameId = 0;
    let holdTimer = 0;
    let hideTimer = 0;
    let completed = false;

    const tick = (now) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / MIN_SPLASH_MS, 1);
      const eased = 1 - Math.pow(1 - ratio, 2.2);

      if (elapsed >= MIN_SPLASH_MS && !cargandoRef.current) {
        if (!completed) {
          completed = true;
          setProgress(100);
          holdTimer = window.setTimeout(() => {
            setFading(true);
            document.body.style.overflow = prevOverflow;
            hideTimer = window.setTimeout(() => setVisible(false), FADE_OUT_MS);
          }, COMPLETE_HOLD_MS);
        }
        return;
      }

      const target = Math.min(96, Math.max(4, Math.round(4 + eased * 90)));
      setProgress(target);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(holdTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  const statusText = getSplashMessage(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando Rifas Solidarias"
      className={`fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-4 transition-all duration-400 ${
        fading ? 'pointer-events-none scale-[1.015] opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      {/* Textura y halos ambientales */}
      <div className="bg-dot-matrix pointer-events-none absolute inset-0 opacity-15" />
      <div className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-28 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-300/10" />

      {/* Tarjeta central glassmorphism */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-900/80 px-7 py-8 text-center shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:px-9 sm:py-9">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400" />

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-300 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Plataforma de Sorteos Verificados
        </div>

        {/* Emblema animado */}
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
          <span className="pointer-events-none absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl" />
          <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-3xl border border-dashed border-emerald-400/40" />
          <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-1.5 rounded-2xl border-2 border-emerald-500/20 border-t-emerald-400 border-r-teal-300" />
          <div className="relative rounded-2xl shadow-lg ring-1 ring-white/15">
            <BrandMark size="xl" />
          </div>
        </div>

        <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          RIFAS <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">SOLIDARIAS</span>
        </h1>
        <p className="mt-1.5 text-xs font-medium text-slate-300 sm:text-sm">
          {statusText}
        </p>

        {/* Barra de progreso real con porcentaje */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-300/90">Preparando experiencia</span>
            <span className="tabular-nums text-white">{progress}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="animate-shimmer-bar absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Indicadores de etapas */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {SPLASH_STEPS.map((step) => {
            const StepIcon = step.icon;
            const done = progress >= Math.min(100, step.threshold + 32);
            const active = !done && progress >= step.threshold;
            return (
              <div
                key={step.label}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-semibold transition-colors ${
                  done
                    ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
                    : active
                      ? 'border-teal-400/35 bg-white/10 text-white'
                      : 'border-white/5 bg-white/[0.03] text-slate-400'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <StepIcon className={`h-3.5 w-3.5 ${active ? 'text-teal-300' : 'text-slate-500'}`} />
                )}
                <span className="leading-tight">{step.label}</span>
              </div>
            );
          })}
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
