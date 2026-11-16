import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
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
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  User,
  UserPlus,
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
import { Button } from '../components/ui/Button.jsx';
import { BrandMark } from '../components/ui/BrandLogo.jsx';

export function AppHeader({ variant = 'public' }) {
  const { usuario, autenticado, esAdmin, esOrganizador, logout, tienePermiso, tieneAlgunPermiso } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  const popoverRef = useRef(null);
  const cuentaRef = useRef(null);
  const navRef = useRef(null);

  const esPanel = variant === 'panel';

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
    enabled: autenticado && notifAbierto,
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
    setDropdownAbierto(null);
    setMenuAbierto(false);
    setNotifAbierto(false);
    setCuentaAbierta(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (notifAbierto && popoverRef.current && !popoverRef.current.contains(e.target)) {
        setNotifAbierto(false);
      }
      if (cuentaAbierta && cuentaRef.current && !cuentaRef.current.contains(e.target)) {
        setCuentaAbierta(false);
      }
      if (dropdownAbierto && navRef.current && !navRef.current.contains(e.target)) {
        setDropdownAbierto(null);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setNotifAbierto(false);
        setCuentaAbierta(false);
        setDropdownAbierto(null);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifAbierto, cuentaAbierta, dropdownAbierto]);

  const noLeidas = notifResumen?.noLeidasCount || 0;
  const recientes = notifRecientes?.items || [];

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



  // Navegación pública unificada: pensada para explorar y adquirir rifas sin mezclar herramientas internas
  const navItems = [
    {
      to: autenticado ? '/explorar' : '/',
      label: 'Catálogo',
      icon: Ticket,
      end: true,
    },
    {
      to: '/causas',
      label: 'Causas',
      icon: HeartHandshake,
      end: false,
    },
    {
      to: '/sorteos',
      label: 'Sorteos & Ganadores',
      shortLabel: 'Sorteos',
      icon: Trophy,
      end: false,
    },
    {
      to: '/como-funciona',
      label: 'Cómo Funciona',
      icon: Sparkles,
      end: false,
    },
    {
      to: '/garantias',
      label: 'Garantías',
      icon: ShieldCheck,
      end: false,
    },
    {
      to: '/preguntas-frecuentes',
      label: 'Preguntas Frecuentes',
      shortLabel: 'Ayuda & FAQ',
      icon: HelpCircle,
      end: false,
    },
    {
      to: '/contacto',
      label: 'Contacto',
      icon: Mail,
      end: false,
    },
    {
      to: '/organizar',
      label: 'Organizar una Rifa',
      icon: FilePlus2,
      soloMobile: true,
      end: false,
    },
  ];



  const nombreCompleto =
    [usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ').trim() ||
    usuario?.alias ||
    'Usuario';
  const iniciales =
    `${(usuario?.nombres || '')[0] || ''}${(usuario?.apellidos || '')[0] || ''}`.toUpperCase() ||
    (usuario?.alias || 'RS').slice(0, 2).toUpperCase();

  const cuentaLinks = autenticado
    ? [
        {
          to: '/perfil',
          label: 'Mi perfil completo',
          icon: User,
          iconBox: 'bg-emerald-50 text-emerald-700',
        },
        {
          to: '/perfil#seguridad',
          label: 'Seguridad y contraseña',
          icon: ShieldCheck,
          iconBox: 'bg-amber-50 text-amber-700',
        },
        ...(rolPrincipal === 'ADMINISTRADOR'
          ? [
              {
                to: primerAdminDestino,
                label: 'Consola de administración',
                icon: LayoutDashboard,
                iconBox: 'bg-slate-100 text-slate-700',
              },
              {
                to: '/admin/auditoria',
                label: 'Auditoría del sistema',
                icon: History,
                iconBox: 'bg-indigo-50 text-indigo-700',
              },
            ]
          : rolPrincipal === 'ORGANIZADOR'
            ? [
                {
                  to: '/organizador/rifas',
                  label: 'Gestionar mis rifas',
                  icon: Sparkles,
                  iconBox: 'bg-teal-50 text-teal-700',
                },
                ...(tienePermiso('tickets', 'comprar')
                  ? [
                      {
                        to: '/mis-tickets',
                        label: 'Mis tickets',
                        icon: Ticket,
                        iconBox: 'bg-sky-50 text-sky-700',
                      },
                    ]
                  : []),
              ]
            : [
                {
                  to: '/mis-tickets',
                  label: 'Mis tickets',
                  icon: Ticket,
                  iconBox: 'bg-teal-50 text-teal-700',
                },
                {
                  to: '/mis-pagos',
                  label: 'Mis pagos',
                  icon: CreditCard,
                  iconBox: 'bg-sky-50 text-sky-700',
                },
                ...(tienePermiso('solicitudes', 'crear')
                  ? [
                      {
                        to: '/solicitudes/mias',
                        label: 'Mis solicitudes',
                        icon: FolderKanban,
                        iconBox: 'bg-indigo-50 text-indigo-700',
                      },
                    ]
                  : []),
              ]),
      ]
    : [];

  const rolEtiqueta = !autenticado
    ? null
    : tieneAdminPanel
      ? { label: 'Administrador', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300/80' }
      : tieneOrganizadorPanel
        ? { label: 'Organizador', cls: 'bg-teal-100 text-teal-800 ring-teal-300/80' }
        : { label: 'Participante', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };

  async function handleLogout() {
    setNotifAbierto(false);
    setCuentaAbierta(false);
    await logout();
    setMenuAbierto(false);
    navigate('/');
  }

  const pillItemClass = ({ isActive }) =>
    `inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition xl:gap-1.5 xl:px-3.5 xl:text-[12px] ${
      isActive
        ? 'bg-emerald-700 text-white shadow-xs'
        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  const pillPlainClass =
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer xl:gap-1.5 xl:px-3.5 xl:text-[12px]';

  return (
    <header
      className={`sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 text-slate-900 shadow-2xs backdrop-blur-md ${
        esPanel ? 'border-t-[3px] border-t-emerald-600' : ''
      }`}
    >
      <div
        className={`mx-auto flex h-18 w-full items-center justify-between gap-2 px-4 sm:px-6 lg:gap-3 lg:px-8 ${
          esPanel ? 'max-w-[1440px]' : 'max-w-7xl'
        }`}
      >
        {/* Marca / Logo */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <Link to={homeDestino} className="group flex items-center gap-2.5">
            <BrandMark size="lg" className="shadow-md shadow-emerald-600/20 group-hover:scale-105" />
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight text-slate-900">
                RIFAS <span className="text-emerald-600">SOLIDARIAS</span>
              </span>
              <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-widest text-slate-500 xl:block">
                {esPanel ? 'Consola de Gestión' : 'Sorteos Auditados'}
              </span>
            </span>
          </Link>

          {rolEtiqueta && (
            <span
              className={`hidden shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 xl:inline-flex ${rolEtiqueta.cls}`}
            >
              {rolEtiqueta.label}
            </span>
          )}
        </div>

        {/* Barra Central Ordenada con Píldoras Directas */}
        <nav
          ref={navRef}
          aria-label="Navegación principal"
          className="hidden items-center gap-0.5 rounded-full border border-slate-200/90 bg-slate-50/75 px-1.5 py-1 shadow-2xs lg:flex xl:gap-1 xl:px-2 xl:py-1.5"
        >
          {navItems
            .filter((item) => !item.soloMobile)
            .map((item) => (
              <NavLink key={item.to} to={item.to} className={pillItemClass} end={Boolean(item.end)}>
                <span className="hidden xl:inline">{item.label}</span>
                <span className="xl:hidden">{item.shortLabel || item.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* Acciones Derecha */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {autenticado ? (
            <>
              {tieneAdminPanel ? (
                <Link
                  to={primerAdminDestino}
                  className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition hover:bg-emerald-700 hover:shadow-sm xl:inline-flex"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              ) : tieneOrganizadorPanel ? (
                <Link
                  to="/organizador/rifas"
                  className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition hover:bg-emerald-700 hover:shadow-sm xl:inline-flex"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Panel Organizador
                </Link>
              ) : (
                <Link
                  to="/mis-tickets"
                  className="hidden items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-400 xl:inline-flex"
                >
                  <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                  Mis tickets
                </Link>
              )}

              <div className="relative" ref={popoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifAbierto((v) => !v);
                    setCuentaAbierta(false);
                    setDropdownAbierto(null);
                  }}
                  className={`relative rounded-full border p-2.5 transition cursor-pointer ${
                    notifAbierto
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-label="Abrir notificaciones recientes"
                  aria-expanded={notifAbierto}
                  title="Notificaciones"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                  )}
                </button>

                {notifAbierto && (
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
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                      {loadingPopover ? (
                        <div className="space-y-2 p-4">
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                      ) : recientes.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-500">
                          No tienes notificaciones registradas aún.
                        </div>
                      ) : (
                        recientes.map((n) => (
                          <div
                            key={n.notificacionId}
                            className={`flex items-start justify-between gap-2 px-4 py-3 text-xs transition ${
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
                                title="Marcar como leída"
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
                        onClick={() => setNotifAbierto(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Ver centro de notificaciones
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={cuentaRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCuentaAbierta((v) => !v);
                    setNotifAbierto(false);
                    setDropdownAbierto(null);
                  }}
                  aria-expanded={cuentaAbierta}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1.5 text-sm font-semibold text-slate-800 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-teal-700 text-[11px] font-extrabold text-white shadow-2xs">
                    {iniciales}
                  </span>
                  <span className="max-w-[130px] truncate text-xs font-bold text-slate-800 xl:max-w-[175px]">
                    {nombreCompleto}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
                      cuentaAbierta ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {cuentaAbierta && (
                  <div className="animate-modal-in absolute right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-900/5">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-700 via-teal-600 to-amber-500" />

                    <div className="flex flex-col items-center px-5 pt-5 pb-4 text-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-xl font-extrabold tracking-tight text-white shadow-md ring-4 ring-emerald-50">
                        {iniciales}
                      </span>
                      <p className="mt-3 max-w-full truncate text-base font-extrabold tracking-tight text-slate-900">
                        {nombreCompleto}
                      </p>
                      <p className="mt-0.5 max-w-full truncate text-xs font-medium text-emerald-700">
                        {usuario?.email}
                      </p>
                      <span className="mt-2.5 inline-flex items-center rounded-full bg-amber-100/90 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 ring-1 ring-amber-300/70">
                        {rolPrincipal}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 p-2 space-y-0.5">
                      {cuentaLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setCuentaAbierta(false)}
                            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-emerald-50/70 hover:text-emerald-900"
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                item.iconBox || 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800 hover:shadow-md"
              >
                <Users className="h-3.5 w-3.5" />
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-sm shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Crear cuenta
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Acciones móviles: campana + botón hamburguesa */}
        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          {autenticado && (
            <Link
              to="/notificaciones"
              aria-label="Notificaciones"
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <Bell className="h-5 w-5" />
              {noLeidas > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {noLeidas > 99 ? '99+' : noLeidas}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menú"
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable con grupos */}
      {menuAbierto && (
        <div className="animate-slide-up max-h-[82vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 text-slate-800 lg:hidden">
          {autenticado && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-teal-700 text-sm font-extrabold text-white shadow-xs">
                {iniciales}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">{nombreCompleto}</p>
                <p className="truncate text-xs text-emerald-700">{usuario?.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">
                {rolPrincipal}
              </span>
            </div>
          )}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                  end={Boolean(item.end)}
                >
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {autenticado ? (
              <div className="flex flex-col gap-1.5">
                {cuentaLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`mob-${item.to}`}
                      to={item.to}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          item.iconBox || 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/notificaciones"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    Notificaciones
                  </span>
                  {noLeidas > 0 && (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                      {noLeidas}
                    </span>
                  )}
                </Link>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white"
                >
                  <Users className="h-4 w-4" />
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
