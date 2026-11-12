import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.jsx';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  closeOnBackdrop = true,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
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
        className={`animate-modal-in w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="pr-4">
            <h3 id={titleId} className="text-base font-bold text-slate-900">
              {title}
            </h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
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
  loading = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      title={title}
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
      {message && <p className="text-sm leading-relaxed text-slate-600">{message}</p>}
      {children}
    </Modal>
  );
}
