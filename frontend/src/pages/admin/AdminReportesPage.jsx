import { useQuery } from '@tanstack/react-query';
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

const PIE_COLORS = ['#10b981', '#0ea5e9', '#6366f1'];

export function AdminReportesPage() {
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['reportes-resumen'],
    queryFn: getReporteResumenApi,
  });

  const { data: causasData, isLoading: loadingCausas } = useQuery({
    queryKey: ['reportes-causas'],
    queryFn: getReporteCausasApi,
  });

  if (loadingResumen || loadingCausas) {
    return <FullPageSpinner message="Generando reportes globales..." />;
  }

  const causas = causasData?.items || [];
  const chartCausas = causas.map((c) => ({
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
    { key: 'nombre', label: 'Causa solidaria', render: (r) => <strong>{r.nombre}</strong> },
    { key: 'rifasCount', label: 'Rifas' },
    { key: 'meta', label: 'Meta', render: (r) => formatearBs(r.meta) },
    {
      key: 'recaudadoConfirmado',
      label: 'Recaudado confirmado',
      render: (r) => <span className="font-bold text-emerald-700">{formatearBs(r.recaudadoConfirmado)}</span>,
    },
    {
      key: 'porcentajeAvance',
      label: 'Avance meta',
      render: (r) => (r.porcentajeAvance !== null ? `${r.porcentajeAvance}%` : '—'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes y estadísticas</h1>
        <p className="text-sm text-slate-500">
          Consolidado financiero (solo pagos CONFIRMADOS) y avance por causas solidarias
        </p>
      </div>

      {resumen && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs text-slate-500">Recaudación confirmada</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              {formatearBs(resumen.recaudacionTotalConfirmada)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs text-slate-500">Pendiente de verificar</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">
              {formatearBs(resumen.recaudacionTotalPendiente)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs text-slate-500">Tickets vendidos</p>
            <p className="mt-1 text-2xl font-extrabold text-indigo-700">
              {resumen.ticketsVendidos}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs text-slate-500">Usuarios activos / totales</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {resumen.usuarios?.activos} / {resumen.usuarios?.totales}
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-slate-900">Recaudación confirmada por causa (Bs)</h2>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="mb-4 text-base font-bold text-slate-900">Rifas por estado</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartRifas} dataKey="value" nameKey="name" outerRadius={90} label>
                  {chartRifas.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={causas}
        rowKey="causaId"
        emptyTitle="No hay causas registradas"
      />
    </div>
  );
}

