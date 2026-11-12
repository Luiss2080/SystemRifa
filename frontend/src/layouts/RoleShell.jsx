import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Bell,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  ExternalLink,
  FilePlus2,
  FolderKanban,
  HeartHandshake,
  HelpCircle,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users,
  X,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { formatearFechaCorta } from '../utils/format.js';
import { BrandMark } from '../components/ui/BrandLogo.jsx';

const ROUTE_META = [
  {
    prefix: '/admin/reportes',
    title: 'Reportes y Analítica',
    badge: 'EJECUTIVO',
    subtitle: 'Consolidado financiero y metas solidarias',
  },
  {
    prefix: '/admin/solicitudes',
    title: 'Solicitudes de Rifas',
    badge: 'REVISIÓN',
    subtitle: 'Evaluación, tarifa y aprobación de campañas',
  },
  {
    prefix: '/admin/pagos',
    title: 'Verificación de Pagos',
    badge: 'TESORERÍA',
    subtitle: 'Validación de comprobantes y liberación de tickets',
  },
  {
    prefix: '/admin/causas',
    title: 'Causas Solidarias',
    badge: 'CATÁLOGO',
    subtitle: 'Gestión de iniciativas y metas beneficiarias',
  },
  {
    prefix: '/admin/usuarios',
    title: 'Usuarios y Accesos',
    badge: 'DIRECTORIO',
    subtitle: 'Cuentas registradas, roles y permisos directos',
  },
  {
    prefix: '/admin/roles',
    title: 'Roles y Permisos',
    badge: 'RBAC',
    subtitle: 'Matriz de seguridad e historial de privilegios',
  },
  {
    prefix: '/admin/plantillas',
    title: 'Plantillas de Notificación',
    badge: 'MENSAJERÍA',
    subtitle: 'Personalización de avisos automáticos',
  },
  {
    prefix: '/admin/auditoria',
    title: 'Auditoría del Sistema',
    badge: 'TRAZABILIDAD',
    subtitle: 'Bitácora inmutable de acciones críticas',
  },
  {
    prefix: '/organizador/rifas/',
    title: 'Gestión de Rifa',
    badge: 'CAMPAÑA',
    subtitle: 'Premios, tablero de tickets, cierre y sorteo',
  },
  {
    prefix: '/organizador/rifas',
    title: 'Mis Rifas Aprobadas',
    badge: 'CAMPAÑAS',
    subtitle: 'Control de campañas activas y sorteos',
  },
  {
    prefix: '/solicitudes/nueva',
    title: 'Nueva Solicitud',
    badge: 'CREACIÓN',
    subtitle: 'Propuesta y vista previa en tiempo real',
  },
  {
    prefix: '/solicitudes/mias',
    title: 'Mis Solicitudes',
    badge: 'SEGUIMIENTO',
    subtitle: 'Estado de revisión y aprobación de propuestas',
  },
  {
    prefix: '/explorar',
    title: 'Catálogo de Rifas',
    badge: 'EN VIVO',
    subtitle: 'Explora campañas activas y reserva números',
  },
  {
    prefix: '/causas',
    title: 'Causas Solidarias',
    badge: 'IMPACTO',
    subtitle: 'Directorio de causas sociales verificadas',
  },
  {
    prefix: '/mis-tickets',
    title: 'Mis Tickets',
    badge: 'PARTICIPACIÓN',
    subtitle: 'Reservas activas y números confirmados',
  },
  {
    prefix: '/mis-pagos',
    title: 'Mis Pagos',
    badge: 'COMPROBANTES',
    subtitle: 'Historial y validación de tus transferencias',
  },
  {
    prefix: '/notificaciones',
    title: 'Notificaciones',
    badge: 'ALERTAS',
    subtitle: 'Avisos en tiempo real de tus operaciones',
  },
  {
    prefix: '/perfil',
    title: 'Mi Perfil y Seguridad',
    badge: 'CUENTA',
    subtitle: 'Datos personales, alias público y contraseña',
  },
];

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fecha = now.toLocaleDateString('es-BO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const hora = now.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return `${fecha} | ${hora}`;
}

export function RoleShell({ children }) {
  const { usuario, autenticado, esAdmin, esOrganizador, logout, tienePermiso, tieneAlgunPermiso } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clockLabel = useLiveClock();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    operaciones: true,
    campanas: true,
    sistema: true,
    participacion: true,
  });

  const [moduleQuery, setModuleQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const accountRef = useRef(null);

  const {
    rolPrincipal,
    tieneAdminPanel,
    tieneOrganizadorPanel,
    primerAdminDestino,
    homeDestino,
  } = resolverAccesoRol({
    autenticado,
    esAdmin,
    esOrganizador,
    tienePermiso,
    tieneAlgunPermiso,
  });

  const { data: notifResumen } = useQuery({
    queryKey: ['notificaciones-badge'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notificaciones', { params: { page: 1, limit: 1 } });
      return data;
    },
    enabled: autenticado,
    refetchInterval: 30000,
  });

  const { data: notifRecientes, isLoading: loadingPopover } = useQuery({
    queryKey: ['notificaciones-popover'],
    queryFn: () => getMisNotificaciones({ page: 1, limit: 5 }),
    enabled: autenticado && notifOpen,
  });

  const invalidarNotificaciones = () => {
    queryClient.invalidateQueries({ queryKey: ['notificaciones-badge'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-popover'] });
    queryClient.invalidateQueries({ queryKey: ['mis-notificaciones'] });
  };

  const marcarLeidaMut = useMutation({
    mutationFn: (id) => marcarNotificacionLeida(id),
    onSuccess: invalidarNotificaciones,
  });

  const marcarTodasMut = useMutation({
    mutationFn: () => marcarTodasNotificacionesLeidas(),
    onSuccess: invalidarNotificaciones,
  });

  useEffect(() => {
    setMobileDrawer(false);
    setSearchOpen(false);
    setNotifOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutside(e) {
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (accountOpen && accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setAccountOpen(false);
        setMobileDrawer(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [searchOpen, notifOpen, accountOpen]);

  // Construcción de categorías del sidebar según permisos y rol
  const categories = useMemo(() => {
    const adminOps = [
      (esAdmin || tienePermiso('reportes', 'leer')) && {
        to: '/admin/reportes',
        label: 'Reportes y Analítica',
        icon: BarChart3,
      },
      tienePermiso('solicitudes', 'revisar') && {
        to: '/admin/solicitudes',
        label: 'Solicitudes',
        icon: ClipboardList,
      },
      tienePermiso('pagos', 'verificar') && {
        to: '/admin/pagos',
        label: 'Verificar Pagos',
        icon: CheckSquare,
      },
      tienePermiso('causas', 'crud') && {
        to: '/admin/causas',
        label: 'Causas Solidarias',
        icon: HeartHandshake,
      },
    ].filter(Boolean);

    const adminSys = [
      tienePermiso('usuarios', 'leer') && {
        to: '/admin/usuarios',
        label: 'Usuarios (CRM)',
        icon: Users,
      },
      (tienePermiso('roles', 'administrar') || tienePermiso('permisos', 'administrar')) && {
        to: '/admin/roles',
        label: 'Roles y Permisos',
        icon: KeyRound,
      },
      tienePermiso('plantillas', 'administrar') && {
        to: '/admin/plantillas',
        label: 'Plantillas Notif.',
        icon: Mail,
      },
      (esAdmin || tienePermiso('reportes', 'leer')) && {
        to: '/admin/auditoria',
        label: 'Auditoría',
        icon: History,
      },
    ].filter(Boolean);

    const campanas = [
      tieneAlgunPermiso([
        ['rifas', 'administrar'],
        ['premios', 'crud'],
        ['sorteos', 'realizar'],
        ['ganadores', 'publicar'],
      ]) && {
        to: '/organizador/rifas',
        label: 'Mis Rifas',
        icon: Sparkles,
      },
      tienePermiso('solicitudes', 'crear') && {
        to: '/solicitudes/nueva',
        label: 'Nueva Solicitud',
        icon: FilePlus2,
      },
      tienePermiso('solicitudes', 'crear') && {
        to: '/solicitudes/mias',
        label: 'Mis Solicitudes',
        icon: FolderKanban,
      },
    ].filter(Boolean);

    const participacion = [
      { to: '/explorar', label: 'Catálogo de Rifas', icon: Ticket },
      { to: '/causas', label: 'Causas Públicas', icon: HeartHandshake },
      ...(tienePermiso('tickets', 'comprar') || rolPrincipal === 'PARTICIPANTE'
        ? [
            { to: '/mis-tickets', label: 'Mis Tickets', icon: Ticket },
            { to: '/mis-pagos', label: 'Mis Pagos', icon: CreditCard },
          ]
        : []),
      { to: '/notificaciones', label: 'Notificaciones', icon: Bell },
      { to: '/perfil', label: 'Mi Perfil', icon: User },
    ];

    const list = [];
    if (adminOps.length) {
      list.push({ id: 'operaciones', label: 'Operaciones', icon: LayoutDashboard, items: adminOps });
    }
    if (campanas.length) {
      list.push({ id: 'campanas', label: 'Campañas', icon: Sparkles, items: campanas });
    }
    if (adminSys.length) {
      list.push({ id: 'sistema', label: 'Seguridad y Sistema', icon: ShieldCheck, items: adminSys });
    }
    list.push({
      id: 'participacion',
      label: tieneAdminPanel || tieneOrganizadorPanel ? 'Explorar y Cuenta' : 'Mi Espacio',
      icon: Users,
      items: participacion,
    });
    return list;
  }, [esAdmin, tienePermiso, tieneAlgunPermiso, rolPrincipal, tieneAdminPanel, tieneOrganizadorPanel]);

  const allModules = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, category: cat.label }))
      ),
    [categories]
  );

  const filteredModules = useMemo(() => {
    const q = moduleQuery.trim().toLowerCase();
    if (!q) return allModules.slice(0, 7);
    return allModules
      .filter(
        (m) => m.label.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allModules, moduleQuery]);

  const routeMeta = useMemo(() => {
    const found = ROUTE_META.find((r) => location.pathname.startsWith(r.prefix));
    return (
      found || {
        title: 'Panel de Control',
        badge: rolPrincipal,
        subtitle: 'Gestión operativa en tiempo real',
      }
    );
  }, [location.pathname, rolPrincipal]);

  const nombreCompleto =
    [usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ').trim() ||
    usuario?.alias ||
    'Usuario';
  const iniciales =
    `${(usuario?.nombres || '')[0] || ''}${(usuario?.apellidos || '')[0] || ''}`.toUpperCase() ||
    (usuario?.alias || 'RS').slice(0, 2).toUpperCase();

  const noLeidas = notifResumen?.noLeidasCount || 0;
  const recientes = notifRecientes?.items || [];

  async function handleLogout() {
    setAccountOpen(false);
    setNotifOpen(false);
    await logout();
    navigate('/');
  }

  function toggleGroup(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const sidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col bg-white/95 backdrop-blur-md">
      {/* Cabecera de marca dentro del Sidebar */}
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-slate-200/80 px-4">
        <Link
          to={homeDestino}
          className={`flex min-w-0 items-center gap-2.5 ${
            !isMobile && collapsed ? 'justify-center' : ''
          }`}
        >
          <BrandMark size="md" className="shrink-0 shadow-sm shadow-emerald-600/20" />
          {(isMobile || !collapsed) && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                Rifas<span className="text-emerald-600">Solidarias</span>
              </p>
              <p className="truncate text-[11px] font-semibold text-slate-500">Panel de Control</p>
            </div>
          )}
        </Link>

        {!isMobile ? (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 lg:inline-flex cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileDrawer(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Categorías con desplegables (estilo SaaS) */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          const isOpen = openGroups[cat.id] !== false;
          const showExpanded = isMobile || !collapsed;

          return (
            <div key={cat.id} className="space-y-1">
              {showExpanded ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(cat.id)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <CatIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                      {cat.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                      {cat.items.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <div className="mx-auto my-2 h-px w-8 bg-slate-200" />
              )}

              {(isOpen || !showExpanded) && (
                <nav className="space-y-1 pl-0.5">
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={!showExpanded ? item.label : undefined}
                        className={({ isActive }) =>
                          `group flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-semibold transition ${
                            !showExpanded ? 'justify-center px-2' : ''
                          } ${
                            isActive
                              ? 'border border-emerald-200/80 bg-emerald-50/90 text-emerald-900 shadow-2xs'
                              : 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-700'
                              }`}
                            >
                              <ItemIcon className="h-3.5 w-3.5" />
                            </span>
                            {showExpanded && (
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Pie del Sidebar: Ayuda + Tarjeta de Sesión Activa y Botón SALIR */}
      <div className="shrink-0 space-y-2.5 border-t border-slate-200/80 bg-slate-50/70 p-3">
        {(isMobile || !collapsed) && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new window.CustomEvent('open-help-widget'))}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:text-emerald-800 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              Asistente RifaBot
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              24/7
            </span>
          </button>
        )}

        <div
          className={`flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs ${
            !isMobile && collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-extrabold text-white">
              {iniciales}
            </span>
            {(isMobile || !collapsed) && (
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-slate-900">{nombreCompleto}</p>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Sesión Activa
                </p>
              </div>
            )}
          </div>

          {(isMobile || !collapsed) && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-rose-700 transition hover:bg-rose-600 hover:text-white cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-3 w-3" />
              Salir
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 flex min-h-screen w-full overflow-x-clip bg-transparent">
      {/* Sidebar fijo pegado al extremo izquierdo en escritorio */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200/90 lg:sticky lg:top-0 lg:block lg:h-screen lg:transition-all lg:duration-200 ${
          collapsed ? 'lg:w-[78px]' : 'lg:w-[264px]'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Drawer móvil */}
      {mobileDrawer && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setMobileDrawer(false)}
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Columna derecha: Top Header del Panel + Contenido + Footer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
          <div className="flex h-18 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* Izquierda: Menú móvil + Título del módulo actual */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileDrawer(true)}
                aria-label="Abrir navegación lateral"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                    {routeMeta.title}
                  </h1>
                  <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                    {routeMeta.badge}
                  </span>
                </div>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {routeMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Centro / Derecha: Buscador rápido de módulos, acciones, reloj en vivo, notificaciones y perfil */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Buscador / Desplegable rápido de módulos */}
              <div className="relative hidden md:block" ref={searchRef}>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={moduleQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setModuleQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    placeholder="Buscar módulo..."
                    aria-label="Buscar módulo del panel"
                    className="w-40 rounded-full border border-slate-200 bg-slate-50/80 py-1.5 pr-3 pl-8 text-xs font-medium text-slate-800 transition focus:w-56 focus:border-emerald-400 focus:bg-white focus:outline-none xl:w-48"
                  />
                </div>

                {searchOpen && (
                  <div className="animate-modal-in absolute left-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
                    <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Acceso rápido a módulos
                    </p>
                    {filteredModules.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-slate-500">Sin módulos coincidentes</p>
                    ) : (
                      filteredModules.map((mod) => {
                        const ModIcon = mod.icon;
                        return (
                          <Link
                            key={mod.to}
                            to={mod.to}
                            onClick={() => {
                              setSearchOpen(false);
                              setModuleQuery('');
                            }}
                            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs transition hover:bg-emerald-50"
                          >
                            <span className="flex items-center gap-2.5 font-semibold text-slate-800">
                              <ModIcon className="h-3.5 w-3.5 text-emerald-600" />
                              {mod.label}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                              {mod.category}
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Botones pill de acción rápida según rol */}
              {tienePermiso('solicitudes', 'crear') && (
                <Link
                  to="/solicitudes/nueva"
                  className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 xl:inline-flex"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nueva Rifa
                </Link>
              )}

              {tienePermiso('pagos', 'verificar') ? (
                <Link
                  to="/admin/pagos"
                  className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 2xl:inline-flex"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                  Verificar Pagos
                </Link>
              ) : (
                <Link
                  to="/explorar"
                  className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 xl:inline-flex"
                >
                  <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                  Catálogo
                </Link>
              )}

              {/* Reloj en tiempo real */}
              <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 2xl:inline-flex">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span className="tabular-nums">{clockLabel}</span>
              </div>

              {/* Campana de notificaciones */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setAccountOpen(false);
                    setSearchOpen(false);
                  }}
                  aria-label="Notificaciones"
                  className={`relative rounded-full border p-2 transition cursor-pointer ${
                    notifOpen
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                      {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="animate-modal-in absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Notificaciones</p>
                        <p className="text-xs text-slate-500">
                          {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
                        </p>
                      </div>
                      {noLeidas > 0 && (
                        <button
                          type="button"
                          onClick={() => marcarTodasMut.mutate()}
                          disabled={marcarTodasMut.isPending}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                      {loadingPopover ? (
                        <div className="space-y-2 p-4">
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                      ) : recientes.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-500">
                          No tienes notificaciones recientes.
                        </div>
                      ) : (
                        recientes.map((n) => (
                          <div
                            key={n.notificacionId}
                            className={`flex items-start justify-between gap-2 px-4 py-3 text-xs ${
                              n.leida ? 'bg-white' : 'bg-emerald-50/45'
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <p
                                className={`text-slate-800 ${
                                  n.leida ? 'font-normal' : 'font-semibold'
                                }`}
                              >
                                {n.mensaje}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {formatearFechaCorta(n.fechaEnvio || n.createdAt)}
                              </p>
                            </div>
                            {!n.leida && (
                              <button
                                type="button"
                                onClick={() => marcarLeidaMut.mutate(n.notificacionId)}
                                className="shrink-0 rounded-md p-1 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center">
                      <Link
                        to="/notificaciones"
                        onClick={() => setNotifOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Ver centro de notificaciones
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Desplegable de perfil del rol */}
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    setNotifOpen(false);
                    setSearchOpen(false);
                  }}
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1.5 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer"
                >
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-extrabold text-white">
                    {iniciales}
                    <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[120px] truncate text-xs font-extrabold text-slate-900">
                      {nombreCompleto}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {rolPrincipal}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                      accountOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="animate-modal-in absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400" />
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {nombreCompleto}
                      </p>
                      <p className="truncate text-xs text-slate-500">{usuario?.email}</p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200">
                        {rolPrincipal}
                      </span>
                    </div>

                    <div className="space-y-0.5 p-2">
                      <Link
                        to="/perfil"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <User className="h-4 w-4 text-emerald-600" />
                        Mi perfil y contraseña
                      </Link>
                      <Link
                        to="/explorar"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Ticket className="h-4 w-4 text-teal-600" />
                        Catálogo público
                      </Link>
                      {tieneAdminPanel && (
                        <Link
                          to={primerAdminDestino}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                          Consola Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

