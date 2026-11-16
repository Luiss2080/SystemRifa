import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';

export function RequireAuth({ children }) {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return null;
  }

  if (!autenticado) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to="/login" state={{ from: returnTo }} replace />;
  }

  return children || <Outlet />;
}

