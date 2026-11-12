import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FilePlus2,
  FileText,
  Hash,
  MessageSquareText,
  Settings2,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react';
import { getMisSolicitudesApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../../components/panel/PanelKit.jsx';

const ESTADOS_SOLICITUD = [
  { key: '', label: 'Todas las solicitudes' },
  { key: 'REVISION', label: 'En revisión' },
  { key: 'ESPERANDO_PAGO', label: 'Esperando pago' },
  { key: 'PAGO_CONFIRMADO', label: 'Pago confirmado' },
  { key: 'APROBADA', label: 'Aprobadas' },
  { key: 'RECHAZADA', label: 'Rechazadas' },
];

export function MisSolicitudesPage() {
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
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

  const itemsFiltrados = useMemo(() => {
    const raw = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (r) =>
        (r.nombre || '').toLowerCase().includes(q) ||
        (r.observacion || '').toLowerCase().includes(q) ||
        (r.referenciaPago || '').toLowerCase().includes(q) ||
        String(r.rifaSolicitadaId).includes(q)
    );
  }, [data, busqueda]);

  const rawItems = data?.items || [];
  const aprobadasCount = rawItems.filter((r) => r.estado === 'APROBADA').length;
  const enTramiteCount = rawItems.filter((r) =>
    ['REVISION', 'ESPERANDO_PAGO', 'PAGO_CONFIRMADO'].includes(r.estado)
  ).length;

  const columns = [
    {
      key: 'rifaSolicitadaId',
      label: 'ID',
      icon: Hash,
      render: (r) => <span className="font-mono font-semibold text-slate-700">#{r.rifaSolicitadaId}</span>,
    },
    {
      key: 'nombre',
      label: 'Propuesta de rifa',
      icon: Ticket,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.nombre}</p>
          <p className="text-xs text-slate-500">
            {r.cantidadTickets} tickets ·{' '}
            <strong className="text-emerald-700">{formatearBs(r.precioTicket)}</strong>
          </p>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      icon: SlidersHorizontal,
      render: (r) => <Badge estado={r.estado} />,
    },
    {
      key: 'observacion',
      label: 'Observaciones',
      icon: MessageSquareText,
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
      icon: CalendarClock,
      render: (r) => <span className="text-xs text-slate-600">{formatearFecha(r.fechaSolicitud)}</span>,
    },
    {
      key: 'acciones',
      label: 'Rifa',
      icon: Settings2,
      render: (r) =>
        r.rifa ? (
          <Link to={`/organizador/rifas/${r.rifa.rifaId}`}>
            <Button size="sm" variant="secondary">
              Gestionar rifa
            </Button>
          </Link>
        ) : (
          <span className="text-xs font-medium text-slate-400">Pendiente</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Seguimiento de Solicitudes de Rifa"
        subtitle="Sigue en tiempo real la revisión, habilitación de tarifa y aprobación de tus propuestas."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por nombre de rifa, ID o referencia..."
        hasActiveFilters={Boolean(busqueda || estado)}
        onResetFilters={() => {
          setBusqueda('');
          setEstado('');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado',
            value: estado,
            onChange: (val) => {
              setEstado(val);
              setPage(1);
            },
            options: ESTADOS_SOLICITUD.map((c) => ({ value: c.key, label: c.label })),
          },
        ]}
        rightActions={
          <Link to="/solicitudes/nueva">
            <Button size="sm">
              <FilePlus2 className="h-4 w-4" />
              Nueva solicitud
            </Button>
          </Link>
        }
        extraContent={
          <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '1', t: 'Envías tu propuesta', badge: 'bg-emerald-700 text-white' },
              { n: '2', t: 'Revisión y tarifa', badge: 'bg-amber-100 text-amber-800' },
              { n: '3', t: 'Confirmación de pago', badge: 'bg-teal-100 text-teal-800' },
              { n: '4', t: 'Cargas premios y lanzas', badge: 'bg-emerald-600 text-white' },
            ].map((step) => (
              <div
                key={step.n}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/75 px-3 py-2"
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
        }
      />

      <PanelSectionHeader
        icon={ClipboardList}
        title="Historial de Propuestas Enviadas"
        subtitle="Flujo de aprobación administrativa"
        badgeText={`${data?.pagination?.total ?? itemsFiltrados.length} Solicitudes`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total solicitudes',
            value: data?.pagination?.total ?? rawItems.length,
            trendText: 'Historial enviado',
            icon: FileText,
            accent: 'emerald',
          },
          {
            label: 'En trámite (página)',
            value: enTramiteCount,
            trendText: 'Revisión / Pago pendiente',
            icon: Clock,
            accent: 'amber',
          },
          {
            label: 'Aprobadas (página)',
            value: aprobadasCount,
            trendText: 'Listas para gestionar',
            icon: CheckCircle2,
            accent: 'indigo',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={itemsFiltrados}
        loading={isLoading}
        rowKey="rifaSolicitadaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        itemLabel="solicitudes"
        emptyTitle="Aún no enviaste solicitudes"
        emptyDescription="Crea tu primera solicitud de rifa para someterla a aprobación."
      />
    </div>
  );
}
