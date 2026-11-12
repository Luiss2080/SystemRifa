import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  FilePlus2,
  HeartHandshake,
  History,
  KeyRound,
  Mail,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { AppHeader } from './AppHeader.jsx';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        Sistema de Rifas Solidarias · Transparencia y apoyo a causas sociales
      </footer>
    </div>
  );
}

export function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
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
    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            {itemsOrganizador.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Organización
                </p>
                <nav className="flex flex-wrap gap-1 lg:flex-col">
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

            {itemsAdmin.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Administración
                </p>
                <nav className="flex flex-wrap gap-1 lg:flex-col">
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
    </div>
  );
}
