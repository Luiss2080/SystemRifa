import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { PublicLayout, UserLayout } from './layouts/Layouts.jsx';
import { RequireAuth } from './routes/RequireAuth.jsx';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<CatalogoPage />} />
                <Route path="/causas" element={<CausasPublicPage />} />
                <Route path="/rifas/:id" element={<RifaDetallePage />} />
                <Route path="/rifas/:id/resultado" element={<ResultadoPublicoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<UserLayout />}>
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/mis-tickets" element={<MisTicketsPage />} />
                  <Route path="/mis-pagos" element={<MisPagosPage />} />
                  <Route path="/notificaciones" element={<NotificacionesPage />} />
                </Route>
              </Route>

              <Route element={<PublicLayout />}>
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
