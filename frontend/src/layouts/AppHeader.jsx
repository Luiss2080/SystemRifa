import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, LogOut, Menu, Shield, Ticket, User, X } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';

export function AppHeader() {
  const { usuario, autenticado, esAdmin, logout, tienePermiso, tieneAlgunPermiso } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { data: notifResumen } = useQuery({
    queryKey: ['notificaciones-badge'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notificaciones', { params: { page: 1, limit: 1 } });
      return data;
    },
    enabled: autenticado,
    refetchInterval: 30000,
  });

  const noLeidas = notifResumen?.noLeidasCount || 0;

  const navPublica = [
    { to: '/', label: 'Rifas' },
    { to: '/causas', label: 'Causas' },
  ];

  const navParticipante = autenticado
    ? [
        { to: '/mis-tickets', label: 'Mis tickets' },
        { to: '/mis-pagos', label: 'Mis pagos' },
      ]
    : [];

  const navPanel = [];
  if (autenticado) {
    if (tienePermiso('solicitudes', 'crear')) {
      navPanel.push({ to: '/solicitudes/mias', label: 'Mis solicitudes' });
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
      navPanel.push({ to: '/organizador/rifas', label: 'Mis rifas (Org)' });
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
      navPanel.push({ to: primerAdminDestino, label: 'Administración' });
    }
  }

  async function handleLogout() {
    await logout();
    setMenuAbierto(false);
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="text-base tracking-tight">Rifas Solidarias</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[...navPublica, ...navParticipante, ...navPanel].map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {autenticado ? (
            <>
              <Link
                to="/notificaciones"
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {noLeidas > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    {noLeidas > 99 ? '99+' : noLeidas}
                  </span>
                )}
              </Link>

              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[...navPublica, ...navParticipante, ...navPanel].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuAbierto(false)}
                className={linkClass}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {autenticado ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/notificaciones"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
