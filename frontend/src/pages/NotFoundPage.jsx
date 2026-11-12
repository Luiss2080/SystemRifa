import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500">
        <Compass className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Página no encontrada (404)</h1>
      <p className="mt-2 text-sm text-slate-600">
        La ruta que intentas abrir no existe o fue movida.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">Volver al catálogo de rifas</Button>
        </Link>
      </div>
    </div>
  );
}
