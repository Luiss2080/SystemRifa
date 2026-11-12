import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, Check, CheckCheck, MailCheck, Trash2 } from 'lucide-react';
import {
  eliminarNotificacion,
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../features/rifas/publicApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { formatearFecha } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PaginationCard } from '../components/ui/DataTable.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../components/panel/PanelKit.jsx';

export function NotificacionesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-notificaciones', { soloNoLeidas, page }],
    queryFn: () =>
      getMisNotificaciones({
        page,
        limit: 15,
        ...(soloNoLeidas ? { noLeidas: true } : {}),
      }),
  });

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['mis-notificaciones'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-badge'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-popover'] });
  }

  async function handleMarcarLeida(id) {
    try {
      await marcarNotificacionLeida(id);
      invalidar();
    } catch (err) {
      toast.error('Error', extraerErrorApi(err).message);
    }
  }

  async function handleMarcarTodas() {
    try {
      await marcarTodasNotificacionesLeidas();
      invalidar();
      toast.success('Listo', 'Todas las notificaciones marcadas como leídas.');
    } catch (err) {
      toast.error('Error', extraerErrorApi(err).message);
    }
  }

  async function handleEliminar(id) {
    try {
      await eliminarNotificacion(id);
      invalidar();
    } catch (err) {
      toast.error('Error', extraerErrorApi(err).message);
    }
  }

  const itemsFiltrados = useMemo(() => {
    const raw = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (n) =>
        (n.titulo || '').toLowerCase().includes(q) ||
        (n.mensaje || '').toLowerCase().includes(q)
    );
  }, [data, busqueda]);

  if (isLoading) return <FullPageSpinner message="Cargando notificaciones..." />;

  const pagination = data?.pagination || { page: 1, totalPages: 1, total: itemsFiltrados.length };
  const totalAlertas = pagination.total ?? (data?.items?.length || 0);
  const sinLeer = data?.noLeidasCount || 0;
  const leidas = Math.max(0, totalAlertas - sinLeer);

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Centro de Notificaciones & Alertas"
        subtitle="Avisos en tiempo real sobre reservas, comprobantes verificados, solicitudes y sorteos."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por asunto o detalle de la notificación..."
        hasActiveFilters={Boolean(busqueda || soloNoLeidas)}
        onResetFilters={() => {
          setBusqueda('');
          setSoloNoLeidas(false);
          setPage(1);
        }}
        selects={[
          {
            label: 'Filtrar lectura',
            value: soloNoLeidas ? 'NO_LEIDAS' : 'TODAS',
            onChange: (val) => {
              setSoloNoLeidas(val === 'NO_LEIDAS');
              setPage(1);
            },
            options: [
              { value: 'TODAS', label: 'Todas las notificaciones' },
              { value: 'NO_LEIDAS', label: `Sin leer (${sinLeer})` },
            ],
          },
        ]}
        rightActions={
          sinLeer > 0 ? (
            <Button variant="secondary" size="sm" onClick={handleMarcarTodas}>
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              Marcar todas leídas
            </Button>
          ) : null
        }
      />

      <PanelSectionHeader
        icon={Bell}
        title="Bandeja de Avisos Recibidos"
        subtitle="Sincronización automática con la actividad de tu cuenta"
        badgeText={`${sinLeer} Sin leer`}
        accent={sinLeer > 0 ? 'amber' : 'emerald'}
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total notificaciones',
            value: totalAlertas,
            trendText: 'Historial acumulado',
            icon: BellRing,
            accent: 'indigo',
          },
          {
            label: 'Sin leer',
            value: sinLeer,
            trendText: sinLeer > 0 ? 'Requieren revisión' : 'Todo al día',
            icon: Bell,
            accent: 'amber',
          },
          {
            label: 'Leídas',
            value: leidas,
            trendText: 'Avisos atendidos',
            icon: MailCheck,
            accent: 'emerald',
          },
        ]}
      />

      {itemsFiltrados.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No hay notificaciones"
          description={
            soloNoLeidas || busqueda
              ? 'No tienes notificaciones que coincidan con el filtro aplicado.'
              : 'Aquí aparecerán tus avisos de reservas, pagos y sorteos.'
          }
        />
      ) : (
        <div className="space-y-3">
          {itemsFiltrados.map((n) => (
            <div
              key={n.notificacionId}
              className={`relative overflow-hidden rounded-3xl border p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 ${
                n.leida
                  ? 'border-slate-200/85 bg-white'
                  : 'border-emerald-300 bg-emerald-50/55 ring-1 ring-emerald-200/60'
              }`}
            >
              {!n.leida && (
                <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-500" />
              )}
              <div className="flex items-start justify-between gap-3 pl-1">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-900">{n.titulo}</h2>
                    {!n.leida && <Badge color="emerald">Nueva</Badge>}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{n.mensaje}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {formatearFecha(n.fechaCreacion)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {!n.leida && (
                    <RowActionButton
                      icon={Check}
                      title="Marcar como leída"
                      tone="primary"
                      onClick={() => handleMarcarLeida(n.notificacionId)}
                    />
                  )}
                  <RowActionButton
                    icon={Trash2}
                    title="Eliminar notificación"
                    tone="danger"
                    onClick={() => handleEliminar(n.notificacionId)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {itemsFiltrados.length > 0 && (
        <PaginationCard
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          total={totalAlertas}
          showingFrom={(pagination.page - 1) * 15 + 1}
          showingTo={(pagination.page - 1) * 15 + itemsFiltrados.length}
          onPageChange={setPage}
          itemLabel="notificaciones"
        />
      )}
    </div>
  );
}
