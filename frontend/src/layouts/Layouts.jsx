import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { AppHeader } from './AppHeader.jsx';
import { AppFooter } from './AppFooter.jsx';
import { RoleShell } from './RoleShell.jsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.jsx';

export function PublicLayout() {
  const location = useLocation();
  const esHome = location.pathname === '/';

  return (
    <div className="relative z-10 flex min-h-screen flex-col overflow-x-clip bg-transparent">
      <AppHeader variant="public" />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-2 sm:py-3 lg:py-4 sm:px-6 lg:px-8">
        {!esHome && (
          <div className="mb-2 sm:mb-3">
            <Breadcrumbs />
          </div>
        )}
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col overflow-x-clip bg-transparent">
      <AppHeader variant="public" />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 self-start">
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export function UserLayout() {
  return (
    <RoleShell>
      <main className="flex flex-1 flex-col px-4 py-2 sm:py-3 pb-20 sm:px-6 lg:px-8 lg:pb-10">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <div className="mb-2 sm:mb-3">
            <Breadcrumbs />
          </div>
          <Outlet />
        </div>
      </main>
    </RoleShell>
  );
}

export function PanelLayout() {
  return (
    <RoleShell>
      <main className="flex flex-1 flex-col px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-10">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <Outlet />
        </div>
      </main>
    </RoleShell>
  );
}

/**
 * Layout adaptativo según rol:
 * - Visitante sin sesión -> PublicLayout
 * - Participante -> UserLayout
 * - Organizador / Administrador -> PanelLayout
 */
export function AdaptiveLayout() {
  const { autenticado, cargando, esAdmin, esOrganizador, tienePermiso, tieneAlgunPermiso } =
    useAuth();

  if (cargando) {
    return null;
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
