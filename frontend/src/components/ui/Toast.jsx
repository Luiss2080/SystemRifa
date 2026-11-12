import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = 'info', duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title, description) => addToast({ title, description, type: 'success' }),
    error: (title, description) => addToast({ title, description, type: 'error', duration: 6000 }),
    info: (title, description) => addToast({ title, description, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-20 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 sm:right-5">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const IconComp = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
          const style = isSuccess
            ? {
                card: 'border-emerald-200/90 bg-white/95 text-slate-900',
                bar: 'bg-emerald-500',
                icon: 'bg-emerald-100 text-emerald-700',
              }
            : isError
              ? {
                  card: 'border-rose-200/90 bg-white/95 text-slate-900',
                  bar: 'bg-rose-500',
                  icon: 'bg-rose-100 text-rose-700',
                }
              : {
                  card: 'border-teal-200/90 bg-white/95 text-slate-900',
                  bar: 'bg-teal-500',
                  icon: 'bg-teal-100 text-teal-700',
                };

          return (
            <div
              key={t.id}
              className={`animate-modal-in pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-md ${style.card}`}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
              <span
                className={`ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
              >
                <IconComp className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold tracking-tight text-slate-900">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
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
