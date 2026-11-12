import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  CheckSquare,
  ClipboardList,
  CreditCard,
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
        <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
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
      <main className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function PanelLayout() {
  const { esAdmin, tienePermiso, tieneAlgunPermiso } = useAuth();

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
    `flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="panel" />
      <div className="flex w-full flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-52">
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-md lg:sticky lg:top-20">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>{esAdmin ? 'Consola Admin' : 'Panel Organizador'}</span>
            </div>

            {esAdmin && itemsAdmin.length > 0 && (
              <div>
                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Administración
                </p>
                <nav className="flex flex-nowrap gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {itemsAdmin.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} className={navLinkClass}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}

            {itemsOrganizador.length > 0 && (
              <div>
                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {esAdmin ? 'Campañas' : 'Organización'}
                </p>
                <nav className="flex flex-nowrap gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {itemsOrganizador.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} className={navLinkClass}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}

            {!esAdmin && itemsAdmin.length > 0 && (
              <div>
                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Administración
                </p>
                <nav className="flex flex-nowrap gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {itemsAdmin.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} className={navLinkClass}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <AppFooter />
    </div>
  );
}
