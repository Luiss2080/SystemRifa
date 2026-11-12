import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, ClipboardList, Clock, DollarSign, History, Ticket, Users } from 'lucide-react';
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
      render: (r) =>
        r.porcentajeAvance !== null ? (
          <div className="flex min-w-28 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, Number(r.porcentajeAvance) || 0)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700">{r.porcentajeAvance}%</span>
          </div>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-white via-emerald-50/70 to-teal-50/70 p-6 shadow-xs backdrop-blur-md">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
            Analítica ejecutiva en tiempo real
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Reportes y estadísticas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Consolidado financiero (exclusivamente pagos CONFIRMADOS) y cumplimiento de metas
            solidarias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/solicitudes"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <ClipboardList className="h-3.5 w-3.5 text-emerald-600" />
            Solicitudes
          </Link>
          <Link
            to="/admin/pagos"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
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
      </section>

      {resumen && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-emerald-500 bg-white/90 p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Recaudación confirmada</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-emerald-700">
              {formatearBs(resumen.recaudacionTotalConfirmada)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-amber-500 bg-white/90 p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Pendiente de verificar</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-amber-600">
              {formatearBs(resumen.recaudacionTotalPendiente)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-indigo-500 bg-white/90 p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Tickets vendidos</span>
              <Ticket className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-indigo-700">
              {resumen.ticketsVendidos}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-sky-500 bg-white/90 p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Usuarios activos / totales</span>
              <Users className="h-4 w-4 text-sky-600" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
              {resumen.usuarios?.activos} / {resumen.usuarios?.totales}
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs backdrop-blur-md lg:col-span-2">
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

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs backdrop-blur-md">
          <h2 className="mb-4 text-base font-bold text-slate-900">Rifas por estado</h2>
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
        data={causas}
        rowKey="causaId"
        emptyTitle="No hay causas registradas"
      />
    </div>
  );
}
