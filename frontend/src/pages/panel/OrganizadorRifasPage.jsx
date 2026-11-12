import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  PlusCircle,
  Settings2,
  Ticket,
  Trophy,
} from 'lucide-react';
import { getMisRifasApi } from '../../features/panel/panelApi.js';
import { formatearBs, formatearFechaCorta } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PaginationCard } from '../../components/ui/DataTable.jsx';
import { EmptyState } from '../../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../../components/ui/Skeleton.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../../components/panel/PanelKit.jsx';

const ESTADOS_RIFA = [
  { key: '', label: 'Todas las rifas' },
  { key: 'ACTIVA', label: 'Activas' },
  { key: 'EXTENDIDA', label: 'Extendidas' },
  { key: 'FINALIZADA', label: 'Finalizadas' },
];

export function OrganizadorRifasPage() {
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
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

  const items = useMemo(() => {
    const raw = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (r) =>
        r.nombre?.toLowerCase().includes(q) || r.causa?.nombre?.toLowerCase().includes(q)
    );
  }, [data, busqueda]);
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: items.length };

  const rawItems = data?.items || [];
  const activasCount = rawItems.filter((r) => r.estado === 'ACTIVA' || r.estado === 'EXTENDIDA').length;
  const finalizadasCount = rawItems.filter((r) => r.estado === 'FINALIZADA').length;
  const totalVendidos = rawItems.reduce((acc, r) => acc + (r.conteos?.VENDIDO ?? 0), 0);

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Gestión de Campañas & Rifas Aprobadas"
        subtitle="Configura premios, controla fechas de cierre, ejecuta sorteos verificables y registra entregas."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar rifa por nombre o causa solidaria..."
        hasActiveFilters={Boolean(busqueda || estado)}
        onResetFilters={() => {
          setBusqueda('');
          setEstado('');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado de rifa',
            value: estado,
            onChange: (val) => {
              setEstado(val);
              setPage(1);
            },
            options: ESTADOS_RIFA.map((t) => ({ value: t.key, label: t.label })),
          },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/solicitudes/mias">
              <Button variant="secondary" size="sm">
                <ClipboardList className="h-4 w-4 text-slate-600" />
                Mis solicitudes
              </Button>
            </Link>
            <Link to="/solicitudes/nueva">
              <Button size="sm">
                <PlusCircle className="h-4 w-4" />
                Nueva solicitud
              </Button>
            </Link>
          </div>
        }
      />

      <PanelSectionHeader
        icon={Trophy}
        title="Portafolio de Rifas del Organizador"
        subtitle="Supervisión de inventario de tickets, premios y sorteos"
        badgeText={`${pagination.total ?? items.length} Campañas registradas`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Rifas registradas',
            value: pagination.total ?? rawItems.length,
            trendText: 'Total de campañas',
            icon: Ticket,
            accent: 'emerald',
          },
          {
            label: 'En curso (página)',
            value: activasCount,
            trendText: 'Activas o extendidas',
            icon: CheckCircle2,
            accent: 'sky',
          },
          {
            label: 'Tickets vendidos (página)',
            value: totalVendidos,
            trendText: 'Participaciones confirmadas',
            icon: Award,
            accent: 'indigo',
          },
          {
            label: 'Finalizadas (página)',
            value: finalizadasCount,
            trendText: 'Sorteos completados',
            icon: Trophy,
            accent: 'amber',
          },
        ]}
      />

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={busqueda ? 'Sin coincidencias en tus rifas' : 'No tienes rifas creadas'}
          description={
            busqueda
              ? 'Prueba con otro término o limpia el filtro.'
              : 'Cuando tu solicitud sea aprobada por un administrador aparecerá aquí.'
          }
          action={
            busqueda ? (
              <Button variant="secondary" onClick={() => setBusqueda('')}>
                Limpiar búsqueda
              </Button>
            ) : (
              <Link to="/solicitudes/nueva">
                <Button>Solicitar nueva rifa</Button>
              </Link>
            )
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
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    r.estado === 'FINALIZADA'
                      ? 'from-slate-400 to-slate-600'
                      : r.estado === 'EXTENDIDA'
                      ? 'from-amber-400 to-orange-500'
                      : 'from-emerald-500 to-teal-500'
                  }`}
                />
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Rifa #{r.rifaId} · {r.causa?.nombre || 'Sin causa asignada'}
                        </p>
                        <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">{r.nombre}</h2>
                      </div>
                      <Badge estado={r.estado} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Cierre programado:{' '}
                      <span className="font-semibold text-slate-700">
                        {formatearFechaCorta(r.fechaFin)}
                      </span>
                    </p>

                    {sinPremios && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        Falta cargar al menos 1 premio activo
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center text-xs">
                      <div>
                        <p className="text-slate-500">Precio</p>
                        <p className="font-bold text-emerald-700">{formatearBs(r.precioTicket)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Disp.</p>
                        <p className="font-bold text-slate-800">{r.conteos?.DISPONIBLE ?? 0}</p>
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
                          className="h-full rounded-full bg-emerald-500 transition-all"
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
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver pública
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <PaginationCard
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          total={pagination.total || items.length}
          showingFrom={(pagination.page - 1) * 12 + 1}
          showingTo={(pagination.page - 1) * 12 + items.length}
          onPageChange={setPage}
          itemLabel="rifas"
        />
      )}
    </div>
  );
}
