import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Calendar, FileText, History, ShieldCheck, Users } from 'lucide-react';
import { getAuditoriaApi } from '../../features/panel/panelApi.js';
import { formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
} from '../../components/panel/PanelKit.jsx';

export function AdminAuditoriaPage() {
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-auditoria', { entidad, accion, page }],
    queryFn: () =>
      getAuditoriaApi({
        page,
        limit: 20,
        ...(entidad.trim() ? { entidad: entidad.trim() } : {}),
        ...(accion.trim() ? { accion: accion.trim() } : {}),
      }),
  });

  const items = useMemo(() => data?.items || [], [data]);
  const totalGlobal = data?.pagination?.total ?? items.length;
  const entidadesUnicas = new Set(items.map((i) => i.entidad)).size;
  const actoresUnicos = new Set(items.map((i) => i.usuarioId)).size;

  const columns = [
    {
      key: 'fecha',
      label: 'Fecha / Hora',
      icon: Calendar,
      render: (r) => <span className="text-xs font-medium text-slate-600">{formatearFecha(r.fecha)}</span>,
    },
    {
      key: 'usuario',
      label: 'Actor',
      icon: Users,
      render: (r) => (
        <span className="font-bold text-slate-900">{r.usuario?.alias || `ID ${r.usuarioId}`}</span>
      ),
    },
    {
      key: 'entidad',
      label: 'Entidad Afectada',
      icon: ShieldCheck,
      render: (r) => (
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
          {r.entidad} #{r.entidadId}
        </span>
      ),
    },
    {
      key: 'accion',
      label: 'Acción',
      icon: Activity,
      render: (r) => <Badge color="indigo">{r.accion}</Badge>,
    },
    {
      key: 'detalle',
      label: 'Payload / Detalle',
      icon: FileText,
      render: (r) => (
        <pre className="max-w-md overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-700">
          {r.detalle ? JSON.stringify(r.detalle) : '—'}
        </pre>
      ),
    },
  ];

  const hasFilters = Boolean(entidad.trim() || accion.trim());

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Bitácora Inmutable de Auditoría"
        subtitle="Trazabilidad de aprobaciones, pagos, sorteos, anulaciones y cambios de permisos"
        searchValue={accion}
        onSearchChange={(val) => {
          setAccion(val);
          setPage(1);
        }}
        searchPlaceholder="Filtrar por acción (ej. CONFIRMAR_PAGO, REALIZAR_SORTEO)..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setEntidad('');
          setAccion('');
          setPage(1);
        }}
        selects={[
          {
            label: 'Entidad del sistema',
            value: entidad,
            onChange: (val) => {
              setEntidad(val);
              setPage(1);
            },
            options: [
              { value: '', label: 'Todas las entidades' },
              { value: 'pago', label: 'Pagos' },
              { value: 'rifa', label: 'Rifas' },
              { value: 'solicitud', label: 'Solicitudes' },
              { value: 'usuario', label: 'Usuarios' },
              { value: 'premio', label: 'Premios' },
            ],
          },
        ]}
      />

      <PanelSectionHeader
        icon={History}
        title="Eventos Registrados en Bitácora"
        subtitle="Historial inmutable de operaciones"
        badgeText={`${totalGlobal} eventos`}
        accent="indigo"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Eventos Totales',
            value: totalGlobal,
            trendText: 'Registro inmutable',
            icon: History,
            accent: 'indigo',
          },
          {
            label: 'Entidades en Página',
            value: entidadesUnicas,
            trendText: 'Módulos auditados',
            icon: ShieldCheck,
            accent: 'emerald',
          },
          {
            label: 'Actores Distintos (pág.)',
            value: actoresUnicos,
            trendText: 'Trazabilidad por usuario',
            icon: Users,
            accent: 'sky',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        rowKey="auditoriaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={totalGlobal}
        pageSize={20}
        itemLabel="eventos"
        onPageChange={setPage}
        emptyTitle="Sin eventos de auditoría"
        emptyDescription="Prueba limpiando los filtros para ver todos los registros."
      />
    </div>
  );
}
