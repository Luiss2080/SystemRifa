import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { FullPageSpinner } from '../components/ui/Feedback.jsx';

export function RequireAuth({ children }) {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <FullPageSpinner message="Verificando sesión..." />;
  }

  if (!autenticado) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to="/login" state={{ from: returnTo }} replace />;
  }

  return children || <Outlet />;
}
