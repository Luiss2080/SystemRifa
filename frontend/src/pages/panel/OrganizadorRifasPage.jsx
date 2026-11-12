import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Settings2, Ticket } from 'lucide-react';
import { getMisRifasApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFechaCorta } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../../components/ui/Skeleton.jsx';

const ESTADOS_RIFA = [
  { key: '', label: 'Todas' },
  { key: 'ACTIVA', label: 'Activas' },
  { key: 'EXTENDIDA', label: 'Extendidas' },
  { key: 'FINALIZADA', label: 'Finalizadas' },
];

export function OrganizadorRifasPage() {
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-rifas-org', { estado, page }],
    queryFn: () =>
      getMisRifasApi({
        page,
        limit: 12,
        ...(estado ? { estado } : {}),
      }),
  });

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis rifas</h1>
          <p className="text-sm text-slate-500">
            Administra premios, fechas de cierre, sorteos y entregas de tus rifas aprobadas
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ESTADOS_RIFA.map((tab) => (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => {
                setEstado(tab.key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                estado === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tienes rifas creadas"
          description="Cuando tu solicitud sea aprobada por un administrador aparecerá aquí."
          action={
            <Link to="/solicitudes/nueva">
              <Button>Solicitar nueva rifa</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => {
            const vendidos = r.conteos?.VENDIDO ?? 0;
            const totalTickets = Math.max(1, r.cantidadTickets || 1);
            const pctVendido = Math.min(100, Math.round((vendidos / totalTickets) * 100));
            const sinPremios = r.estado !== 'FINALIZADA' && (r.premiosActivosCount ?? 0) === 0;

            return (
              <div
                key={r.rifaId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{r.nombre}</h2>
                    <Badge estado={r.estado} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Causa: {r.causa?.nombre || 'Sin causa'} · Cierre: {formatearFechaCorta(r.fechaFin)}
                  </p>

                  {sinPremios && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      Falta cargar al menos 1 premio activo
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                    <div>
                      <p className="text-slate-500">Precio</p>
                      <p className="font-bold text-emerald-700">{formatearBs(r.precioTicket)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Disp.</p>
                      <p className="font-bold">{r.conteos?.DISPONIBLE ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Vend.</p>
                      <p className="font-bold text-indigo-700">{vendidos}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Premios</p>
                      <p className="font-bold text-amber-700">{r.premiosActivosCount ?? 0}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pctVendido}%` }}
                      />
                    </div>
                    <p className="text-right text-[11px] font-medium text-slate-500">
                      {pctVendido}% vendido ({vendidos}/{r.cantidadTickets})
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Link to={`/organizador/rifas/${r.rifaId}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <Settings2 className="h-4 w-4" />
                      Gestionar premios y sorteo
                    </Button>
                  </Link>
                  <Link to={`/rifas/${r.rifaId}`}>
                    <Button variant="secondary" size="sm">
                      Ver pública
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="self-center text-sm text-slate-600">
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
