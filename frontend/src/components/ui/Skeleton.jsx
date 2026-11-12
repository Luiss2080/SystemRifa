export function CardGridSkeleton({ count = 6 }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse space-y-4 rounded-3xl border border-slate-200/85 bg-white/90 p-5 shadow-2xs backdrop-blur-sm"
        >
          <div className="flex justify-between">
            <div className="h-6 w-32 rounded-xl bg-emerald-100/70" />
            <div className="h-6 w-16 rounded-full bg-slate-200/80" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200/90" />
            <div className="h-4 w-full rounded-lg bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/90 p-3">
            <div className="h-10 rounded-xl bg-slate-200/80" />
            <div className="h-10 rounded-xl bg-slate-200/80" />
          </div>
          <div className="h-9 w-full rounded-xl bg-emerald-100/60" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-3 overflow-hidden rounded-3xl border border-slate-200/85 bg-white/90 p-5 shadow-2xs backdrop-blur-sm">
      <div className="h-9 w-full rounded-xl bg-emerald-50/80" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 w-full rounded-xl bg-slate-50" />
      ))}
    </div>
  );
}
