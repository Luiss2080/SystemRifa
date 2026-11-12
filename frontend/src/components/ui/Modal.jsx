import { useEffect, useId } from 'react';
import { AlertTriangle, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from './Button.jsx';

const TONE_MAP = {
  emerald: {
    bar: 'from-emerald-600 via-teal-500 to-amber-400',
    headerBg: 'from-emerald-50/65 via-white to-teal-50/40',
    iconWrap: 'bg-emerald-100 text-emerald-700 ring-emerald-200/80',
    badge: 'bg-emerald-100/80 text-emerald-800',
  },
  amber: {
    bar: 'from-amber-400 via-orange-500 to-amber-500',
    headerBg: 'from-amber-50/70 via-white to-orange-50/35',
    iconWrap: 'bg-amber-100 text-amber-700 ring-amber-200/80',
    badge: 'bg-amber-100/80 text-amber-900',
  },
  danger: {
    bar: 'from-rose-500 via-red-500 to-orange-500',
    headerBg: 'from-rose-50/70 via-white to-orange-50/30',
    iconWrap: 'bg-rose-100 text-rose-700 ring-rose-200/80',
    badge: 'bg-rose-100/80 text-rose-800',
  },
  slate: {
    bar: 'from-emerald-600 via-teal-500 to-sky-500',
    headerBg: 'from-slate-50/90 via-white to-emerald-50/40',
    iconWrap: 'bg-emerald-100 text-emerald-700 ring-emerald-200/80',
    badge: 'bg-slate-100 text-slate-800',
  },
};

export function Modal({
  open,
  onClose,
  title,
  description,
  badge,
  icon = Sparkles,
  tone = 'emerald',
  children,
  footer,
  maxWidth = 'max-w-2xl',
  closeOnBackdrop = true,
  accentClass,
}) {
  const titleId = useId();
  const palette = TONE_MAP[tone] || TONE_MAP.emerald;
  const barClass = accentClass || palette.bar;
  const IconComp = icon;

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
        className={`animate-modal-in w-full ${maxWidth} overflow-hidden rounded-3xl border border-slate-200/90 bg-white/98 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-md`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${barClass}`} />

        <div
          className={`flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r ${palette.headerBg} px-6 py-4.5 sm:px-7`}
        >
          <div className="flex min-w-0 items-start gap-3.5 pr-2">
            {IconComp && (
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-2xs ${palette.iconWrap}`}
              >
                <IconComp className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              {badge && (
                <span
                  className={`mb-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${palette.badge}`}
                >
                  {badge}
                </span>
              )}
              <h3 id={titleId} className="text-lg font-extrabold tracking-tight text-slate-900">
                {title}
              </h3>
              {description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-2xs ring-1 ring-slate-200/90 transition hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-5 sm:px-7">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/85 px-6 py-4 sm:px-7">
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
  badge,
  children,
}) {
  const esAlerta = variant === 'danger' || variant === 'amber';
  const HeaderIcon = esAlerta ? AlertTriangle : ShieldCheck;
  const tone = variant === 'danger' ? 'danger' : variant === 'amber' ? 'amber' : 'emerald';
  const iconWrap =
    variant === 'danger'
      ? 'bg-rose-100 text-rose-600 ring-rose-200'
      : variant === 'amber'
        ? 'bg-amber-100 text-amber-600 ring-amber-200'
        : 'bg-emerald-100 text-emerald-600 ring-emerald-200';
  const resolvedBadge =
    badge || (variant === 'danger' ? 'ACCIÓN CRÍTICA' : variant === 'amber' ? 'PRECAUCIÓN' : 'CONFIRMACIÓN');

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      title={title}
      badge={resolvedBadge}
      icon={HeaderIcon}
      tone={tone}
      maxWidth={maxWidth}
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
          <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}
            >
              <HeaderIcon className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{message}</p>
          </div>
        )}
        {children}
      </div>
    </Modal>
  );
}
