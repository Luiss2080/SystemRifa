import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Calendar, Eye, FileText, History, RefreshCw, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { getAuditoriaApi } from '../../features/panel/panelApi.js';
import { formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

export function AdminAuditoriaPage() {
  const queryClient = useQueryClient();
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [page, setPage] = useState(1);
  const [eventoDetalle, setEventoDetalle] = useState(null);

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

  const items = useMemo(() => {
    let list = data?.items || [];
    if (orden === 'antiguos') {
      list = [...list].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else {
      list = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    return list;
  }, [data, orden]);
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
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (r) => (
        <RowActionButton
          icon={Eye}
          title="Ver registro completo de auditoría"
          tone="view"
          onClick={() => setEventoDetalle(r)}
        />
      ),
    },
  ];

  const hasFilters = Boolean(entidad.trim() || accion.trim() || orden !== 'recientes');

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
          setOrden('recientes');
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
          {
            label: 'Ordenar por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'antiguos', label: 'Más antiguos' },
            ],
          },
        ]}
        rightActions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-auditoria'] })}
          >
            <RefreshCw className="h-4 w-4 text-emerald-600" />
            Refrescar bitácora
          </Button>
        }
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

      {/* Modal Compacto y Horizontal de Detalle de Auditoría */}
      <Modal
        open={Boolean(eventoDetalle)}
        onClose={() => setEventoDetalle(null)}
        title={`Evento #${eventoDetalle?.auditoriaId || ''} · ${eventoDetalle?.accion || ''}`}
        description="Registro inmutable de trazabilidad con metadatos del actor y payload del cambio."
        badge="Auditoría Forense"
        icon={History}
        maxWidth="max-w-4xl"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setEventoDetalle(null)}>
            Cerrar
          </Button>
        }
      >
        {eventoDetalle && (
          <div className="grid gap-4 md:grid-cols-12 items-start">
            {/* Columna Izquierda (5 cols): Metadatos */}
            <div className="space-y-3 md:col-span-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs">
              <div className="border-b border-slate-200/60 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Fecha y Hora
                </span>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {formatearFecha(eventoDetalle.fecha)}
                </p>
              </div>

              <div className="border-b border-slate-200/60 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Actor responsable
                </span>
                <p className="font-extrabold text-slate-900 mt-0.5">
                  {eventoDetalle.usuario?.nombres ? `${eventoDetalle.usuario.nombres} ${eventoDetalle.usuario.apellidos || ''}` : eventoDetalle.usuario?.alias || `ID ${eventoDetalle.usuarioId}`}
                </p>
                <p className="text-[11px] text-slate-500">{eventoDetalle.usuario?.email || '—'}</p>
              </div>

              <div className="border-b border-slate-200/60 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Entidad y Registro
                </span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {eventoDetalle.entidad} #{eventoDetalle.entidadId}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Acción auditada
                </span>
                <div className="mt-1">
                  <Badge color="indigo">{eventoDetalle.accion}</Badge>
                </div>
              </div>
            </div>

            {/* Columna Derecha (7 cols): Payload completo formateado */}
            <div className="space-y-1.5 md:col-span-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detalle / Payload JSON
                </span>
                <span className="text-[10px] font-mono text-slate-400">Inmutable</span>
              </div>
              <pre className="max-h-64 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-400 shadow-inner">
                {JSON.stringify(eventoDetalle.detalle, null, 2) || '{}'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
