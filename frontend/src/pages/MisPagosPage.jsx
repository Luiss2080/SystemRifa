import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Hash,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react';
import { getMisPagos } from '../features/rifas/publicApi.js';
import { formatearBs, formatearFecha } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../components/panel/PanelKit.jsx';

const ESTADOS_PAGO = [
  { key: '', label: 'Todos los estados' },
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'CONFIRMADO', label: 'Confirmados' },
  { key: 'RECHAZADO', label: 'Rechazados' },
];

export function MisPagosPage() {
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
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

  const itemsFiltrados = useMemo(() => {
    const raw = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (r) =>
        (r.rifa?.nombre || '').toLowerCase().includes(q) ||
        (r.referencia || '').toLowerCase().includes(q) ||
        (r.metodo || '').toLowerCase().includes(q) ||
        String(r.pagoId).includes(q)
    );
  }, [data, busqueda]);

  const rawItems = data?.items || [];
  const confirmadosCount = rawItems.filter((p) => p.estado === 'CONFIRMADO').length;
  const pendientesCount = rawItems.filter((p) => p.estado === 'PENDIENTE').length;

  const columns = [
    {
      key: 'pagoId',
      label: 'ID',
      icon: Hash,
      render: (r) => <span className="font-mono font-semibold text-slate-700">#{r.pagoId}</span>,
    },
    {
      key: 'rifa',
      label: 'Rifa',
      icon: Ticket,
      render: (r) => (
        <Link to={`/rifas/${r.rifaId}`} className="font-bold text-emerald-700 hover:underline">
          {r.rifa?.nombre || `Rifa #${r.rifaId}`}
        </Link>
      ),
    },
    {
      key: 'tickets',
      label: 'Números',
      icon: Hash,
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {(r.tickets || []).map((t) => `#${t.numeroTicket}`).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'monto',
      label: 'Monto',
      icon: DollarSign,
      render: (r) => <span className="font-extrabold text-emerald-700">{formatearBs(r.monto)}</span>,
    },
    {
      key: 'metodo',
      label: 'Método',
      icon: CreditCard,
      render: (r) => <span className="text-xs font-medium text-slate-700">{r.metodo}</span>,
    },
    {
      key: 'referencia',
      label: 'Referencia',
      icon: FileText,
      render: (r) => <span className="text-xs text-slate-600">{r.referencia || '—'}</span>,
    },
    {
      key: 'estado',
      label: 'Estado',
      icon: SlidersHorizontal,
      render: (r) => <Badge estado={r.estado} />,
    },
    {
      key: 'fecha',
      label: 'Fecha',
      icon: CalendarClock,
      render: (r) => <span className="text-xs text-slate-600">{formatearFecha(r.fecha)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Libro Contable de Mis Pagos"
        subtitle="Historial completo de comprobantes enviados, referencias bancarias y validación administrativa."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por rifa, referencia, método o ID de pago..."
        hasActiveFilters={Boolean(busqueda || estado)}
        onResetFilters={() => {
          setBusqueda('');
          setEstado('');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado del pago',
            value: estado,
            onChange: (val) => {
              setEstado(val);
              setPage(1);
            },
            options: ESTADOS_PAGO.map((opt) => ({ value: opt.key, label: opt.label })),
          },
        ]}
        rightActions={
          <Link to="/mis-tickets">
            <Button variant="secondary" size="sm">
              <Ticket className="h-4 w-4 text-emerald-600" />
              Ir a mis tickets
            </Button>
          </Link>
        }
        extraContent={
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 px-4 py-2.5 text-xs text-slate-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Cuando envías un comprobante queda en estado <strong>PENDIENTE</strong>. Apenas un
              administrador lo valide, tus números pasarán a <strong>VENDIDO</strong> y recibirás
              una notificación.
            </span>
          </div>
        }
      />

      <PanelSectionHeader
        icon={Receipt}
        title="Comprobantes & Validaciones"
        subtitle="Trazabilidad de aportes a causas solidarias"
        badgeText={`${data?.pagination?.total ?? itemsFiltrados.length} Pagos`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total comprobantes',
            value: data?.pagination?.total ?? rawItems.length,
            trendText: 'Historial enviado',
            icon: CreditCard,
            accent: 'indigo',
          },
          {
            label: 'Confirmados (página)',
            value: confirmadosCount,
            trendText: 'Validados por administración',
            icon: CheckCircle2,
            accent: 'emerald',
          },
          {
            label: 'Pendientes (página)',
            value: pendientesCount,
            trendText: 'En verificación',
            icon: Clock,
            accent: 'amber',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={itemsFiltrados}
        loading={isLoading}
        rowKey="pagoId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        itemLabel="pagos"
        emptyTitle="Sin pagos registrados"
        emptyDescription="Cuando reserves tickets y envíes un pago, aparecerá aquí."
      />
    </div>
  );
}
