import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  HeartHandshake,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Users,
} from 'lucide-react';
import { getCausasPublicas } from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { formatearBs, sumarMontosBs } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { CardGridSkeleton } from '../components/ui/Skeleton.jsx';

const CATEGORIAS_CAUSAS = [
  'Todas las causas',
  'Salud y Bienestar',
  'Educación y Niñez',
  'Albergues y Rescate Animal',
  'Apoyo Comunitario',
  'Medio Ambiente',
];

const FALLBACK_CAUSAS_PUBLICAS = [
  {
    causaId: 1,
    nombre: 'Albergue Esperanza Canina',
    categoria: 'Albergues y Rescate Animal',
    descripcion:
      'Rescate, alimentación diaria, atención veterinaria y esterilizaciones para más de 120 perritos rescatados de situaciones de maltrato y abandono.',
    meta: '35000.00',
    recaudado: '24500.00',
    rifasCount: 2,
    beneficiarios: '120 animales protegidos',
    ubicacion: 'Santa Cruz de la Sierra',
    entidad: 'Fundación Huellitas con Amor',
    icono: '🐾',
    colorStripe: 'from-emerald-600 to-teal-700',
    colorTag: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    causaId: 2,
    nombre: 'Educación Digital Rural',
    categoria: 'Educación y Niñez',
    descripcion:
      'Equipamiento de aulas de computación con internet satelital y capacitación informática para escuelas comunitarias en los valles interandinos.',
    meta: '28000.00',
    recaudado: '18400.00',
    rifasCount: 1,
    beneficiarios: '320 estudiantes rurales',
    ubicacion: 'Cochabamba - Valles',
    entidad: 'Asociación Semillas del Saber',
    icono: '💻',
    colorStripe: 'from-sky-600 to-indigo-700',
    colorTag: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    causaId: 3,
    nombre: 'Salud y Esperanza Infantil',
    categoria: 'Salud y Bienestar',
    descripcion:
      'Financiamiento directo de medicamentos oncológicos, quimioterapias y hospedaje para familias de niños en tratamiento especializado.',
    meta: '50000.00',
    recaudado: '39200.00',
    rifasCount: 3,
    beneficiarios: '45 niños y sus familias',
    ubicacion: 'La Paz & El Alto',
    entidad: 'Voluntariado Oncológico Infantil',
    icono: '❤️',
    colorStripe: 'from-rose-600 to-pink-700',
    colorTag: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    causaId: 4,
    nombre: 'Comedor Comunitario San José',
    categoria: 'Apoyo Comunitario',
    descripcion:
      'Provisión de 180 raciones nutritivas diarias, desayunos escolares y talleres de apoyo escolar para familias en situación de vulnerabilidad extrema.',
    meta: '18000.00',
    recaudado: '14100.00',
    rifasCount: 2,
    beneficiarios: '180 raciones diarias',
    ubicacion: 'Santa Cruz - Plan 3000',
    entidad: 'Comunidad Solidaria San José',
    icono: '🍲',
    colorStripe: 'from-amber-600 to-orange-700',
    colorTag: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    causaId: 5,
    nombre: 'Reforestación Chiquitanía Viva',
    categoria: 'Medio Ambiente',
    descripcion:
      'Creación de viveros comunitarios de plantines nativos y protección de cuencas de agua vitales afectadas por quemas forestales recurrentes.',
    meta: '42000.00',
    recaudado: '29800.00',
    rifasCount: 1,
    beneficiarios: '3 comunidades chiquitanas',
    ubicacion: 'Chiquitanía, Santa Cruz',
    entidad: 'Eco-Guardianes del Bosque',
    icono: '🌱',
    colorStripe: 'from-teal-600 to-emerald-800',
    colorTag: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    causaId: 6,
    nombre: 'Rehabilitación Pediátrica y Prótesis',
    categoria: 'Salud y Bienestar',
    descripcion:
      'Sesiones de fisioterapia infantil, donación de sillas de ruedas adaptadas y soporte psicopedagógico continuo para niños con discapacidad motriz.',
    meta: '32000.00',
    recaudado: '22800.00',
    rifasCount: 2,
    beneficiarios: '65 infantes atendidos',
    ubicacion: 'Tarija y Chuquisaca',
    entidad: 'Fundación Pasitos Firmes',
    icono: '🩺',
    colorStripe: 'from-indigo-600 to-purple-700',
    colorTag: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
];

export function CausasPublicPage() {
  const { autenticado } = useAuth();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas las causas');
  const [orden, setOrden] = useState('rifas');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  // Si la API devuelve causas de base de datos, las complementamos para presentación comercial
  const causasBase = useMemo(() => {
    const apiItems = data?.items;
    if (Array.isArray(apiItems) && apiItems.length > 0) {
      return apiItems.map((c, idx) => {
        const fallback = FALLBACK_CAUSAS_PUBLICAS[idx % FALLBACK_CAUSAS_PUBLICAS.length];
        return {
          ...fallback,
          ...c,
          causaId: c.causaId,
          nombre: c.nombre || fallback.nombre,
          descripcion: c.descripcion || fallback.descripcion,
          meta: c.meta || fallback.meta,
          rifasCount: c.rifasCount ?? fallback.rifasCount,
        };
      });
    }
    return FALLBACK_CAUSAS_PUBLICAS;
  }, [data]);

  // Filtrado reactivo por categoría, búsqueda y orden
  const causasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = causasBase.filter((c) => {
      if (categoriaSeleccionada !== 'Todas las causas' && c.categoria !== categoriaSeleccionada) {
        return false;
      }
      if (!q) return true;
      return (
        c.nombre?.toLowerCase().includes(q) ||
        c.descripcion?.toLowerCase().includes(q) ||
        c.categoria?.toLowerCase().includes(q) ||
        c.ubicacion?.toLowerCase().includes(q) ||
        c.entidad?.toLowerCase().includes(q)
      );
    });

    return [...lista].sort((a, b) => {
      if (orden === 'meta') return Number(b.meta || 0) - Number(a.meta || 0);
      if (orden === 'recaudado') return Number(b.recaudado || 0) - Number(a.recaudado || 0);
      return (b.rifasCount ?? 0) - (a.rifasCount ?? 0);
    });
  }, [causasBase, busqueda, categoriaSeleccionada, orden]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(causasFiltradas.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const causasPaginadas = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return causasFiltradas.slice(start, start + pageSize);
  }, [causasFiltradas, safePage]);

  const totalMeta = useMemo(
    () => sumarMontosBs(causasBase.map((c) => c.meta || '0')),
    [causasBase]
  );
  const totalRifas = useMemo(
    () => causasBase.reduce((acc, c) => acc + (c.rifasCount ?? 0), 0),
    [causasBase]
  );

  const hayFiltros = Boolean(busqueda.trim() || categoriaSeleccionada !== 'Todas las causas' || orden !== 'rifas');

  function limpiarFiltros() {
    setBusqueda('');
    setCategoriaSeleccionada('Todas las causas');
    setOrden('rifas');
    setPage(1);
  }

  function irACatalogoConCausa(causaId) {
    const targetUrl = autenticado ? `/explorar?causaId=${causaId}` : `/?causaId=${causaId}#catalogo-activo`;
    navigate(targetUrl);
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-3.5 text-center py-1 sm:py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Directorio de Causas Solidarias Verificadas
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Causas que transforman vidas con{' '}
          <span className="text-emerald-700">transparencia total</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Cada causa cuenta con personería jurídica, convenio directo y sorteos auditados con
          trazabilidad pública. Al adquirir boletos, apoyas directamente a estas iniciativas.
        </p>

        {/* Insignias de confianza pública */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {causasBase.length} causas verificadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
            <Ticket className="h-3.5 w-3.5 text-teal-600" />
            {totalRifas} rifas activas vinculadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <Target className="h-3.5 w-3.5 text-amber-600" />
            Meta global: {formatearBs(totalMeta)}
          </span>
        </div>
      </section>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS COMERCIALES */}
      <section className="space-y-4">
        {/* Chips de Categorías */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIAS_CAUSAS.map((cat) => {
            const activo = categoriaSeleccionada === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoriaSeleccionada(cat);
                  setPage(1);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activo
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/25'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Buscador + Ordenador */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por causa, ciudad, beneficiarios o fundación..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200/50 focus:outline-none"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold">Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="rifas">Más rifas activas</option>
                <option value="recaudado">Mayor recaudación</option>
                <option value="meta">Mayor meta objetivo</option>
              </select>
            </div>

            {hayFiltros && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO DE TARJETAS COMERCIALES DE CAUSAS */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : causasFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <HeartHandshake className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-slate-800">
            No encontramos causas con esos criterios
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Prueba ajustando el término de búsqueda o seleccionando otra categoría.
          </p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
              Ver todas las causas
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {causasPaginadas.map((causa) => {
            const metaNum = Number(causa.meta) || 1;
            const recaudadoNum = Number(causa.recaudado) || 0;
            const porcentaje = Math.min(100, Math.round((recaudadoNum / metaNum) * 100));

            return (
              <article
                key={causa.causaId}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                {/* Cabecera visual de la tarjeta con franja luminosa */}
                <div className={`relative bg-gradient-to-r ${causa.colorStripe || 'from-emerald-600 to-teal-700'} p-5 text-white`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur-xs">
                      {causa.icono || '❤️'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-2xs">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verificada
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                      {causa.categoria || 'Causa Solidaria'}
                    </p>
                    <h2 className="text-lg font-black leading-snug tracking-tight text-white">
                      {causa.nombre}
                    </h2>
                  </div>
                </div>

                {/* Contenido descriptivo */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        {causa.ubicacion || 'Bolivia'}
                      </span>
                      <span>·</span>
                      <span className="truncate text-slate-600 font-medium">
                        {causa.entidad || 'Iniciativa ciudadana'}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {causa.descripcion}
                    </p>
                  </div>

                  {/* Barra de progreso de recaudación hacia la meta */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">
                        {formatearBs(recaudadoNum)}
                        <span className="ml-1 text-[11px] font-medium text-slate-500">
                          de {formatearBs(metaNum)}
                        </span>
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        {porcentaje}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    {causa.beneficiarios && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Users className="h-3 w-3 text-slate-400" />
                        Impacto directo: <strong className="text-slate-700">{causa.beneficiarios}</strong>
                      </p>
                    )}
                  </div>

                  {/* Botón de acción hacia las rifas de esta causa */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => irACatalogoConCausa(causa.causaId)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800 cursor-pointer"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>Ver rifas activas ({causa.rifasCount ?? 1})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. PAGINACIÓN COMERCIAL */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="px-3 text-xs font-bold text-slate-600">
            Página {safePage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* 5. SECCIÓN DE CONFIANZA Y GARANTÍA LEGAL DE CAUSAS (ABIERTA SIN CONTENEDOR BLANCO) */}
      <section className="space-y-6 pt-6">
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Transparencia en Cada Paso
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            ¿Cómo se garantiza que tu ayuda llegue a su destino?
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            Diseñamos un flujo auditado con trazabilidad punto a punto entre compradores, organizadores y causas.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 space-y-2 shadow-2xs backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">1. Verificación Estricta</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Cada causa debe presentar personería jurídica o aval comunitario contrastable antes de autorizar cualquier sorteo.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 space-y-2 shadow-2xs backdrop-blur-sm transition hover:border-teal-300 hover:shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Ticket className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">2. Boletos Auditados</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Los números se reservan atómicamente por 15 minutos y solo los pagos aprobados entran en el bolillero digital.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 space-y-2 shadow-2xs backdrop-blur-sm transition hover:border-amber-300 hover:shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">3. Rendición Pública</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Los ganadores se publican con acta oficial y los fondos recaudados se transfieren con comprobante bancario verificable.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BANNER INFORMATIVO PARA ENTIDADES SOCIALES (SIN MEZCLAR HERRAMIENTAS ADMINISTRATIVAS) */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
              Para Fundaciones y Organizaciones
            </span>
            <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              ¿Tu organización necesita impulsar una campaña solidaria?
            </h3>
            <p className="text-xs leading-relaxed text-emerald-100 sm:text-sm">
              Las propuestas de rifas solidarias se gestionan de manera privada dentro del panel de
              organizadores autorizados con estricto control de auditoría.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <Link
              to={autenticado ? '/solicitudes/nueva' : '/registro'}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <span>{autenticado ? 'Solicitar campaña' : 'Crear cuenta de organizador'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
