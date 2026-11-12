import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilePlus2 } from 'lucide-react';
import { getMisSolicitudesApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Select } from '../../components/ui/Select.jsx';

export function MisSolicitudesPage() {
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-solicitudes', { estado, page }],
    queryFn: () =>
      getMisSolicitudesApi({
        page,
        limit: 15,
        ...(estado ? { estado } : {}),
      }),
  });

  const columns = [
    { key: 'rifaSolicitadaId', label: 'ID', render: (r) => `#${r.rifaSolicitadaId}` },
    {
      key: 'nombre',
      label: 'Propuesta de rifa',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.nombre}</p>
          <p className="text-xs text-slate-500">
            {r.cantidadTickets} tickets · {formatearBs(r.precioTicket)}
          </p>
        </div>
      ),
    },
    { key: 'estado', label: 'Estado', render: (r) => <Badge estado={r.estado} /> },
    {
      key: 'observacion',
      label: 'Observaciones',
      render: (r) => (
        <div className="max-w-xs text-xs text-slate-600">
          {r.observacion || '—'}
          {r.referenciaPago && (
            <p className="mt-0.5 text-slate-500">Ref. tarifa: {r.referenciaPago}</p>
          )}
        </div>
      ),
    },
    {
      key: 'fechaSolicitud',
      label: 'Solicitada',
      render: (r) => formatearFecha(r.fechaSolicitud),
    },
    {
      key: 'acciones',
      label: 'Rifa',
      render: (r) =>
        r.rifa ? (
          <Link to={`/organizador/rifas/${r.rifa.rifaId}`}>
            <Button size="sm" variant="secondary">
              Gestionar rifa
            </Button>
          </Link>
        ) : (
          <span className="text-xs text-slate-400">Pendiente</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis solicitudes de rifa</h1>
          <p className="text-sm text-slate-500">
            Seguimiento del estado y observaciones de tus propuestas
          </p>
        </div>
        <Link to="/solicitudes/nueva">
          <Button>
            <FilePlus2 className="h-4 w-4" />
            Nueva solicitud
          </Button>
        </Link>
      </div>

      <div className="w-full sm:w-64">
        <Select
          label="Filtrar por estado"
          placeholder="Todos"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'REVISION', label: 'En revisión' },
            { value: 'ESPERANDO_PAGO', label: 'Esperando pago' },
            { value: 'PAGO_CONFIRMADO', label: 'Pago confirmado' },
            { value: 'APROBADA', label: 'Aprobada' },
            { value: 'RECHAZADA', label: 'Rechazada' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        rowKey="rifaSolicitadaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Aún no enviaste solicitudes"
        emptyDescription="Crea tu primera solicitud de rifa para someterla a aprobación."
      />
    </div>
  );
}
