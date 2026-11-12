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
      <section className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-white/90 to-emerald-50/85 p-6 shadow-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
              Flujo de aprobación en 4 etapas
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Mis solicitudes de rifa
            </h1>
            <p className="text-sm text-slate-600">
              Sigue en tiempo real la revisión, habilitación de tarifa y aprobación de tus propuestas.
            </p>
          </div>
          <Link to="/solicitudes/nueva">
            <Button>
              <FilePlus2 className="h-4 w-4" />
              Nueva solicitud
            </Button>
          </Link>
        </div>

        <div className="mt-5 grid gap-2 border-t border-amber-200/60 pt-4 text-xs text-slate-700 sm:grid-cols-4">
          {[
            { n: '1', t: 'Envías tu propuesta', badge: 'bg-amber-100 text-amber-800' },
            { n: '2', t: 'Revisión y tarifa', badge: 'bg-sky-100 text-sky-800' },
            { n: '3', t: 'Confirmación de pago', badge: 'bg-indigo-100 text-indigo-800' },
            { n: '4', t: 'Cargas premios y lanzas', badge: 'bg-emerald-100 text-emerald-800' },
          ].map((step) => (
            <div
              key={step.n}
              className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/80 px-3 py-2 shadow-2xs"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-extrabold ${step.badge}`}
              >
                {step.n}
              </span>
              <span className="font-semibold">{step.t}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200/80 bg-white/85 p-2.5 shadow-xs backdrop-blur-md">
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
