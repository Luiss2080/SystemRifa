import { useEffect, useState } from 'react';
import { BrandMark } from './BrandLogo.jsx';

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
          <span className="absolute inset-0 animate-spin rounded-3xl border-2 border-emerald-200 border-t-emerald-600 border-r-teal-500" />
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
 * Pantalla de carga inicial (Splash) breve al arrancar la aplicación web.
 */
export function SplashOverlay({ cargando = false }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible || cargando) return undefined;
    const tFade = setTimeout(() => setFading(true), 420);
    const tHide = setTimeout(() => setVisible(false), 740);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tHide);
    };
  }, [visible, cargando]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-slate-50/95 backdrop-blur-md transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="bg-dot-matrix absolute inset-0 opacity-40" />
      <div className="relative flex w-full max-w-xs flex-col items-center rounded-3xl border border-emerald-200/80 bg-white/95 px-8 py-8 text-center shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-spin rounded-3xl border-2 border-emerald-200 border-t-emerald-600 border-r-teal-500" />
          <BrandMark size="xl" />
        </div>
        <p className="text-base font-extrabold tracking-tight text-slate-900">
          RIFAS <span className="text-emerald-600">SOLIDARIAS</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Iniciando plataforma transparente...
        </p>
        <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-emerald-100">
          <div className="animate-shimmer-bar h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
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
