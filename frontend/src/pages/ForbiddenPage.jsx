import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-2xl bg-rose-50 p-4 text-rose-600">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Acceso denegado (403)</h1>
      <p className="mt-2 text-sm text-slate-600">
        No tienes los permisos necesarios para ver esta sección o realizar esta acción.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button variant="primary">Ir al inicio</Button>
        </Link>
        <Link to="/perfil">
          <Button variant="secondary">Mi perfil</Button>
        </Link>
      </div>
    </div>
  );
}
