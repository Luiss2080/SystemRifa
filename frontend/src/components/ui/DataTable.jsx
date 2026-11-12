import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './Feedback.jsx';
import { TableSkeleton } from './Skeleton.jsx';

export function PaginationCard({
  page = 1,
  totalPages = 1,
  total = 0,
  showingFrom = 0,
  showingTo = 0,
  onPageChange,
  itemLabel = 'registros',
}) {
  if (!onPageChange || total === 0) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3.5 shadow-2xs backdrop-blur-md sm:flex-row">
      <p className="text-xs text-slate-600">
        Mostrando{' '}
        <strong className="font-extrabold text-slate-900">
          {showingFrom} - {showingTo}
        </strong>{' '}
        de <strong className="font-extrabold text-slate-900">{total}</strong> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="flex h-8 min-w-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-xs text-slate-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`flex h-8 min-w-8 items-center justify-center rounded-xl px-2.5 text-xs font-extrabold transition cursor-pointer ${
              p === page
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-xs text-slate-400">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="flex h-8 min-w-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No hay registros',
  emptyDescription,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  pageSize = 15,
  clientPageSize = 0,
  itemLabel = 'registros',
  rowKey = 'id',
}) {
  const [localPage, setLocalPage] = useState(1);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const useClientPagination = Boolean(clientPageSize && !onPageChange);
  const effectiveTotalPages = useClientPagination
    ? Math.max(1, Math.ceil(data.length / clientPageSize))
    : totalPages;
  const effectivePage = useClientPagination
    ? Math.min(localPage, effectiveTotalPages)
    : page;
  const effectiveTotal = useClientPagination ? data.length : total || data.length;
  const visibleRows = useClientPagination
    ? data.slice((effectivePage - 1) * clientPageSize, effectivePage * clientPageSize)
    : data;

  const activeLimit = useClientPagination ? clientPageSize : pageSize;
  const showingFrom = effectiveTotal === 0 ? 0 : (effectivePage - 1) * activeLimit + 1;
  const showingTo =
    effectiveTotal === 0
      ? 0
      : Math.min(effectiveTotal, showingFrom + visibleRows.length - 1);

  const handlePageChange = useClientPagination ? setLocalPage : onPageChange;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm">
            <thead className="bg-emerald-50/55 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              <tr>
                {columns.map((col) => {
                  const ColIcon = col.icon;
                  return (
                    <th key={col.key} className={`px-5 py-3.5 ${col.headerClassName || ''}`}>
                      <span className="inline-flex items-center gap-1.5">
                        {ColIcon && <ColIcon className="h-3.5 w-3.5 text-emerald-600" />}
                        <span>{col.label}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/80">
              {visibleRows.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  className="transition hover:bg-emerald-50/30"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-3.5 text-slate-700 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(effectiveTotalPages > 1 || effectiveTotal > 0) && handlePageChange && (
        <PaginationCard
          page={effectivePage}
          totalPages={effectiveTotalPages}
          total={effectiveTotal}
          showingFrom={showingFrom}
          showingTo={showingTo}
          onPageChange={handlePageChange}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
}
