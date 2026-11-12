import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
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
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
        <Compass className="h-7 w-7" />
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
        Error 404
      </span>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        La ruta que intentas abrir no existe o fue movida dentro de la plataforma.
      </p>
      <div className="mt-6">
        <Link to={homeDestino}>
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" />
            {autenticado ? 'Volver a mi espacio' : 'Volver al catálogo de rifas'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

