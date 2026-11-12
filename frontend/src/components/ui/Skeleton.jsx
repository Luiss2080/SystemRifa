export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="flex justify-between">
            <div className="h-6 w-32 rounded-lg bg-slate-200" />
            <div className="h-6 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-200" />
          </div>
          <div className="h-9 w-full rounded-lg bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="h-8 w-full rounded-lg bg-slate-100" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 w-full rounded-lg bg-slate-50" />
      ))}
    </div>
  );
}

