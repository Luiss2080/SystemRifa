import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, HeartHandshake } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="my-auto mx-auto flex w-full max-w-lg items-center justify-center py-8">
      <div className="w-full overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/95 text-center shadow-xl backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />
        <div className="p-7 sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 shadow-xs">
            <Compass className="h-8 w-8" />
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            Error 404 · Ruta no disponible
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            Página no encontrada
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            La dirección que intentas abrir no existe, fue movida o la campaña ya no está disponible
            en este enlace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button variant="primary">
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
              </Button>
            </Link>
            <Link to="/causas">
              <Button variant="secondary">
                <HeartHandshake className="h-4 w-4" />
                Ver causas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
