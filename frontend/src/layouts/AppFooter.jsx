import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { BrandLogo } from '../components/ui/BrandLogo.jsx';

export function AppFooter() {
  const { isAuthenticated, tieneAlgunPermiso, esAdmin } = useAuth();

  const puedeVerOrganizador =
    tieneAlgunPermiso([
      ['rifas', 'leer'],
      ['rifas', 'administrar'],
      ['premios', 'crud'],
      ['sorteos', 'realizar'],
    ]) || esAdmin;

  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-12 border-t border-slate-800/80 bg-slate-950/95 text-slate-300 backdrop-blur-md">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />

      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Identidad y propósito */}
          <div className="space-y-4 lg:col-span-5">
            <Link to="/" className="inline-flex">
              <BrandLogo
                dark
                size="lg"
                showSubtitle
                subtitle="Transparencia y apoyo social en tiempo real"
              />
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Plataforma auditada para organizar, verificar y participar en campañas solidarias con
              reservas atómicas, validación de pagos y sorteos públicos trazables.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pagos verificados
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                <Lock className="h-3.5 w-3.5" />
                Auditoría inmutable
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Zona horaria La Paz
              </span>
            </div>
          </div>

          {/* Navegación pública */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                >
                  <Ticket className="h-3.5 w-3.5 text-emerald-500" />
                  Catálogo de rifas
                </Link>
              </li>
              <li>
                <Link
                  to="/causas"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                >
                  <HeartHandshake className="h-3.5 w-3.5 text-rose-400" />
                  Causas solidarias
                </Link>
              </li>
              <li>
                <Link
                  to="/#como-funciona"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link
                  to="/solicitudes/nueva"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                >
                  <FilePlus2 className="h-3.5 w-3.5 text-sky-400" />
                  Organizar una rifa
                </Link>
              </li>
            </ul>
          </div>

          {/* Mi cuenta / Participación */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAuthenticated ? 'Mi espacio' : 'Participación'}
            </h3>
            <ul className="space-y-2 text-sm">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/mis-tickets"
                      className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                    >
                      <Ticket className="h-3.5 w-3.5 text-emerald-500" />
                      Mis tickets
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mis-pagos"
                      className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                      Mis pagos
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/notificaciones"
                      className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                    >
                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                      Notificaciones
                    </Link>
                  </li>
                  {puedeVerOrganizador && (
                    <li>
                      <Link
                        to="/organizador/rifas"
                        className="inline-flex items-center gap-2 text-slate-300 transition hover:text-emerald-400"
                      >
                        <ClipboardList className="h-3.5 w-3.5 text-indigo-400" />
                        Panel de gestión
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-slate-300 transition hover:text-emerald-400">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to="/registro" className="text-slate-300 transition hover:text-emerald-400">
                      Crear cuenta gratis
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Bloque de garantías */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Garantía del sistema
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Reserva temporal de 15 min sin colisiones de números.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Sorteos exclusivos sobre tickets confirmados como vendidos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Privacidad protegida en resultados públicos (solo alias).</span>
                </li>
              </ul>
              <Link
                to="/"
                className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              >
                Participar ahora
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-5 text-xs text-slate-500">
          <p>© {year} Sistema de Rifas Solidarias · Todos los sorteos quedan auditados.</p>
          <p className="flex items-center gap-2">
            <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400 ring-1 ring-slate-800">
              RBAC Granular
            </span>
            <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400 ring-1 ring-slate-800">
              ACID MySQL
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

