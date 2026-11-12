import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  FilePlus2,
  HeartHandshake,
  ShieldCheck,
  Target,
  Ticket,
} from 'lucide-react';
import { getCausasPublicas } from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { formatearBs, sumarMontosBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { PaginationCard } from '../components/ui/DataTable.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../components/panel/PanelKit.jsx';

const PALETAS_CAUSA = [
  {
    stripe: 'from-emerald-600 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badge: 'bg-emerald-50 text-emerald-800',
    hoverBorder: 'hover:border-emerald-300',
  },
  {
    stripe: 'from-sky-500 to-indigo-600',
    iconBg: 'bg-sky-50 text-sky-700 ring-sky-200',
    badge: 'bg-sky-50 text-sky-800',
    hoverBorder: 'hover:border-sky-300',
  },
  {
    stripe: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-50 text-teal-700 ring-teal-200',
    badge: 'bg-teal-50 text-teal-800',
    hoverBorder: 'hover:border-teal-300',
  },
  {
    stripe: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 text-amber-700 ring-amber-200',
    badge: 'bg-amber-50 text-amber-800',
    hoverBorder: 'hover:border-amber-300',
  },
];

export function CausasPublicPage() {
  const { autenticado, esAdmin, esOrganizador } = useAuth();
  const catalogoRuta = autenticado ? '/explorar' : '/';
  const [busqueda, setBusqueda] = useState('');
  const [criterio, setCriterio] = useState('todas');
  const [orden, setOrden] = useState('rifas');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const causasBase = useMemo(() => data?.items || [], [data]);

  const metricas = useMemo(() => {
    const totalRifas = causasBase.reduce((acc, c) => acc + (c.rifasCount ?? 0), 0);
    const metaGlobal = sumarMontosBs(causasBase.map((c) => c.meta || '0'));
    return {
      totalCausas: causasBase.length,
      totalRifas,
      metaGlobal,
    };
  }, [causasBase]);

  const causas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = causasBase.filter((c) => {
      if (criterio === 'con_rifas' && (c.rifasCount ?? 0) === 0) return false;
      if (!q) return true;
      return c.nombre?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q);
    });

    return [...filtradas].sort((a, b) => {
      if (orden === 'meta') return Number(b.meta || 0) - Number(a.meta || 0);
      return (b.rifasCount ?? 0) - (a.rifasCount ?? 0);
    });
  }, [causasBase, busqueda, criterio, orden]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(causas.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const causasPaginadas = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return causas.slice(start, start + pageSize);
  }, [causas, safePage]);

  const hasFilters = Boolean(busqueda.trim() || criterio !== 'todas' || orden !== 'rifas');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Directorio de Causas Solidarias Verificadas"
        subtitle="Iniciativas comunitarias, de salud y educación respaldadas por campañas auditadas."
        searchValue={busqueda}
        onSearchChange={(val) => {
          setBusqueda(val);
          setPage(1);
        }}
        searchPlaceholder="Buscar causa solidaria por nombre o impacto social..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setBusqueda('');
          setCriterio('todas');
          setOrden('rifas');
          setPage(1);
        }}
        selects={[
          {
            label: 'Criterio',
            value: criterio,
            onChange: (val) => {
              setCriterio(val);
              setPage(1);
            },
            options: [
              { value: 'todas', label: 'Todas las causas' },
              { value: 'con_rifas', label: 'Solo con rifas activas' },
            ],
          },
          {
            label: 'Ordenar por',
            value: orden,
            onChange: (val) => {
              setOrden(val);
              setPage(1);
            },
            options: [
              { value: 'rifas', label: 'Más rifas vinculadas' },
              { value: 'meta', label: 'Mayor meta objetivo' },
            ],
          },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            {esAdmin ? (
              <Link to="/admin/causas">
                <Button size="sm">
                  <ShieldCheck className="h-4 w-4" />
                  Gestionar causas
                </Button>
              </Link>
            ) : (
              <Link to="/solicitudes/nueva">
                <Button size="sm">
                  <FilePlus2 className="h-4 w-4" />
                  {esOrganizador ? 'Nueva campaña' : 'Proponer rifa'}
                </Button>
              </Link>
            )}
            <Link to={catalogoRuta}>
              <Button variant="secondary" size="sm">
                <Ticket className="h-4 w-4 text-emerald-600" />
                Ver catálogo
              </Button>
            </Link>
          </div>
        }
      />

      <PanelSectionHeader
        icon={HeartHandshake}
        title="Impacto Social & Metas de Recaudación"
        subtitle="Causas verificadas disponibles para apoyar"
        badgeText={`${causas.length} Causas visibles`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Causas verificadas',
            value: metricas.totalCausas,
            trendText: 'Iniciativas registradas',
            icon: HeartHandshake,
            accent: 'emerald',
          },
          {
            label: 'Campañas vinculadas',
            value: metricas.totalRifas,
            trendText: 'Rifas asociadas',
            icon: Ticket,
            accent: 'sky',
          },
          {
            label: 'Meta global acumulada',
            value: formatearBs(metricas.metaGlobal),
            trendText: 'Objetivo solidario total',
            icon: Target,
            accent: 'amber',
          },
        ]}
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : causas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={hasFilters ? 'Sin coincidencias' : 'Aún no hay causas registradas'}
          description={
            hasFilters
              ? 'Prueba limpiando los filtros para explorar todas las causas.'
              : 'Cuando se registren causas solidarias aparecerán aquí.'
          }
          action={
            hasFilters && (
              <Button
                variant="secondary"
                onClick={() => {
                  setBusqueda('');
                  setCriterio('todas');
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {causasPaginadas.map((causa, idx) => {
              const cantRifas = causa.rifasCount ?? 0;
              const paleta = PALETAS_CAUSA[idx % PALETAS_CAUSA.length];
              return (
                <article
                  key={causa.causaId}
                  className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row ${paleta.hoverBorder}`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-between bg-gradient-to-b ${paleta.stripe} p-4 text-white sm:w-20 sm:flex-col sm:justify-center sm:gap-2 sm:py-6`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs">
                      <HeartHandshake className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-bold">
                      #{causa.causaId}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${paleta.iconBg}`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Causa verificada
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            cantRifas > 0 ? paleta.badge : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          {cantRifas} rifa(s)
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{causa.nombre}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {causa.descripcion || 'Iniciativa solidaria respaldada por sorteos públicos.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Target className="h-3.5 w-3.5 text-emerald-600" />
                          Meta solidaria
                        </p>
                        <p className="text-lg font-extrabold text-emerald-700">
                          {formatearBs(causa.meta)}
                        </p>
                      </div>

                      <Link to={`${catalogoRuta}?causaId=${causa.causaId}`}>
                        <Button size="sm">
                          Ver rifas ({cantRifas})
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <PaginationCard
            page={safePage}
            totalPages={totalPages}
            total={causas.length}
            showingFrom={(safePage - 1) * pageSize + 1}
            showingTo={Math.min(safePage * pageSize, causas.length)}
            onPageChange={setPage}
            itemLabel="causas"
          />
        </>
      )}

      {!isLoading && causas.length > 0 && !autenticado && (
        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/70 p-6 shadow-2xs sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900">
              ¿Quieres respaldar una de estas causas o crear una campaña?
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              Explora las rifas activas asociadas o envía una solicitud para organizar un nuevo sorteo solidario.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={catalogoRuta}>
              <Button variant="secondary" size="sm">
                <Ticket className="h-4 w-4 text-emerald-600" />
                Explorar catálogo
              </Button>
            </Link>
            <Link to="/solicitudes/nueva">
              <Button size="sm">
                <FilePlus2 className="h-4 w-4" />
                Proponer campaña
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
