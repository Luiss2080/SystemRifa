import { Link } from 'react-router-dom';
import { Home, ShieldAlert, User } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function ForbiddenPage() {
  return (
    <div className="my-auto mx-auto flex w-full max-w-lg items-center justify-center py-8">
      <div className="w-full overflow-hidden rounded-3xl border border-rose-200/80 bg-white/95 text-center shadow-xl backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600" />
        <div className="p-7 sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/80 shadow-xs">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
            Error 403 · Acceso restringido
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            No tienes permisos aquí
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Esta sección requiere privilegios específicos de rol o permisos RBAC que tu cuenta no
            tiene asignados actualmente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button variant="primary">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
            <Link to="/perfil">
              <Button variant="secondary">
                <User className="h-4 w-4" />
                Mi perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
