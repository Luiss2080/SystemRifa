import { useEffect, useId } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from './Button.jsx';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  closeOnBackdrop = true,
  accentClass = 'from-emerald-500 via-teal-500 to-sky-500',
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape' && closeOnBackdrop && onClose) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, closeOnBackdrop]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`animate-modal-in w-full ${maxWidth} overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${accentClass}`} />

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-7">
          <div className="min-w-0 pr-2">
            <h3 id={titleId} className="text-lg font-extrabold tracking-tight text-slate-900">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl bg-white p-2 text-slate-400 shadow-2xs ring-1 ring-slate-200/80 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5 sm:px-7">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/90 px-6 py-4 sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  maxWidth = 'max-w-xl',
  loading = false,
  children,
}) {
  const esAlerta = variant === 'danger' || variant === 'amber';
  const Icon = esAlerta ? AlertTriangle : ShieldCheck;
  const iconWrap =
    variant === 'danger'
      ? 'bg-rose-100 text-rose-600 ring-rose-200'
      : variant === 'amber'
      ? 'bg-amber-100 text-amber-600 ring-amber-200'
      : 'bg-emerald-100 text-emerald-600 ring-emerald-200';
  const accentClass =
    variant === 'danger'
      ? 'from-rose-500 via-red-500 to-orange-500'
      : variant === 'amber'
      ? 'from-amber-400 via-orange-500 to-amber-500'
      : 'from-emerald-500 via-teal-500 to-sky-500';

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      title={title}
      maxWidth={maxWidth}
      accentClass={accentClass}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {message && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-justify text-sm leading-relaxed text-slate-700">{message}</p>
          </div>
        )}
        {children}
      </div>
    </Modal>
  );
}
