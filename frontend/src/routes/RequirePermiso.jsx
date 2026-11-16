import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';

export function RequirePermiso({ recurso, accion, anyOf, children }) {
  const { autenticado, cargando, tienePermiso, tieneAlgunPermiso } = useAuth();

  if (cargando) {
    return null;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  const permitido = anyOf
    ? tieneAlgunPermiso(anyOf)
    : tienePermiso(recurso, accion);

  if (!permitido) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
}

