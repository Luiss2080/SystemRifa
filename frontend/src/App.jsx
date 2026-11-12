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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PlaceholderCatalogo() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Rifas Solidarias</h1>
      <p className="mt-2 text-sm text-slate-600">Catálogo en construcción (Paso 12).</p>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<PlaceholderCatalogo />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<UserLayout />}>
                  <Route path="/perfil" element={<PerfilPage />} />
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
