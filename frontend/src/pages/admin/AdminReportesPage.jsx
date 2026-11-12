import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  Clock,
  DollarSign,
  Hash,
  HeartHandshake,
  History,
  Target,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getReporteCausasApi, getReporteResumenApi } from '../../features/panel/panelApi.js';
import { formatearBs } from '../../utils/format.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { FullPageSpinner } from '../../components/ui/Feedback.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../../components/panel/PanelKit.jsx';

const PIE_COLORS = ['#10b981', '#0ea5e9', '#6366f1'];

export function AdminReportesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recaudado_desc');

  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['reportes-resumen'],
    queryFn: getReporteResumenApi,
  });

  const { data: causasData, isLoading: loadingCausas } = useQuery({
    queryKey: ['reportes-causas'],
    queryFn: getReporteCausasApi,
  });

  const causasFiltradas = useMemo(() => {
    const raw = causasData?.items || [];
    const q = busqueda.trim().toLowerCase();
    const filtered = q
      ? raw.filter((c) => (c.nombre || '').toLowerCase().includes(q))
      : [...raw];

    filtered.sort((a, b) => {
      if (orden === 'avance_desc') {
        return Number(b.porcentajeAvance || 0) - Number(a.porcentajeAvance || 0);
      }
      if (orden === 'nombre_asc') {
        return (a.nombre || '').localeCompare(b.nombre || '');
      }
      if (orden === 'rifas_desc') {
        return Number(b.rifasCount || 0) - Number(a.rifasCount || 0);
      }
      return Number(b.recaudadoConfirmado || 0) - Number(a.recaudadoConfirmado || 0);
    });
    return filtered;
  }, [causasData, busqueda, orden]);

  if (loadingResumen || loadingCausas) {
    return <FullPageSpinner message="Generando reportes globales..." />;
  }

  const chartCausas = causasFiltradas.map((c) => ({
    nombre: c.nombre.length > 18 ? `${c.nombre.slice(0, 18)}…` : c.nombre,
    recaudado: Number(c.recaudadoConfirmado || 0),
    meta: Number(c.meta || 0),
  }));

  const chartRifas = resumen?.rifasPorEstado
    ? [
        { name: 'Activas', value: resumen.rifasPorEstado.ACTIVA || 0 },
        { name: 'Extendidas', value: resumen.rifasPorEstado.EXTENDIDA || 0 },
        { name: 'Finalizadas', value: resumen.rifasPorEstado.FINALIZADA || 0 },
      ]
    : [];

  const columns = [
    {
      key: 'nombre',
      label: 'Causa solidaria',
      icon: HeartHandshake,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.nombre}</p>
          <p className="text-[11px] text-slate-500">ID #{r.causaId}</p>
        </div>
      ),
    },
    {
      key: 'rifasCount',
      label: 'Rifas',
      icon: Hash,
      render: (r) => (
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {r.rifasCount} rifa(s)
        </span>
      ),
    },
    {
      key: 'meta',
      label: 'Meta',
      icon: Target,
      render: (r) => <span className="font-semibold text-slate-700">{formatearBs(r.meta)}</span>,
    },
    {
      key: 'recaudadoConfirmado',
      label: 'Recaudado confirmado',
      icon: DollarSign,
      render: (r) => <span className="font-extrabold text-emerald-700">{formatearBs(r.recaudadoConfirmado)}</span>,
    },
    {
      key: 'porcentajeAvance',
      label: 'Avance meta',
      icon: TrendingUp,
      render: (r) =>
        r.porcentajeAvance !== null ? (
          <div className="flex min-w-32 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, Number(r.porcentajeAvance) || 0)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{r.porcentajeAvance}%</span>
          </div>
        ) : (
          '—'
        ),
    },
  ];

  const hasActiveFilters = Boolean(busqueda.trim() || orden !== 'recaudado_desc');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Analítica Financiera & Metas Solidarias"
        subtitle="Consolidado en tiempo real sobre pagos confirmados, desempeño de campañas y metas."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar causa solidaria en el reporte..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={() => {
          setBusqueda('');
          setOrden('recaudado_desc');
        }}
        selects={[
          {
            label: 'Ordenar causas por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recaudado_desc', label: 'Mayor recaudación' },
              { value: 'avance_desc', label: 'Mayor % avance' },
              { value: 'rifas_desc', label: 'Más rifas' },
              { value: 'nombre_asc', label: 'Nombre A-Z' },
            ],
          },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/solicitudes"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <ClipboardList className="h-3.5 w-3.5 text-emerald-600" />
              Solicitudes
            </Link>
            <Link
              to="/admin/pagos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
            >
              <CheckSquare className="h-3.5 w-3.5 text-amber-600" />
              Verificar pagos
            </Link>
            <Link
              to="/admin/auditoria"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <History className="h-3.5 w-3.5" />
              Auditoría
            </Link>
          </div>
        }
      />

      <PanelSectionHeader
        icon={BarChart3}
        title="Indicadores Globales del Sistema"
        subtitle="Pagos confirmados · estados de campaña · participación registrada"
        badgeText={`${causasFiltradas.length} Causas evaluadas`}
        accent="emerald"
      />

      {resumen && (
        <PanelKpiGrid
          items={[
            {
              label: 'Recaudación confirmada',
              value: formatearBs(resumen.recaudacionTotalConfirmada),
              trendText: 'Exclusivo pagos confirmados',
              icon: DollarSign,
              accent: 'emerald',
            },
            {
              label: 'Pendiente de verificar',
              value: formatearBs(resumen.recaudacionTotalPendiente),
              trendText: 'Comprobantes en cola',
              icon: Clock,
              accent: 'amber',
            },
            {
              label: 'Tickets vendidos',
              value: resumen.ticketsVendidos ?? 0,
              trendText: 'Participación acreditada',
              icon: Ticket,
              accent: 'indigo',
            },
            {
              label: 'Usuarios activos / totales',
              value: `${resumen.usuarios?.activos ?? 0} / ${resumen.usuarios?.totales ?? 0}`,
              trendText: 'Comunidad registrada',
              icon: Users,
              accent: 'sky',
            },
          ]}
        />
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Recaudación confirmada por causa (Bs)
              </h2>
              <p className="text-xs text-slate-500">Comparativa de ingresos validados por causa</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              {chartCausas.length} causas
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCausas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => formatearBs(val)} />
                <Bar dataKey="recaudado" name="Recaudado" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs">
          <div className="mb-3">
            <h2 className="text-base font-extrabold text-slate-900">Rifas por estado</h2>
            <p className="text-xs text-slate-500">Distribución operativa actual</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartRifas} dataKey="value" nameKey="name" outerRadius={85} label>
                  {chartRifas.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-slate-600">
            {chartRifas.map((entry, idx) => (
              <span key={entry.name} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                {entry.name}: <strong>{entry.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={causasFiltradas}
        rowKey="causaId"
        clientPageSize={8}
        itemLabel="causas"
        emptyTitle="No hay causas registradas"
        emptyDescription="Ajusta la búsqueda o crea nuevas causas solidarias."
      />
    </div>
  );
}
