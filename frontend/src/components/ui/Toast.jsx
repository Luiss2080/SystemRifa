import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldCheck, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    topBar: 'from-emerald-600 via-teal-500 to-amber-400',
    headerBg: 'from-emerald-50/70 via-white to-teal-50/40',
    iconWrap: 'bg-emerald-100 text-emerald-700 ring-emerald-200/90',
    badge: 'bg-emerald-100 text-emerald-800',
    badgeText: 'CONFIRMACIÓN',
    progressBar: 'bg-emerald-500',
    icon: ShieldCheck,
  },
  error: {
    topBar: 'from-rose-500 via-red-500 to-orange-500',
    headerBg: 'from-rose-50/70 via-white to-orange-50/30',
    iconWrap: 'bg-rose-100 text-rose-700 ring-rose-200/90',
    badge: 'bg-rose-100 text-rose-800',
    badgeText: 'ACCIÓN CRÍTICA',
    progressBar: 'bg-rose-500',
    icon: AlertCircle,
  },
  warning: {
    topBar: 'from-amber-400 via-orange-500 to-amber-500',
    headerBg: 'from-amber-50/70 via-white to-orange-50/35',
    iconWrap: 'bg-amber-100 text-amber-700 ring-amber-200/90',
    badge: 'bg-amber-100 text-amber-900',
    badgeText: 'PRECAUCIÓN',
    progressBar: 'bg-amber-500',
    icon: AlertTriangle,
  },
  info: {
    topBar: 'from-sky-500 via-teal-500 to-emerald-500',
    headerBg: 'from-sky-50/70 via-white to-teal-50/35',
    iconWrap: 'bg-sky-100 text-sky-700 ring-sky-200/90',
    badge: 'bg-sky-100 text-sky-800',
    badgeText: 'SISTEMA',
    progressBar: 'bg-sky-500',
    icon: Info,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = 'info', badge, duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, description, type, badge, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title, description, duration = 4500) =>
      addToast({ title, description, type: 'success', duration }),
    confirm: (title, description, duration = 4500) =>
      addToast({ title, description, type: 'success', badge: 'CONFIRMACIÓN', duration }),
    error: (title, description, duration = 6000) =>
      addToast({ title, description, type: 'error', duration }),
    warning: (title, description, duration = 5000) =>
      addToast({ title, description, type: 'warning', duration }),
    info: (title, description, duration = 4500) =>
      addToast({ title, description, type: 'info', duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Contenedor de notificaciones y mensajes de confirmación en el extremo superior derecho */}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm sm:max-w-md flex-col gap-2.5 sm:top-5 sm:right-5 items-end"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          const IconComp = style.icon;

          return (
            <div
              key={t.id}
              role="alert"
              className="animate-toast-in pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 shadow-2xl shadow-slate-900/15 backdrop-blur-md ring-1 ring-slate-900/5 transition hover:shadow-emerald-900/10"
            >
              {/* Barra superior de acento con gradiente del sistema */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${style.topBar}`} />

              <div className="p-3 sm:p-3.5">
                {/* Cabecera compacta con etiqueta y botón de cierre */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-wider ${style.badge}`}
                  >
                    {t.badge || style.badgeText}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeToast(t.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 cursor-pointer shadow-2xs"
                    aria-label="Cerrar notificación"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Contenido principal con icono y texto estructurado */}
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 shadow-2xs ${style.iconWrap}`}
                  >
                    <IconComp className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 leading-snug">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-0.5 text-[11px] sm:text-xs leading-relaxed text-slate-600">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicador de barra de progreso de tiempo de expiración */}
              {t.duration > 0 && (
                <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${style.progressBar} animate-toast-progress`}
                    style={{ animationDuration: `${t.duration}ms` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
