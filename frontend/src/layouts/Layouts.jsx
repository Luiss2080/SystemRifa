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
import { AppFooter } from './AppFooter.jsx';

export function PublicLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function UserLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
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
    `flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-52">
          <div className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-sm backdrop-blur-md lg:sticky lg:top-20">
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
      <AppFooter />
    </div>
  );
}
