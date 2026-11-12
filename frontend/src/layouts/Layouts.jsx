import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { FullPageSpinner } from '../components/ui/Feedback.jsx';
import { AppHeader } from './AppHeader.jsx';
import { AppFooter } from './AppFooter.jsx';
import { RoleShell } from './RoleShell.jsx';

export function PublicLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col overflow-x-clip bg-transparent">
      <AppHeader variant="public" />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-6 pb-20 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export function UserLayout() {
  return (
    <RoleShell>
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </RoleShell>
  );
}

export function PanelLayout() {
  return (
    <RoleShell>
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
        <div className="mx-auto w-full max-w-7xl">
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
    return <FullPageSpinner message="Cargando plataforma..." />;
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
