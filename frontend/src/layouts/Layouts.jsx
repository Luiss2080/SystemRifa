import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FilePlus2,
  HeartHandshake,
  History,
  KeyRound,
  Mail,
  Shield,
  Ticket,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { AppHeader } from './AppHeader.jsx';
import { AppFooter } from './AppFooter.jsx';

export function PublicLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="public" />
      <main className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function UserLayout() {
  const userNavClass = ({ isActive }) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'bg-white/90 text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="user" />
      <div className="border-b border-emerald-200/70 bg-emerald-50/70 backdrop-blur-xs">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Mi espacio personal
          </span>
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
            <NavLink to="/mis-tickets" className={userNavClass}>
              <Ticket className="h-3.5 w-3.5" />
              Mis tickets
            </NavLink>
            <NavLink to="/mis-pagos" className={userNavClass}>
              <CreditCard className="h-3.5 w-3.5" />
              Mis pagos
            </NavLink>
            <NavLink to="/notificaciones" className={userNavClass}>
              <Bell className="h-3.5 w-3.5" />
              Notificaciones
            </NavLink>
            <NavLink to="/perfil" className={userNavClass}>
              <User className="h-3.5 w-3.5" />
              Mi perfil
            </NavLink>
          </nav>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function PanelLayout() {
  const { esAdmin, tienePermiso, tieneAlgunPermiso, usuario } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const itemsOrganizador = [
    tienePermiso('solicitudes', 'crear') && {
      to: '/solicitudes/nueva',
      label: 'Nueva solicitud',
      icon: FilePlus2,
    },
    tienePermiso('solicitudes', 'crear') && {
      to: '/solicitudes/mias',
      label: 'Mis solicitudes',
      icon: ClipboardList,
    },
    (tienePermiso('rifas', 'leer') ||
      tieneAlgunPermiso([
        ['rifas', 'administrar'],
        ['premios', 'crud'],
        ['sorteos', 'realizar'],
        ['ganadores', 'publicar'],
      ])) && {
      to: '/organizador/rifas',
      label: 'Mis rifas',
      icon: Ticket,
    },
  ].filter(Boolean);

  const itemsAdmin = [
    (esAdmin || tienePermiso('reportes', 'leer')) && {
      to: '/admin/reportes',
      label: 'Reportes',
      icon: BarChart3,
    },
    tienePermiso('solicitudes', 'revisar') && {
      to: '/admin/solicitudes',
      label: 'Solicitudes',
      icon: ClipboardList,
    },
    tienePermiso('pagos', 'verificar') && {
      to: '/admin/pagos',
      label: 'Pagos',
      icon: CheckSquare,
    },
    tienePermiso('causas', 'crud') && {
      to: '/admin/causas',
      label: 'Causas',
      icon: HeartHandshake,
    },
    tienePermiso('usuarios', 'leer') && {
      to: '/admin/usuarios',
      label: 'Usuarios',
      icon: Users,
    },
    (tienePermiso('roles', 'administrar') || tienePermiso('permisos', 'administrar')) && {
      to: '/admin/roles',
      label: 'Roles y permisos',
      icon: KeyRound,
    },
    tienePermiso('plantillas', 'administrar') && {
      to: '/admin/plantillas',
      label: 'Plantillas notif.',
      icon: Mail,
    },
    (esAdmin || tienePermiso('reportes', 'leer')) && {
      to: '/admin/auditoria',
      label: 'Auditoría',
      icon: History,
    },
  ].filter(Boolean);

  const navLinkClass = ({ isActive }) =>
    `group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
        : 'text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-800'
    }`;

  const renderGroup = (title, items, accentText = 'text-slate-500') => {
    if (!items.length) return null;
    return (
      <div className="space-y-1">
        {!collapsed && (
          <p className={`px-3 text-[11px] font-extrabold uppercase tracking-wider ${accentText}`}>
            {title}
          </p>
        )}
        <nav className="flex flex-nowrap gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="panel" />

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        {/* Sidebar estándar pegado al extremo izquierdo */}
        <aside
          className={`w-full shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all duration-200 lg:border-r lg:border-b-0 ${
            collapsed ? 'lg:w-[76px]' : 'lg:w-64'
          }`}
        >
          <div className="flex flex-col gap-4 p-3 lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)] lg:overflow-y-auto lg:px-3.5 lg:pt-4 lg:pb-20">
            {/* Cabecera del Sidebar + botón contraer */}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50/70 px-3 py-2.5">
              <div className={`flex min-w-0 items-center gap-2 ${collapsed ? 'lg:hidden' : ''}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Shield className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-slate-900">
                    {esAdmin ? 'Consola Admin' : 'Panel Organizador'}
                  </p>
                  <p className="truncate text-[10px] font-medium text-emerald-700">
                    @{usuario?.alias}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                title={collapsed ? 'Expandir menú' : 'Contraer menú'}
                className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 shadow-2xs transition hover:bg-emerald-600 hover:text-white lg:inline-flex cursor-pointer"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Grupos de navegación */}
            <div className="space-y-5">
              {esAdmin ? (
                <>
                  {renderGroup('Administración', itemsAdmin, 'text-slate-500')}
                  {renderGroup('Campañas', itemsOrganizador, 'text-emerald-700')}
                </>
              ) : (
                <>
                  {renderGroup('Organización', itemsOrganizador, 'text-emerald-700')}
                  {renderGroup('Administración', itemsAdmin, 'text-slate-500')}
                </>
              )}
            </div>

            {/* Acceso directo inferior al catálogo público */}
            <div className="mt-auto hidden border-t border-slate-200/80 pt-3 lg:block">
              <Link
                to="/"
                title={collapsed ? 'Ir al catálogo público' : undefined}
                className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 ${
                  collapsed ? 'justify-center px-2' : 'justify-between'
                }`}
              >
                <span className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
                  <Ticket className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className={collapsed ? 'hidden' : ''}>Ver catálogo web</span>
                </span>
                {!collapsed && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
              </Link>
            </div>
          </div>
        </aside>

        {/* Área principal + Footer alineados a la derecha del sidebar */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
