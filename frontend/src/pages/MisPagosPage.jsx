import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { getMisPagos } from '../features/rifas/publicApi.js';
import { formatearBs, formatearFecha } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';

const ESTADOS_PAGO = [
  { key: '', label: 'Todos' },
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'CONFIRMADO', label: 'Confirmados' },
  { key: 'RECHAZADO', label: 'Rechazados' },
];

export function MisPagosPage() {
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-pagos', { estado, page }],
    queryFn: () =>
      getMisPagos({
        page,
        limit: 15,
        ...(estado ? { estado } : {}),
      }),
  });

  const columns = [
    { key: 'pagoId', label: 'ID', render: (r) => <span className="font-mono">#{r.pagoId}</span> },
    {
      key: 'rifa',
      label: 'Rifa',
      render: (r) => (
        <Link to={`/rifas/${r.rifaId}`} className="font-medium text-emerald-700 hover:underline">
          {r.rifa?.nombre || `Rifa #${r.rifaId}`}
        </Link>
      ),
    },
    {
      key: 'tickets',
      label: 'Números',
      render: (r) =>
        (r.tickets || []).map((t) => `#${t.numeroTicket}`).join(', ') || '—',
    },
    {
      key: 'monto',
      label: 'Monto',
      render: (r) => <span className="font-bold">{formatearBs(r.monto)}</span>,
    },
    { key: 'metodo', label: 'Método' },
    { key: 'referencia', label: 'Referencia', render: (r) => r.referencia || '—' },
    { key: 'estado', label: 'Estado', render: (r) => <Badge estado={r.estado} /> },
    { key: 'fecha', label: 'Fecha', render: (r) => formatearFecha(r.fecha) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis pagos</h1>
          <p className="text-sm text-slate-500">
            Historial de comprobantes enviados y estado de verificación
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ESTADOS_PAGO.map((opt) => (
            <button
              key={opt.key || 'all'}
              type="button"
              onClick={() => {
                setEstado(opt.key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                estado === opt.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Cuando envías un comprobante queda en estado <strong>PENDIENTE</strong>. Apenas un
          administrador lo valide, tus números pasarán a <strong>VENDIDO</strong> y recibirás una
          notificación.
        </span>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        rowKey="pagoId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Sin pagos registrados"
        emptyDescription="Cuando reserves tickets y envíes un pago, aparecerá aquí."
      />
    </div>
  );
}
