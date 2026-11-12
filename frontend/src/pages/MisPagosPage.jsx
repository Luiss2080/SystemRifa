import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMisPagos } from '../features/rifas/publicApi.js';
import { formatearBs, formatearFecha } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { Select } from '../components/ui/Select.jsx';

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis pagos</h1>
          <p className="text-sm text-slate-500">
            Historial de comprobantes enviados y estado de verificación
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select
            label="Estado"
            placeholder="Todos"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'PENDIENTE', label: 'Pendiente' },
              { value: 'CONFIRMADO', label: 'Confirmado' },
              { value: 'RECHAZADO', label: 'Rechazado' },
            ]}
          />
        </div>
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
