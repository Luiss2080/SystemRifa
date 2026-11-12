import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FilePlus2,
  FolderKanban,
  HeartHandshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Ticket,
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
import { formatearFechaCorta } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';

export function AppHeader({ variant = 'public' }) {
  const { usuario, autenticado, esAdmin, esOrganizador, logout, tienePermiso, tieneAlgunPermiso } =
    useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [solucionesAbiertas, setSolucionesAbiertas] = useState(false);
  const popoverRef = useRef(null);
  const cuentaRef = useRef(null);
  const solucionesRef = useRef(null);

  const esPanelDark = variant === 'panel';

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
    function handleClickFuera(e) {
      if (notifAbierto && popoverRef.current && !popoverRef.current.contains(e.target)) {
        setNotifAbierto(false);
      }
      if (cuentaAbierta && cuentaRef.current && !cuentaRef.current.contains(e.target)) {
        setCuentaAbierta(false);
      }
      if (
        solucionesAbiertas &&
        solucionesRef.current &&
        !solucionesRef.current.contains(e.target)
      ) {
        setSolucionesAbiertas(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setNotifAbierto(false);
        setCuentaAbierta(false);
        setSolucionesAbiertas(false);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifAbierto, cuentaAbierta, solucionesAbiertas]);

  const noLeidas = notifResumen?.noLeidasCount || 0;
  const recientes = notifRecientes?.items || [];

  const tieneAdminPanel =
    esAdmin ||
    tieneAlgunPermiso([
      ['solicitudes', 'revisar'],
      ['pagos', 'verificar'],
      ['causas', 'crud'],
      ['usuarios', 'leer'],
      ['roles', 'administrar'],
      ['permisos', 'administrar'],
      ['plantillas', 'administrar'],
    ]);

  const tieneOrganizadorPanel =
    esOrganizador ||
    tieneAlgunPermiso([
      ['rifas', 'administrar'],
      ['premios', 'crud'],
      ['sorteos', 'realizar'],
      ['ganadores', 'publicar'],
    ]);

  const primerAdminDestino = tienePermiso('reportes', 'leer')
    ? '/admin/reportes'
    : tienePermiso('solicitudes', 'revisar')
      ? '/admin/solicitudes'
      : '/admin/pagos';

  let navItems = [];
  if (!autenticado) {
    navItems = [
      { to: '/', label: 'Rifas', icon: Ticket, end: true },
      { to: '/causas', label: 'Causas', icon: HeartHandshake },
      { to: '/#como-funciona', label: 'Cómo funciona', icon: Sparkles },
      { type: 'dropdown', label: 'Soluciones', icon: ShieldCheck },
      { to: '#contacto-footer', label: 'Contáctanos', icon: HelpCircle, scrollOnly: true },
    ];
  } else if (tieneAdminPanel) {
    navItems = [
      { to: primerAdminDestino, label: 'Panel Admin', icon: LayoutDashboard },
      { to: '/admin/solicitudes', label: 'Solicitudes', icon: FolderKanban },
      { to: '/admin/pagos', label: 'Pagos', icon: CheckSquare },
      { to: '/', label: 'Catálogo', icon: Ticket, end: true },
      { to: '/causas', label: 'Causas', icon: HeartHandshake },
    ];
  } else if (tieneOrganizadorPanel) {
    navItems = [
      { to: '/organizador/rifas', label: 'Mis rifas', icon: Sparkles },
      { to: '/solicitudes/mias', label: 'Mis solicitudes', icon: FolderKanban },
      { to: '/solicitudes/nueva', label: 'Solicitar rifa', icon: FilePlus2 },
      { to: '/', label: 'Catálogo', icon: Ticket, end: true },
      { to: '/mis-tickets', label: 'Mis tickets', icon: Ticket },
    ];
  } else {
    navItems = [
      { to: '/', label: 'Rifas', icon: Ticket, end: true },
      { to: '/causas', label: 'Causas', icon: HeartHandshake },
      { to: '/mis-tickets', label: 'Mis tickets', icon: Ticket },
      { to: '/mis-pagos', label: 'Mis pagos', icon: CreditCard },
      { to: '/solicitudes/nueva', label: 'Organizar rifa', icon: FilePlus2 },
    ];
  }

  const cuentaLinks = autenticado
    ? [
        { to: '/perfil', label: 'Mi perfil y contraseña', icon: User },
        { to: '/mis-tickets', label: 'Mis tickets', icon: Ticket },
        { to: '/mis-pagos', label: 'Mis pagos', icon: CreditCard },
        ...(tienePermiso('solicitudes', 'crear')
          ? [{ to: '/solicitudes/mias', label: 'Mis solicitudes', icon: FolderKanban }]
          : []),
        ...(tieneOrganizadorPanel || tienePermiso('rifas', 'leer')
          ? [{ to: '/organizador/rifas', label: 'Gestionar rifas', icon: Sparkles }]
          : []),
        ...(tieneAdminPanel
          ? [{ to: primerAdminDestino, label: 'Panel Administración', icon: LayoutDashboard }]
          : []),
      ]
    : [];

  const rolEtiqueta = !autenticado
    ? null
    : esAdmin
      ? {
          label: 'Administrador',
          cls: esPanelDark
            ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30'
            : 'bg-slate-900 text-emerald-300 ring-slate-700',
        }
      : esOrganizador
        ? {
            label: 'Organizador',
            cls: esPanelDark
              ? 'bg-teal-500/20 text-teal-200 ring-teal-400/30'
              : 'bg-teal-50 text-teal-800 ring-teal-200',
          }
        : { label: 'Participante', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };

  async function handleLogout() {
    setNotifAbierto(false);
    setCuentaAbierta(false);
    await logout();
    setMenuAbierto(false);
    navigate('/');
  }

  function scrollToElement(id) {
    setMenuAbierto(false);
    setSolucionesAbiertas(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  }

  function openHelpWidget() {
    setMenuAbierto(false);
    setSolucionesAbiertas(false);
    window.dispatchEvent(new CustomEvent('open-help-widget'));
  }

  const pillItemClass = ({ isActive }) =>
    `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide transition ${
      esPanelDark
        ? isActive
          ? 'bg-emerald-500 text-slate-950 shadow-xs'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        : isActive
          ? 'bg-emerald-700 text-white shadow-xs'
          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  const pillPlainClass = `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide transition cursor-pointer ${
    esPanelDark
      ? 'text-slate-300 hover:bg-white/10 hover:text-white'
      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
  }`;

  const homeDestino = !autenticado
    ? '/'
    : tieneAdminPanel
      ? primerAdminDestino
      : tieneOrganizadorPanel
        ? '/organizador/rifas'
        : '/';

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
        esPanelDark
          ? 'border-slate-800 bg-slate-950/95 text-white shadow-sm'
          : variant === 'user'
            ? 'border-emerald-200/70 bg-white/95 text-slate-900 shadow-2xs'
            : 'border-slate-200/80 bg-white/95 text-slate-900 shadow-2xs'
      }`}
    >
      <div className="mx-auto flex h-18 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Marca / Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <Link to={homeDestino} className="group flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20 transition duration-200 group-hover:scale-105">
              <Ticket className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400" />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight">
                <span className={esPanelDark ? 'text-white' : 'text-slate-900'}>RIFAS</span>
                <span className="text-emerald-600">SOLIDARIAS</span>
              </span>
              <span
                className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-widest ${
                  esPanelDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Sorteos Auditados
              </span>
            </span>
          </Link>

          {rolEtiqueta && (
            <span
              className={`hidden shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 2xl:inline-flex ${rolEtiqueta.cls}`}
            >
              {rolEtiqueta.label}
            </span>
          )}
        </div>

        {/* Barra Central Ordenada tipo Cápsula (como la imagen de referencia) */}
        <nav
          aria-label="Navegación principal"
          className={`hidden items-center gap-1 rounded-full border px-2 py-1.5 shadow-xs lg:flex ${
            esPanelDark
              ? 'border-slate-700/80 bg-slate-900/90'
              : 'border-slate-200/90 bg-white'
          }`}
        >
          {navItems.map((item) => {
            if (item.type === 'dropdown') {
              return (
                <div key={item.label} className="relative" ref={solucionesRef}>
                  <button
                    type="button"
                    onClick={() => setSolucionesAbiertas((v) => !v)}
                    aria-expanded={solucionesAbiertas}
                    className={`${pillPlainClass} ${
                      solucionesAbiertas ? 'bg-emerald-50 text-emerald-800' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        solucionesAbiertas ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {solucionesAbiertas && (
                    <div className="animate-modal-in absolute left-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
                      <Link
                        to="/solicitudes/nueva"
                        onClick={() => setSolucionesAbiertas(false)}
                        className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-emerald-50"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <FilePlus2 className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-slate-900">
                            Organizar una rifa
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Envía tu campaña para aprobación
                          </span>
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => scrollToElement('garantias')}
                        className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50 cursor-pointer"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-slate-900">
                            Garantías y auditoría
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Reservas de 15m y control RBAC
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={openHelpWidget}
                        className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50 cursor-pointer"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                          <HelpCircle className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-slate-900">
                            Asistente RifaBot 24/7
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Guía rápida sobre tickets y pagos
                          </span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.scrollOnly) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToElement('contacto-footer')}
                  className={pillPlainClass}
                >
                  {item.label}
                </button>
              );
            }

            if (item.to.includes('#')) {
              return (
                <Link key={item.to} to={item.to} className={pillPlainClass}>
                  {item.label}
                </Link>
              );
            }

            return (
              <NavLink key={item.to} to={item.to} className={pillItemClass} end={Boolean(item.end)}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Acciones Derecha (Botones pill comerciales o Cuenta + Notificaciones) */}
        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          {autenticado ? (
            <>
              <div className="relative" ref={popoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifAbierto((v) => !v);
                    setCuentaAbierta(false);
                  }}
                  className={`relative rounded-full p-2.5 transition cursor-pointer ${
                    esPanelDark
                      ? notifAbierto
                        ? 'bg-white/15 text-emerald-300 ring-1 ring-white/20'
                        : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : notifAbierto
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                  <div className="animate-modal-in absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
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
                                className={`text-slate-800 ${n.leida ? 'font-normal' : 'font-semibold'}`}
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
                  }}
                  aria-expanded={cuentaAbierta}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition cursor-pointer ${
                    esPanelDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-500/60 hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <span className="max-w-[115px] truncate">{usuario?.alias}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${cuentaAbierta ? 'rotate-180' : ''}`}
                  />
                </button>

                {cuentaAbierta && (
                  <div className="animate-modal-in absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {usuario?.nombres} {usuario?.apellidos}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{usuario?.email}</p>
                    </div>

                    <div className="my-1 space-y-0.5">
                      {cuentaLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setCuentaAbierta(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <Icon className="h-4 w-4 text-emerald-600" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
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

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className={`rounded-xl p-2 lg:hidden cursor-pointer ${
            esPanelDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="animate-slide-up border-t border-slate-200 bg-white px-4 py-4 text-slate-800 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.type === 'dropdown') {
                return (
                  <div key={item.label} className="space-y-1 rounded-2xl bg-slate-50 p-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <Link
                      to="/solicitudes/nueva"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      <FilePlus2 className="h-4 w-4 text-emerald-600" />
                      Organizar una rifa
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToElement('garantias')}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-white cursor-pointer"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      Garantías y auditoría
                    </button>
                    <button
                      type="button"
                      onClick={openHelpWidget}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-white cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4 text-sky-600" />
                      Asistente RifaBot
                    </button>
                  </div>
                );
              }

              if (item.scrollOnly) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => scrollToElement('contacto-footer')}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {item.label}
                  </button>
                );
              }

              if (item.to.includes('#')) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuAbierto(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  end={Boolean(item.end)}
                >
                  <Icon className="h-4 w-4 text-emerald-600" />
                  {item.label}
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
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Icon className="h-4 w-4 text-emerald-600" />
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
