import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { FullPageSpinner } from '../components/ui/Feedback.jsx';

export function RequirePermiso({ recurso, accion, anyOf, children }) {
  const { autenticado, cargando, tienePermiso, tieneAlgunPermiso } = useAuth();

  if (cargando) {
    return <FullPageSpinner message="Verificando permisos..." />;
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

