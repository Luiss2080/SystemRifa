import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilePlus2 } from 'lucide-react';
import { getMisSolicitudesApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const ESTADOS_SOLICITUD = [
  { key: '', label: 'Todas' },
  { key: 'REVISION', label: 'En revisión' },
  { key: 'ESPERANDO_PAGO', label: 'Esperando pago' },
  { key: 'PAGO_CONFIRMADO', label: 'Pago confirmado' },
  { key: 'APROBADA', label: 'Aprobadas' },
  { key: 'RECHAZADA', label: 'Rechazadas' },
];

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

      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 shadow-xs sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            1
          </span>
          <span>Envías tu propuesta y pasa a revisión</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            2
          </span>
          <span>Se habilita tarifa y se confirma pago</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            3
          </span>
          <span>Al aprobarse, cargas premios y gestionas tu rifa</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ESTADOS_SOLICITUD.map((chip) => (
          <button
            key={chip.key || 'all'}
            type="button"
            onClick={() => {
              setEstado(chip.key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              estado === chip.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
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
