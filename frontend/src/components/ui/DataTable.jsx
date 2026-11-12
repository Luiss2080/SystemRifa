import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';
import { EmptyState } from './Feedback.jsx';
import { TableSkeleton } from './Skeleton.jsx';

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
  rowKey = 'id',
}) {
  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-xs backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 ${col.headerClassName || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/70">
            {data.map((row, idx) => (
              <tr key={row[rowKey] ?? idx} className="transition hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
          <span>
            Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({total} registros)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
