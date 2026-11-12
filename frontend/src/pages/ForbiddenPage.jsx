import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { Button } from '../components/ui/Button.jsx';

export function ForbiddenPage() {
  const { autenticado, esAdmin, esOrganizador, tienePermiso, tieneAlgunPermiso } = useAuth();
  const { homeDestino } = resolverAccesoRol({
    autenticado,
    esAdmin,
    esOrganizador,
    tienePermiso,
    tieneAlgunPermiso,
  });

  return (
    <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center justify-center rounded-[28px] border border-slate-200/80 bg-white/95 p-8 text-center shadow-xl ring-1 ring-slate-900/5 backdrop-blur-md">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/80">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
        Error 403
      </span>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        Acceso denegado
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        No tienes los permisos necesarios para ver esta sección o realizar esta acción.
      </p>
      <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link to={homeDestino}>
          <Button variant="primary" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            {autenticado ? 'Ir a mi panel' : 'Ir al inicio'}
          </Button>
        </Link>
        {autenticado && (
          <Link to="/perfil">
            <Button variant="secondary" className="w-full sm:w-auto">
              <User className="h-4 w-4" />
              Mi perfil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

