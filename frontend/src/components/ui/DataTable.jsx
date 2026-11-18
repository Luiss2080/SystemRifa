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
  className = '',
  centered = false,
}) {
  if (!onPageChange || total === 0) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  return (
    <div className={`flex w-full flex-col items-center justify-center gap-2.5 border-t border-slate-200/80 pt-4 pb-2 text-center ${className}`}>
      {/* Controles de paginación en el centro con colores empresariales serios */}
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
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
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
              p === page
                ? 'border border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
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
              className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
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
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Contador de registros centrado */}
      <p className="text-xs font-medium text-slate-500">
        Mostrando <span className="font-semibold text-slate-800">{showingFrom} - {showingTo}</span> de{' '}
        <span className="font-semibold text-slate-800">{total}</span> {itemLabel}
      </p>
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
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                {columns.map((col) => {
                  const ColIcon = col.icon;
                  return (
                    <th key={col.key} className={`px-5 py-3.5 ${col.headerClassName || ''}`}>
                      <span className="inline-flex items-center gap-1.5">
                        {ColIcon && <ColIcon className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{col.label}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleRows.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  className="transition hover:bg-slate-50/70"
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
