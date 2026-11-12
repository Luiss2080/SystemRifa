import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  CheckCheck,
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

export function AppHeader() {
  const { usuario, autenticado, esAdmin, logout, tienePermiso, tieneAlgunPermiso } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const popoverRef = useRef(null);

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
    if (!notifAbierto) return undefined;
    function handleClickFuera(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setNotifAbierto(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setNotifAbierto(false);
    }
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifAbierto]);

  const noLeidas = notifResumen?.noLeidasCount || 0;
  const recientes = notifRecientes?.items || [];

  const navPublica = [
    { to: '/', label: 'Rifas', icon: Ticket, end: true },
    { to: '/causas', label: 'Causas', icon: HeartHandshake },
    ...(!autenticado
      ? [
          { to: '/#como-funciona', label: 'Cómo funciona', icon: Sparkles },
          { to: '/solicitudes/nueva', label: 'Organizar rifa', icon: FilePlus2 },
        ]
      : []),
  ];

  const navParticipante = autenticado
    ? [
        { to: '/mis-tickets', label: 'Mis tickets', icon: Ticket },
        { to: '/mis-pagos', label: 'Mis pagos', icon: CreditCard },
      ]
    : [];

  const navPanel = [];
  if (autenticado) {
    if (tienePermiso('solicitudes', 'crear')) {
      navPanel.push({ to: '/solicitudes/nueva', label: 'Solicitar rifa', icon: FilePlus2 });
      navPanel.push({ to: '/solicitudes/mias', label: 'Mis solicitudes', icon: FolderKanban });
    }
    if (
      tieneAlgunPermiso([
        ['rifas', 'administrar'],
        ['premios', 'crud'],
        ['sorteos', 'realizar'],
        ['ganadores', 'publicar'],
      ]) ||
      tienePermiso('rifas', 'leer')
    ) {
      navPanel.push({ to: '/organizador/rifas', label: 'Mis rifas', icon: Sparkles });
    }
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
    if (tieneAdminPanel) {
      const primerAdminDestino = tienePermiso('reportes', 'leer')
        ? '/admin/reportes'
        : tienePermiso('solicitudes', 'revisar')
          ? '/admin/solicitudes'
          : '/admin/pagos';
      navPanel.push({ to: primerAdminDestino, label: 'Admin', icon: LayoutDashboard });
    }
  }

  const allNavItems = [...navPublica, ...navParticipante, ...navPanel];

  async function handleLogout() {
    setNotifAbierto(false);
    await logout();
    setMenuAbierto(false);
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/20 transition hover:scale-105">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="text-base tracking-tight">Rifas Solidarias</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              if (item.to.includes('#')) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4 text-emerald-600" />
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
                  onClick={() => setNotifAbierto((v) => !v)}
                  className={`relative rounded-xl p-2 transition cursor-pointer ${
                    notifAbierto
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
                  <div className="animate-modal-in absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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

              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <User className="h-4 w-4 text-emerald-600" />
                <span>{usuario?.alias}</span>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout} title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
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
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto && (
        <div className="animate-slide-up border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {allNavItems.map((item) => {
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
                  className={linkClass}
                  end={Boolean(item.end)}
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {autenticado ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/notificaciones"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                  </span>
                  {noLeidas > 0 && (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                      {noLeidas}
                    </span>
                  )}
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Mi perfil ({usuario?.alias})
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="justify-start">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
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
