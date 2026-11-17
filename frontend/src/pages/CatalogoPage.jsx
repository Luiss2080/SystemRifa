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
import { Breadcrumbs } from '../components/ui/Breadcrumbs.jsx';
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

          {/* Barra Superior Minimalista: Búsqueda rápida + Botón Filtros (Abre Modal) + Orden */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xs backdrop-blur-md">
              {/* Campo de búsqueda */}
              <div className="relative w-full sm:flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar rifa por título, causa o premio..."
                  aria-label="Buscar rifas"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-9 pl-9 text-xs sm:text-sm text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Botón Filtros (abre Modal) + Selector de Orden */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalFiltrosAbierto(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer shadow-xs ${
                    hayFiltrosLocales
                      ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filtros</span>
                  {filtrosActivosCount > 0 && (
                    <span
                      className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                        hayFiltrosLocales ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {filtrosActivosCount}
                    </span>
                  )}
                </button>

                <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    aria-label="Ordenar catálogo"
                    className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-xs font-semibold"
                  >
                    <option value="cierre">Cierre próximo</option>
                    <option value="precio">Menor precio</option>
                    <option value="disponibles">Más disponibles</option>
                  </select>
                </div>

                {hayFiltrosLocales && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    title="Restablecer filtros"
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Chips de filtros activos compactos */}
            {hayFiltrosLocales && (
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                <span className="text-[11px] font-semibold text-slate-400">Filtrando:</span>
                {causaActivaObj && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                    <HeartHandshake className="h-3 w-3 text-emerald-600" />
                    {causaActivaObj.nombre}
                    <button
                      type="button"
                      onClick={() => seleccionarCausa('')}
                      className="hover:text-emerald-950 cursor-pointer"
                      title="Quitar causa"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {soloCierraPronto && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Cierra pronto (&le; 48h)
                    <button
                      type="button"
                      onClick={() => setSoloCierraPronto(false)}
                      className="hover:text-amber-950 cursor-pointer"
                      title="Quitar urgencia"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {busqueda && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    &ldquo;{busqueda}&rdquo;
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      className="hover:text-slate-900 cursor-pointer"
                      title="Borrar texto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Modal de Filtros con Opciones e Iconos para despejar la pantalla */}
        {modalFiltrosAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-modal-in">
            <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              {/* Encabezado del Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/70 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <SlidersHorizontal className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Filtros de Rifas Solidarias</h3>
                    <p className="text-xs text-slate-500">Selecciona la causa benéfica o criterios de cierre</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalFiltrosAbierto(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  aria-label="Cerrar modal de filtros"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cuerpo del Modal */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 sm:p-6">
                {/* Selector de Causas con Iconos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Causa Solidaria Verificada
                    </label>
                    {causaId && (
                      <button
                        type="button"
                        onClick={() => seleccionarCausa('')}
                        className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Ver todas
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Opción: Todas las causas */}
                    <button
                      type="button"
                      onClick={() => seleccionarCausa('')}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                        !causaId
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-extrabold ring-1 ring-emerald-500/50'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          !causaId ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <LayoutGrid className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-bold truncate">Todas las causas</span>
                      </div>
                      {!causaId && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                    </button>

                    {/* Causas oficiales con sus respectivos iconos */}
                    {causas.map((c) => {
                      const activa = String(causaId) === String(c.causaId);
                      const { icon: CausaIcon, color: iconColor } = getCausaIcon(c.nombre);
                      return (
                        <button
                          key={c.causaId}
                          type="button"
                          onClick={() => seleccionarCausa(activa ? '' : String(c.causaId))}
                          className={`flex items-center justify-between gap-3 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                            activa
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-extrabold ring-1 ring-emerald-500/50'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              activa ? 'bg-emerald-600 text-white' : iconColor
                            }`}>
                              <CausaIcon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-bold truncate">{c.nombre}</span>
                          </div>
                          {activa && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtro de Urgencia */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                    Tiempo de Cierre
                  </label>
                  <button
                    type="button"
                    onClick={() => setSoloCierraPronto((v) => !v)}
                    className={`flex items-center justify-between w-full rounded-2xl border p-3 text-left transition cursor-pointer ${
                      soloCierraPronto
                        ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-extrabold ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        soloCierraPronto ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold">Cierra pronto (&le; 48 horas)</p>
                        <p className="text-[11px] text-slate-500">Muestra únicamente rifas en sus últimas 48 horas</p>
                      </div>
                    </div>
                    {soloCierraPronto && <Check className="h-4 w-4 text-amber-600" />}
                  </button>
                </div>

                {/* Criterio de Orden */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                    Criterio de Orden
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cierre', label: 'Cierre próximo', icon: Clock },
                      { id: 'precio', label: 'Menor precio', icon: ArrowUpDown },
                      { id: 'disponibles', label: 'Más disponibles', icon: Ticket },
                    ].map((opt) => {
                      const selected = orden === opt.id;
                      const OptIcon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOrden(opt.id)}
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-center transition cursor-pointer ${
                            selected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-500/50'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <OptIcon className={`h-4 w-4 ${selected ? 'text-emerald-700' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pie del Modal */}
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50/70 sm:px-6">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosLocales}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  Restablecer filtros
                </button>

                <button
                  type="button"
                  onClick={() => setModalFiltrosAbierto(false)}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  Aplicar ({rifasFiltradas.length} encontradas)
                </button>
              </div>
            </div>
          </div>
        )}

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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="space-y-2.5">
                    {/* Fila superior: Causa + Estado/Urgencia */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 truncate max-w-[200px]">
                        <HeartHandshake className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{rifa.causa?.nombre || 'Causa solidaria'}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {porCerrar && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                            <Clock className="h-2.5 w-2.5 text-amber-700" />
                            {Math.max(1, Math.ceil(hrs))}h
                          </span>
                        )}
                        <Badge estado={rifa.estado} className="px-2 py-0.5 text-[10px] font-extrabold uppercase" />
                      </div>
                    </div>

                    {/* Título de la rifa */}
                    <div>
                      <h3 className="text-[15px] font-extrabold text-slate-900 line-clamp-1 transition-colors group-hover:text-emerald-700">
                        {rifa.nombre}
                      </h3>
                    </div>

                    {/* Premio principal en una sola línea limpia (sin caja pesada) */}
                    {primerPremio && (
                      <div className="flex items-center justify-between gap-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate font-semibold text-slate-800 text-[11.5px]">
                            {primerPremio.nombre}
                            {premios.length > 1 ? ` (+${premios.length - 1})` : ''}
                          </span>
                        </div>
                        {Number(valorPremios) > 0 && (
                          <span className="shrink-0 text-[11px] font-extrabold text-amber-700 whitespace-nowrap">
                            {formatearBs(valorPremios)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fila de números: Precio y Disponibilidad directos (sin caja gris saturada) */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-emerald-700">{formatearBs(rifa.precioTicket)}</span>
                        <span className="ml-1 text-[11px] font-medium text-slate-400">/ ticket</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-extrabold text-slate-800">{disponibles}</span>
                        <span className="text-slate-400 font-medium"> / {rifa.cantidadTickets} disp.</span>
                      </div>
                    </div>

                    {/* Barra de progreso limpia */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${pctAvance}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatearFechaCorta(rifa.fechaFin)}
                        </span>
                        <span className="font-bold text-slate-600">{pctAvance}% vendido</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-3">
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
