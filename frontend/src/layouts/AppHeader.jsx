import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  Ticket,
  User,
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
  const popoverRef = useRef(null);
  const cuentaRef = useRef(null);

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
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setNotifAbierto(false);
        setCuentaAbierta(false);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifAbierto, cuentaAbierta]);

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

  // Navegación principal estrictamente acotada por rol (máximo 5 enlaces para evitar colisiones)
  let navItems = [];
  if (!autenticado) {
    navItems = [
      { to: '/', label: 'Rifas', icon: Ticket, end: true },
      { to: '/causas', label: 'Causas', icon: HeartHandshake },
      { to: '/#como-funciona', label: 'Cómo funciona', icon: Sparkles },
      { to: '/solicitudes/nueva', label: 'Organizar rifa', icon: FilePlus2 },
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
      { to: '/solicitudes/nueva', label: 'Solicitar rifa', icon: FilePlus2 },
    ];
  }

  // Enlaces secundarios del menú de cuenta (para mantener la barra superior limpia)
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
            : 'bg-slate-800 text-emerald-300 ring-slate-700',
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

  const linkClass = ({ isActive }) =>
    `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition ${
      esPanelDark
        ? isActive
          ? 'bg-emerald-500/20 font-semibold text-emerald-300 ring-1 ring-emerald-400/40'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        : isActive
          ? 'bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
      className={`sticky top-0 z-30 border-b backdrop-blur-md shadow-xs ${
        esPanelDark
          ? 'border-slate-800 bg-slate-900/95 text-white'
          : variant === 'user'
            ? 'border-emerald-200/80 bg-white/95 text-slate-900'
            : 'border-slate-200 bg-white/95 text-slate-900'
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:gap-5">
          <Link to={homeDestino} className="flex shrink-0 items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/20 transition hover:scale-105">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="text-base tracking-tight">Rifas Solidarias</span>
          </Link>

          {rolEtiqueta && (
            <span
              className={`hidden shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 xl:inline-flex ${rolEtiqueta.cls}`}
            >
              {rolEtiqueta.label}
            </span>
          )}

          <nav className="hidden items-center gap-1 overflow-x-auto lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.to.includes('#')) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition ${
                      esPanelDark
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-emerald-500" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <NavLink key={item.to} to={item.to} className={linkClass} end={Boolean(item.end)}>
                  <Icon className="h-4 w-4 opacity-80" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {autenticado ? (
            <>
              <div className="relative" ref={popoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifAbierto((v) => !v);
                    setCuentaAbierta(false);
                  }}
                  className={`relative rounded-xl p-2 transition cursor-pointer ${
                    esPanelDark
                      ? notifAbierto
                        ? 'bg-white/15 text-emerald-300 ring-1 ring-white/20'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      : notifAbierto
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Abrir notificaciones recientes"
                  aria-expanded={notifAbierto}
                  title="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
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
                              <p className={`text-slate-800 ${n.leida ? 'font-normal' : 'font-semibold'}`}>
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

              {/* Desplegable de cuenta para evitar saturar la barra superior */}
              <div className="relative" ref={cuentaRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCuentaAbierta((v) => !v);
                    setNotifAbierto(false);
                  }}
                  aria-expanded={cuentaAbierta}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                    esPanelDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100 hover:border-emerald-500/60 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
                >
                  <User className="h-4 w-4 text-emerald-500" />
                  <span className="max-w-[110px] truncate">{usuario?.alias}</span>
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
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="primary" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className={`rounded-xl p-2 lg:hidden cursor-pointer ${
            esPanelDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto && (
        <div className="animate-slide-up border-t border-slate-200 bg-white px-4 py-4 text-slate-800 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
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
                  <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full justify-center">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuAbierto(false)}>
                  <Button variant="secondary" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/registro" onClick={() => setMenuAbierto(false)}>
                  <Button variant="primary" className="w-full">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
