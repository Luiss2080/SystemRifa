import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  ArrowUpDown,
  Award,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Cpu,
  CreditCard,
  Dog,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LayoutGrid,
  PawPrint,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Trees,
  Trophy,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import {
  getCatalogoRifas,
  getCausasPublicas,
  getResumenPublico,
} from '../features/rifas/publicApi.js';
import { formatearBs, formatearFechaCorta, sumarMontosBs } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PaginationCard } from '../components/ui/DataTable.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../components/panel/PanelKit.jsx';
import {
  CauseMarqueeTicker,
  CausasDestacadasSection,
  GarantiasSection,
  HeroShowcase,
  LandingFinalCta,
  PlatformContentSection,
  UltimosSorteosSection,
} from '../components/home/HeroShowcase.jsx';

const HORAS_URGENCIA = 48;

const FALLBACK_CAUSAS_FILTRO = [
  { causaId: 1, nombre: 'Albergue Patitas Felices' },
  { causaId: 2, nombre: 'Comedor Infantil Esperanza' },
  { causaId: 3, nombre: 'Reforestación Chiquitanía Viva' },
  { causaId: 4, nombre: 'Hogar Abuelos del Oriente' },
  { causaId: 5, nombre: 'Salud Comunitaria Santa Cruz' },
  { causaId: 6, nombre: 'Becas Tech y Robótica Juvenil' },
  { causaId: 7, nombre: 'Albergue Esperanza Canina' },
  { causaId: 8, nombre: 'Educación Digital Rural' },
  { causaId: 9, nombre: 'Salud y Esperanza Infantil' },
  { causaId: 10, nombre: 'Comedor Comunitario San José' },
];

function getCausaIcon(nombre = '') {
  const n = (nombre || '').toLowerCase();
  if (n.includes('patitas')) return { icon: PawPrint, color: 'bg-rose-100 text-rose-700' };
  if (n.includes('infantil') || (n.includes('esperanza') && !n.includes('canina') && !n.includes('salud'))) {
    return { icon: Utensils, color: 'bg-amber-100 text-amber-700' };
  }
  if (n.includes('reforest') || n.includes('chiquitan')) return { icon: Trees, color: 'bg-emerald-100 text-emerald-700' };
  if (n.includes('abuelos') || n.includes('oriente')) return { icon: Users, color: 'bg-indigo-100 text-indigo-700' };
  if (n.includes('salud comunitaria') || n.includes('santa cruz')) return { icon: Activity, color: 'bg-sky-100 text-sky-700' };
  if (n.includes('tech') || n.includes('robót')) return { icon: Cpu, color: 'bg-purple-100 text-purple-700' };
  if (n.includes('canina')) return { icon: Dog, color: 'bg-teal-100 text-teal-700' };
  if (n.includes('educación') || n.includes('rural')) return { icon: GraduationCap, color: 'bg-blue-100 text-blue-700' };
  if (n.includes('salud y esperanza')) return { icon: ShieldCheck, color: 'bg-rose-100 text-rose-700' };
  if (n.includes('san josé') || n.includes('comedor')) return { icon: HeartHandshake, color: 'bg-orange-100 text-orange-700' };
  return { icon: HeartHandshake, color: 'bg-emerald-100 text-emerald-700' };
}

const FALLBACK_CATALOGO_RIFAS = [
  {
    rifaId: 1,
    nombre: 'Gran Rifa Pro Albergue Animal',
    descripcion:
      'Apoya el rescate y alimentación de más de 120 perritos. ¡Gana una motocicleta 0km lista para rodar!',
    causa: { causaId: 1, nombre: 'Albergue Esperanza Canina' },
    precioTicket: '25.00',
    cantidadTickets: 200,
    ticketsDisponibles: 120,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 1, nombre: 'Motocicleta 150cc 0km Modelo 2026', valor: '14500.00' },
      { premioId: 2, nombre: 'Casco Certificado DOT + Guantes', valor: '800.00' },
    ],
  },
  {
    rifaId: 2,
    nombre: 'Rifa Tecnológica Semillas del Saber',
    descripcion:
      'Equipamiento de aulas de computación con internet satelital para escuelas comunitarias rurales.',
    causa: { causaId: 2, nombre: 'Educación Digital Rural' },
    precioTicket: '20.00',
    cantidadTickets: 150,
    ticketsDisponibles: 85,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 68 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 3, nombre: 'Laptop Lenovo IdeaPad 15" Core i5', valor: '5200.00' },
    ],
  },
  {
    rifaId: 4,
    nombre: 'Kit Médico y Hogar Pro-Salud',
    descripcion:
      'Financiamiento directo de medicamentos oncológicos e insumos médicos para niños de escasos recursos.',
    causa: { causaId: 3, nombre: 'Salud y Esperanza Infantil' },
    precioTicket: '15.00',
    cantidadTickets: 100,
    ticketsDisponibles: 45,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 4, nombre: 'Heladera No Frost 380L + Kit Hogar', valor: '4800.00' },
    ],
  },
  {
    rifaId: 5,
    nombre: 'Rifa Gamer y Robótica Educativa',
    descripcion:
      'Kits de electrónica y robótica para jóvenes talentos de colegios fiscales en competencias nacionales.',
    causa: { causaId: 2, nombre: 'Educación Digital Rural' },
    precioTicket: '30.00',
    cantidadTickets: 100,
    ticketsDisponibles: 60,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 92 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 5, nombre: 'Consola Nintendo Switch OLED + Juego', valor: '3800.00' },
    ],
  },
  {
    rifaId: 7,
    nombre: 'Eco-Rifa Chiquitanía Viva',
    descripcion:
      'Reforestación de especies nativas y protección de cuencas de agua afectadas por quemas forestales.',
    causa: { causaId: 5, nombre: 'Reforestación Chiquitanía' },
    precioTicket: '10.00',
    cantidadTickets: 300,
    ticketsDisponibles: 210,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 115 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 6, nombre: 'Bicicleta Montañera Rodado 29 de Aluminio', valor: '2400.00' },
    ],
  },
  {
    rifaId: 8,
    nombre: 'Canasta Familiar y Nutrición San José',
    descripcion:
      'Provisión de víveres esenciales y raciones calientes diarias para 180 familias del Plan 3000.',
    causa: { causaId: 4, nombre: 'Comedor Comunitario San José' },
    precioTicket: '10.00',
    cantidadTickets: 250,
    ticketsDisponibles: 165,
    estado: 'ACTIVA',
    fechaFin: new Date(Date.now() + 35 * 60 * 60 * 1000).toISOString(),
    premios: [
      { premioId: 7, nombre: 'Smart TV Samsung 55" Crystal UHD 4K', valor: '3600.00' },
    ],
  },
];

function horasRestantes(fechaFin) {
  return (new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function CatalogoPage({ mode = 'landing' }) {
  const { autenticado } = useAuth();
  const esVistaLanding = mode === 'landing' && !autenticado;
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const causaInicial = searchParams.get('causaId') || '';
  const urgenteInicial = searchParams.get('urgente') === '1';
  const [causaId, setCausaId] = useState(causaInicial);
  const [busqueda, setBusqueda] = useState('');
  const [soloCierraPronto, setSoloCierraPronto] = useState(urgenteInicial);
  const [orden, setOrden] = useState('cierre');
  const [page, setPage] = useState(1);
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setModalFiltrosAbierto(false);
      }
    }
    if (modalFiltrosAbierto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalFiltrosAbierto]);

  useEffect(() => {
    setSoloCierraPronto(searchParams.get('urgente') === '1');
    setCausaId(searchParams.get('causaId') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(timer);
  }, [location.hash]);

  function seleccionarCausa(nextId) {
    setCausaId(nextId);
    setPage(1);
    if (nextId) {
      setSearchParams({ causaId: nextId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  const { data: causasData } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const { data: resumenPublico } = useQuery({
    queryKey: ['resumen-publico'],
    queryFn: getResumenPublico,
    enabled: esVistaLanding,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalogo-rifas', { causaId, page }],
    queryFn: () =>
      getCatalogoRifas({
        page,
        limit: 6,
        ...(causaId ? { causaId: Number(causaId) } : {}),
      }),
  });

  const causas = useMemo(() => {
    const raw = causasData?.items;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return FALLBACK_CAUSAS_FILTRO;
  }, [causasData]);

  const rifasBase = useMemo(() => {
    const raw = data?.items;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return FALLBACK_CATALOGO_RIFAS;
  }, [data]);
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const rifasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = rifasBase.filter((r) => {
      if (soloCierraPronto) {
        const hrs = horasRestantes(r.fechaFin);
        if (hrs <= 0 || hrs > HORAS_URGENCIA) return false;
      }
      if (!q) return true;
      return (
        r.nombre?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q) ||
        r.causa?.nombre?.toLowerCase().includes(q)
      );
    });

    lista = [...lista].sort((a, b) => {
      if (orden === 'precio') return Number(a.precioTicket) - Number(b.precioTicket);
      if (orden === 'disponibles') {
        return (b.ticketsDisponibles ?? 0) - (a.ticketsDisponibles ?? 0);
      }
      return new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime();
    });

    return lista;
  }, [rifasBase, busqueda, soloCierraPronto, orden]);

  const hayFiltrosLocales = Boolean(causaId || busqueda.trim() || soloCierraPronto);
  const filtrosActivosCount = (causaId ? 1 : 0) + (soloCierraPronto ? 1 : 0) + (busqueda.trim() ? 1 : 0);
  const causaActivaObj = causas.find((c) => String(c.causaId) === String(causaId));

  function limpiarFiltros() {
    seleccionarCausa('');
    setBusqueda('');
    setSoloCierraPronto(false);
    setOrden('cierre');
  }

  const totalDisponiblesCatalogo = rifasBase.reduce((acc, r) => acc + (r.ticketsDisponibles ?? 0), 0);
  const urgentesCount = rifasBase.filter((r) => {
    const h = horasRestantes(r.fechaFin);
    return r.estado !== 'FINALIZADA' && h > 0 && h <= HORAS_URGENCIA;
  }).length;

  return (
    <div className={esVistaLanding ? 'space-y-20 sm:space-y-28 lg:space-y-36 pb-16' : 'space-y-8 pb-16'}>
      {esVistaLanding ? (
        <HeroShowcase
          rifas={rifasBase}
          causas={causas}
          resumenPublico={resumenPublico}
          loadingRifas={isLoading}
          onSelectCausa={seleccionarCausa}
        />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                Catálogo en vivo · {rifasFiltradas.length} rifas ({totalDisponiblesCatalogo} boletos disponibles{urgentesCount > 0 ? ` · ${urgentesCount} cierran pronto` : ''})
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Catálogo de Rifas Solidarias
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Selecciona tus boletos favoritos con bloqueo seguro de 15 minutos y seguimiento transparente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/mis-tickets">
                <Button size="sm">
                  <Ticket className="h-4 w-4" />
                  Mis tickets
                </Button>
              </Link>
              <Link to="/mis-pagos">
                <Button variant="secondary" size="sm">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Mis pagos
                </Button>
              </Link>
              <Link to="/causas">
                <Button variant="secondary" size="sm">
                  <HeartHandshake className="h-4 w-4 text-rose-600" />
                  Causas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section id="catalogo-activo" className="space-y-5">
        {esVistaLanding && (
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/80">
              <Ticket className="h-3.5 w-3.5 text-emerald-600" />
              Catálogo en vivo · {rifasFiltradas.length} disponible(s)
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Rifas solidarias disponibles para participar
            </h2>
          </div>
        )}

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs backdrop-blur-md">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar rifa por título, descripción o causa..."
                  aria-label="Buscar rifas"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2 pr-9 pl-9 text-sm text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoloCierraPronto((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    soloCierraPronto
                      ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Cierra pronto (&le; 48h)
                </button>

                <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ordenar:</span>
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    aria-label="Ordenar catálogo"
                    className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="cierre">Cierre más próximo</option>
                    <option value="precio">Menor precio</option>
                    <option value="disponibles">Más disponibles</option>
                  </select>
                </label>

                {hayFiltrosLocales && (
                  <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                )}

                <Link to="/causas">
                  <Button size="sm">
                    <HeartHandshake className="h-4 w-4" />
                    Causas
                  </Button>
                </Link>
              </div>
            </div>

            {causas.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => seleccionarCausa('')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    !causaId
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas las causas
                </button>
                {causas.map((c) => {
                  const activa = String(causaId) === String(c.causaId);
                  return (
                    <button
                      key={c.causaId}
                      type="button"
                      onClick={() => seleccionarCausa(activa ? '' : String(c.causaId))}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                        activa
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <EmptyState
          icon={Ticket}
          title="No se pudo cargar el catálogo"
          description="Verifica tu conexión o intenta recargar la página."
        />
      ) : rifasFiltradas.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No hay rifas que coincidan con tu filtro"
          description="Prueba limpiando la búsqueda o seleccionando otra causa solidaria."
          action={
            hayFiltrosLocales && (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
            {rifasFiltradas.map((rifa) => {
              const disponibles = rifa.ticketsDisponibles ?? 0;
              const pctDisponible = Math.min(
                100,
                Math.round((disponibles / Math.max(1, rifa.cantidadTickets)) * 100)
              );
              const pctAvance = 100 - pctDisponible;
              const hrs = horasRestantes(rifa.fechaFin);
              const porCerrar = rifa.estado !== 'FINALIZADA' && hrs > 0 && hrs <= HORAS_URGENCIA;
              const premios = rifa.premios || [];
              const primerPremio = premios[0];
              const valorPremios = sumarMontosBs(premios.map((p) => p.valor || '0'));

              return (
                <article
                  key={rifa.rifaId}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/85 bg-white/95 p-4 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                >
                  {/* Línea superior con gradiente dinámico */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 ${
                      porCerrar
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                    }`}
                  />

                  <div className="flex flex-1 flex-col justify-between space-y-3 pt-1">
                    {/* Fila superior compacta: Causa + Estado/Urgencia */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="inline-flex max-w-[175px] items-center gap-1 truncate rounded-full bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200/70 sm:max-w-[210px]">
                        <HeartHandshake className="h-3 w-3 shrink-0 text-emerald-600" />
                        <span className="truncate">{rifa.causa?.nombre || 'Causa solidaria'}</span>
                      </span>

                      <div className="flex shrink-0 items-center gap-1">
                        {porCerrar && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                            <Clock className="h-2.5 w-2.5" />
                            {Math.max(1, Math.ceil(hrs))}h
                          </span>
                        )}
                        <Badge estado={rifa.estado} className="px-2 py-0.5 text-[10px] font-extrabold uppercase" />
                      </div>
                    </div>

                    {/* Título y descripción compactos */}
                    <div>
                      <h3 className="line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-emerald-700">
                        {rifa.nombre}
                      </h3>
                      {rifa.descripcion && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {rifa.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Ficha de premio destacada compacta */}
                    {primerPremio && (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200/60 bg-amber-50/70 px-2.5 py-1.5 text-xs">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <p className="truncate text-[11.5px] font-bold text-slate-800">
                            {primerPremio.nombre}
                            {premios.length > 1 ? ` (+${premios.length - 1})` : ''}
                          </p>
                        </div>
                        {Number(valorPremios) > 0 && (
                          <span className="shrink-0 whitespace-nowrap text-[11px] font-extrabold text-amber-800">
                            {formatearBs(valorPremios)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Métricas clave: Precio y Disponibilidad en 2 columnas limpias */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Precio ticket
                        </p>
                        <p className="text-base font-black text-emerald-700">
                          {formatearBs(rifa.precioTicket)}
                        </p>
                      </div>
                      <div className="border-l border-slate-200/80 pl-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Disponibles
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          <span className="text-emerald-700">{disponibles}</span> / {rifa.cantidadTickets}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso y fecha de cierre */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${pctAvance}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatearFechaCorta(rifa.fechaFin)}
                        </span>
                        <span className="font-bold text-slate-700">{pctAvance}% vendido</span>
                      </div>
                    </div>

                    {/* Botón de acción directo */}
                    <div className="pt-1">
                      <Link to={`/rifas/${rifa.rifaId}`} className="block">
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.99] cursor-pointer"
                        >
                          {rifa.estado === 'FINALIZADA' ? 'Ver detalle' : 'Elegir mis números'}
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-center pt-3">
            <PaginationCard
              page={pagination.page || 1}
              totalPages={pagination.totalPages || 1}
              total={pagination.total || rifasFiltradas.length}
              showingFrom={(pagination.page - 1) * 6 + 1}
              showingTo={Math.min(
                pagination.total || rifasFiltradas.length,
                (pagination.page - 1) * 6 + rifasFiltradas.length
              )}
              onPageChange={setPage}
              itemLabel="rifas"
              centered
            />
          </div>
        </>
      )}

      {esVistaLanding && (
        <>
          <CausasDestacadasSection causas={causas} onSelectCausa={seleccionarCausa} />
          <UltimosSorteosSection sorteos={resumenPublico?.ultimosSorteos || []} />
          <GarantiasSection />
          <PlatformContentSection
            totalRifas={rifasBase.length}
            totalCausas={causas.length}
            metricas={resumenPublico?.metricas}
          />
          <LandingFinalCta />
        </>
      )}
    </div>
  );
}
