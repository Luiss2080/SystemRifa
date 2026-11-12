import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
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
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export function NotificacionesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
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

  if (isLoading) return <FullPageSpinner message="Cargando notificaciones..." />;

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 shadow-2xs">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Notificaciones
                </h1>
                <Badge color={(data?.noLeidasCount || 0) > 0 ? 'amber' : 'emerald'}>
                  {data?.noLeidasCount || 0} sin leer
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Avisos en tiempo real sobre tus reservas, pagos verificados y resultados de sorteos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setSoloNoLeidas(false);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  !soloNoLeidas ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => {
                  setSoloNoLeidas(true);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  soloNoLeidas ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sin leer ({data?.noLeidasCount || 0})
              </button>
            </div>
            {(data?.noLeidasCount || 0) > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarcarTodas}>
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                Marcar todas leídas
              </Button>
            )}
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No hay notificaciones"
          description={
            soloNoLeidas
              ? 'No tienes notificaciones pendientes por leer.'
              : 'Aquí aparecerán tus avisos de reservas, pagos y sorteos.'
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.notificacionId}
              className={`relative overflow-hidden rounded-3xl border p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 ${
                n.leida
                  ? 'border-slate-200/90 bg-white/95'
                  : 'border-emerald-300 bg-emerald-50/55 ring-1 ring-emerald-200/60'
              }`}
            >
              {!n.leida && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
              )}
              <div className="flex items-start justify-between gap-3">
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

                <div className="flex shrink-0 items-center gap-1">
                  {!n.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Marcar como leída"
                      onClick={() => handleMarcarLeida(n.notificacionId)}
                    >
                      <Check className="h-4 w-4 text-emerald-700" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Eliminar"
                    onClick={() => handleEliminar(n.notificacionId)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-2xs">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs font-bold text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

