import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  CreditCard,
  FilePlus2,
  HeartHandshake,
  History,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { FullPageSpinner } from '../components/ui/Feedback.jsx';
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
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="user" />
      <main className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function PanelLayout() {
  const { autenticado, esAdmin, esOrganizador, tienePermiso, tieneAlgunPermiso } = useAuth();
  const { rolPrincipal } = resolverAccesoRol({
    autenticado,
    esAdmin,
    esOrganizador,
    tienePermiso,
    tieneAlgunPermiso,
  });

  const navLinkClass = ({ isActive }) =>
    `flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  let secciones = [];

  if (rolPrincipal === 'ADMINISTRADOR') {
    const operacion = [
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
    ].filter(Boolean);

    const seguridad = [
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

    const supervision = [
      { to: '/organizador/rifas', label: 'Gestionar rifas', icon: Sparkles },
      { to: '/explorar', label: 'Catálogo activo', icon: Ticket },
    ];

    secciones = [
      operacion.length > 0 && { titulo: 'Operación', tone: 'text-slate-500', items: operacion },
      seguridad.length > 0 && {
        titulo: 'Sistema y seguridad',
        tone: 'text-slate-500',
        items: seguridad,
      },
      { titulo: 'Supervisión', tone: 'text-emerald-700', items: supervision },
    ].filter(Boolean);
  } else {
    const gestion = [
      tieneAlgunPermiso([
        ['rifas', 'administrar'],
        ['premios', 'crud'],
        ['sorteos', 'realizar'],
        ['ganadores', 'publicar'],
      ]) && {
        to: '/organizador/rifas',
        label: 'Mis rifas',
        icon: Sparkles,
      },
      tienePermiso('solicitudes', 'crear') && {
        to: '/solicitudes/mias',
        label: 'Mis solicitudes',
        icon: ClipboardList,
      },
      tienePermiso('solicitudes', 'crear') && {
        to: '/solicitudes/nueva',
        label: 'Nueva solicitud',
        icon: FilePlus2,
      },
    ].filter(Boolean);

    const participacion = [
      { to: '/explorar', label: 'Explorar rifas', icon: Ticket },
      tienePermiso('tickets', 'comprar') && {
        to: '/mis-tickets',
        label: 'Mis tickets',
        icon: Ticket,
      },
      tienePermiso('pagos', 'registrar') && {
        to: '/mis-pagos',
        label: 'Mis pagos',
        icon: CreditCard,
      },
    ].filter(Boolean);

    secciones = [
      gestion.length > 0 && {
        titulo: 'Gestión de campañas',
        tone: 'text-emerald-700',
        items: gestion,
      },
      participacion.length > 0 && {
        titulo: 'Participación',
        tone: 'text-slate-500',
        items: participacion,
      },
    ].filter(Boolean);
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
      <AppHeader variant="panel" />
      <div className="flex w-full flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-52">
          <div className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-md lg:sticky lg:top-20">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>{rolPrincipal === 'ADMINISTRADOR' ? 'Consola Admin' : 'Panel Organizador'}</span>
            </div>

            {secciones.map((sec) => (
              <div key={sec.titulo}>
                <p className={`mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider ${sec.tone}`}>
                  {sec.titulo}
                </p>
                <nav className="flex flex-nowrap gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {sec.items.map((item) => {
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
            ))}
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

/**
 * Selecciona el layout adecuado según el estado de sesión y rol para evitar
 * que los usuarios autenticados salten de vuelta a la landing pública.
 */
export function AdaptiveLayout() {
  const { autenticado, cargando, esAdmin, esOrganizador, tienePermiso, tieneAlgunPermiso } =
    useAuth();

  if (cargando) {
    return <FullPageSpinner message="Verificando sesión..." />;
  }

  if (!autenticado) {
    return <PublicLayout />;
  }

  const { tieneAdminPanel, tieneOrganizadorPanel } = resolverAccesoRol({
    autenticado,
    esAdmin,
    esOrganizador,
    tienePermiso,
    tieneAlgunPermiso,
  });

  if (tieneAdminPanel || tieneOrganizadorPanel) {
    return <PanelLayout />;
  }

  return <UserLayout />;
}
