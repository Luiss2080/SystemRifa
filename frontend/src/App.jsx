import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext.jsx';
import { resolverAccesoRol } from './features/auth/roleAccess.js';
import { ToastProvider } from './components/ui/Toast.jsx';
import { InteractiveBackground } from './components/ui/InteractiveBackground.jsx';
import { FloatingWidgets } from './components/ui/FloatingWidgets.jsx';
import { FullPageSpinner } from './components/ui/Feedback.jsx';
import { AdaptiveLayout, AuthLayout, PanelLayout, PublicLayout } from './layouts/Layouts.jsx';
import { RequireAuth } from './routes/RequireAuth.jsx';
import { RequirePermiso } from './routes/RequirePermiso.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegistroPage } from './pages/RegistroPage.jsx';
import { PerfilPage } from './pages/PerfilPage.jsx';
import { ForbiddenPage } from './pages/ForbiddenPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { CatalogoPage } from './pages/CatalogoPage.jsx';
import { CausasPublicPage } from './pages/CausasPublicPage.jsx';
import { RifaDetallePage } from './pages/RifaDetallePage.jsx';
import { ResultadoPublicoPage } from './pages/ResultadoPublicoPage.jsx';
import { MisTicketsPage } from './pages/MisTicketsPage.jsx';
import { MisPagosPage } from './pages/MisPagosPage.jsx';
import { NotificacionesPage } from './pages/NotificacionesPage.jsx';
import { NuevaSolicitudPage } from './pages/panel/NuevaSolicitudPage.jsx';
import { MisSolicitudesPage } from './pages/panel/MisSolicitudesPage.jsx';
import { OrganizadorRifasPage } from './pages/panel/OrganizadorRifasPage.jsx';
import { OrganizadorRifaGestionPage } from './pages/panel/OrganizadorRifaGestionPage.jsx';
import { AdminSolicitudesPage } from './pages/admin/AdminSolicitudesPage.jsx';
import { AdminPagosPage } from './pages/admin/AdminPagosPage.jsx';
import { AdminCausasPage } from './pages/admin/AdminCausasPage.jsx';
import { AdminUsuariosPage } from './pages/admin/AdminUsuariosPage.jsx';
import { AdminRolesPage } from './pages/admin/AdminRolesPage.jsx';
import { AdminPlantillasPage } from './pages/admin/AdminPlantillasPage.jsx';
import { AdminReportesPage } from './pages/admin/AdminReportesPage.jsx';
import { AdminAuditoriaPage } from './pages/admin/AdminAuditoriaPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LandingORedireccion() {
  const { autenticado, cargando, esAdmin, esOrganizador, tienePermiso, tieneAlgunPermiso } =
    useAuth();

  if (cargando) {
    return <FullPageSpinner message="Verificando sesión..." />;
  }

  if (autenticado) {
    const { homeDestino } = resolverAccesoRol({
      autenticado,
      esAdmin,
      esOrganizador,
      tienePermiso,
      tieneAlgunPermiso,
    });
    return <Navigate to={homeDestino} replace />;
  }

  return <PublicLayout />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <InteractiveBackground />
            <FloatingWidgets />
            <Routes>
              {/* Landing pública exclusiva para visitantes sin sesión */}
              <Route element={<LandingORedireccion />}>
                <Route path="/" element={<CatalogoPage mode="landing" />} />
              </Route>

              {/* Rutas compartidas: Landing si es visitante, Sistema si está autenticado */}
              <Route element={<AdaptiveLayout />}>
                <Route path="/causas" element={<CausasPublicPage />} />
                <Route path="/rifas/:id" element={<RifaDetallePage />} />
                <Route path="/rifas/:id/resultado" element={<ResultadoPublicoPage />} />
              </Route>

              {/* Acceso y errores */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
              </Route>

              {/* Sistema autenticado */}
              <Route element={<RequireAuth />}>
                {/* Espacio del rol (Participante en UserLayout; Organizador/Admin en PanelLayout) */}
                <Route element={<AdaptiveLayout />}>
                  <Route path="/explorar" element={<CatalogoPage mode="app" />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/mis-tickets" element={<MisTicketsPage />} />
                  <Route path="/mis-pagos" element={<MisPagosPage />} />
                  <Route path="/notificaciones" element={<NotificacionesPage />} />

                  <Route element={<RequirePermiso recurso="solicitudes" accion="crear" />}>
                    <Route path="/solicitudes/nueva" element={<NuevaSolicitudPage />} />
                    <Route path="/solicitudes/mias" element={<MisSolicitudesPage />} />
                  </Route>
                </Route>

                {/* Panel de gestión Organizador y Administrador */}
                <Route element={<PanelLayout />}>
                  <Route
                    element={
                      <RequirePermiso
                        anyOf={[
                          ['rifas', 'administrar'],
                          ['premios', 'crud'],
                          ['sorteos', 'realizar'],
                          ['ganadores', 'publicar'],
                        ]}
                      />
                    }
                  >
                    <Route path="/organizador/rifas" element={<OrganizadorRifasPage />} />
                    <Route path="/organizador/rifas/:id" element={<OrganizadorRifaGestionPage />} />
                  </Route>

                  <Route element={<RequirePermiso recurso="solicitudes" accion="revisar" />}>
                    <Route path="/admin/solicitudes" element={<AdminSolicitudesPage />} />
                  </Route>
                  <Route element={<RequirePermiso recurso="pagos" accion="verificar" />}>
                    <Route path="/admin/pagos" element={<AdminPagosPage />} />
                  </Route>
                  <Route element={<RequirePermiso recurso="causas" accion="crud" />}>
                    <Route path="/admin/causas" element={<AdminCausasPage />} />
                  </Route>
                  <Route element={<RequirePermiso recurso="usuarios" accion="leer" />}>
                    <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
                  </Route>
                  <Route
                    element={
                      <RequirePermiso
                        anyOf={[
                          ['roles', 'administrar'],
                          ['permisos', 'administrar'],
                        ]}
                      />
                    }
                  >
                    <Route path="/admin/roles" element={<AdminRolesPage />} />
                  </Route>
                  <Route element={<RequirePermiso recurso="plantillas" accion="administrar" />}>
                    <Route path="/admin/plantillas" element={<AdminPlantillasPage />} />
                  </Route>
                  <Route element={<RequirePermiso recurso="reportes" accion="leer" />}>
                    <Route path="/admin/reportes" element={<AdminReportesPage />} />
                    <Route path="/admin/auditoria" element={<AdminAuditoriaPage />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<AdaptiveLayout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
