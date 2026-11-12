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

export function FullPageSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-200/70 bg-white/90 px-8 py-6 text-slate-600 shadow-sm backdrop-blur-md">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/80">
          <Spinner size="md" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">{message}</p>
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
      {description && <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
