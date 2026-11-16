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
      <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
        <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-300" />
        <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-1 rounded-xl border-2 border-transparent border-t-emerald-600 border-r-amber-400" />
        <Ticket className="h-6 w-6 text-emerald-600" />
      </div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
        Rifas <span className="text-emerald-700">Solidarias</span>
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}

const MIN_SPLASH_MS = 350;
const FADE_OUT_MS = 300;

/**
 * Pantalla de carga única, limpia y animada con temática de rifas.
 */
export function SplashOverlay({ cargando = false }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
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

      if (elapsed >= MIN_SPLASH_MS && !cargandoRef.current) {
        if (!completed) {
          completed = true;
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
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/70 px-4 backdrop-blur-md transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Halos ambientales suaves */}
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute h-60 w-60 -translate-y-12 rounded-full bg-amber-400/10 blur-3xl" />

      {/* Contenedor central limpio y animado con temática de rifas */}
      <div className="relative flex flex-col items-center text-center">
        {/* Emblema animado de boleto y bolillero */}
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
          <span className="animate-spin-slow motion-reduce:animate-none absolute inset-0 rounded-3xl border-2 border-dashed border-emerald-300" />
          <span className="animate-spin-reverse motion-reduce:animate-none absolute inset-1.5 rounded-2xl border-2 border-transparent border-t-emerald-600 border-r-amber-400" />

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/25">
            <Ticket className="h-6 w-6 text-amber-300 animate-pulse" />
          </div>

          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 animate-bounce text-amber-400" />
        </div>

        {/* Título y subtítulo */}
        <p className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
          RIFAS <span className="text-emerald-700">SOLIDARIAS</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Sorteos Auditados en Tiempo Real
        </p>

        {/* Barra de carga fina y limpia */}
        <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-slate-200/80">
          <div className="animate-shimmer-bar h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
        </div>
      </div>
    </div>
  );
}
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
