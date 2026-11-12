import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../utils/apiError.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';

function obtenerPerfilesDemoDev() {
  if (!import.meta.env.DEV) return [];

  const candidatos = [
    {
      id: 'admin',
      rol: 'ADMINISTRADOR',
      titulo: 'Administrador',
      detalle: 'Aprueba solicitudes, verifica pagos, gestiona roles y reportes.',
      email: import.meta.env.VITE_DEMO_ADMIN_EMAIL,
      password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      activeRing: 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200',
      icon: ShieldCheck,
    },
    {
      id: 'organizador',
      rol: 'ORGANIZADOR',
      titulo: 'Organizador',
      detalle: 'Solicita rifas, carga premios y ejecuta sorteos públicos.',
      email: import.meta.env.VITE_DEMO_ORG_EMAIL,
      password: import.meta.env.VITE_DEMO_ORG_PASSWORD,
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      activeRing: 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200',
      icon: Sparkles,
    },
    {
      id: 'participante1',
      rol: 'PARTICIPANTE',
      titulo: 'Participante 1 (Ana)',
      detalle: 'Reserva números, registra pagos y sigue sus tickets.',
      email: import.meta.env.VITE_DEMO_PART1_EMAIL,
      password: import.meta.env.VITE_DEMO_PART1_PASSWORD,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      activeRing: 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200',
      icon: UserCheck,
    },
    {
      id: 'participante2',
      rol: 'PARTICIPANTE',
      titulo: 'Participante 2 (Luis)',
      detalle: 'Cuenta participante adicional para pruebas de concurrencia.',
      email: import.meta.env.VITE_DEMO_PART2_EMAIL,
      password: import.meta.env.VITE_DEMO_PART2_PASSWORD,
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      activeRing: 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-200',
      icon: Users,
    },
  ];

  return candidatos.filter((c) => Boolean(c.email && c.password));
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfilActivo, setPerfilActivo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const destino = location.state?.from || '/';
  const perfilesDemo = useMemo(() => obtenerPerfilesDemoDev(), []);

  function autocompletarPerfil(perfil) {
    setEmail(perfil.email);
    setPassword(perfil.password);
    setPerfilActivo(perfil.id);
    setErrorMsg('');
    toast.info(`Credenciales cargadas (${perfil.titulo})`, 'Pulsa "Ingresar" para acceder.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Bienvenido', 'Iniciaste sesión correctamente.');
      navigate(destino, { replace: true });
    } catch (err) {
      const apiErr = extraerErrorApi(err);
      setErrorMsg(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center py-6">
      <div className="grid w-full gap-6 lg:grid-cols-12">
        {/* Columna izquierda: Acceso rápido por rol (solo dev) o garantías del portal */}
        <section className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-lg sm:p-8 lg:col-span-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Ticket className="h-3.5 w-3.5" />
              Portal de acceso Rifas Solidarias
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bienvenido de vuelta
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Accede a tus boletos reservados, comprobantes de pago, campañas aprobadas y panel
              administrativo según tu rol.
            </p>
          </div>

          {perfilesDemo.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <KeyRound className="h-3.5 w-3.5" />
                  Autocompletar usuario por rol (Entorno local)
                </p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200">
                  1 clic
                </span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {perfilesDemo.map((p) => {
                  const Icon = p.icon;
                  const seleccionado = perfilActivo === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => autocompletarPerfil(p)}
                      className={`group flex flex-col justify-between rounded-2xl border p-3 text-left transition cursor-pointer ${
                        seleccionado
                          ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/50'
                          : 'border-white/15 bg-white/5 hover:border-emerald-400/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${p.badgeClass}`}
                          >
                            <Icon className="h-3 w-3" />
                            {p.rol}
                          </span>
                          {seleccionado && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-white">{p.titulo}</p>
                        <p className="font-mono text-[11px] text-emerald-200">{p.email}</p>
                        <p className="text-[11px] leading-snug text-slate-300">{p.detalle}</p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-semibold text-emerald-300">
                        <span>{seleccionado ? 'Cargado en el formulario' : 'Autocompletar'}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/5 p-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  Sesiones firmadas con rotación de refresh tokens y control granular de permisos por
                  rol.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/5 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <span>
                  Todas tus reservas y pagos quedan respaldados y trazados en tu historial privado.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Columna derecha: Formulario de inicio de sesión */}
        <section className="flex flex-col justify-center rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md sm:p-8 lg:col-span-6">
          <div className="mb-6">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa tus credenciales o elige un perfil rápido en desarrollo local.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPerfilActivo(null);
              }}
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPerfilActivo(null);
              }}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Ingresar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Tus tickets, pagos y comprobantes quedan protegidos en tu cuenta.</span>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            ¿Aún no tienes cuenta?{' '}
            <Link
              to="/registro"
              state={{ from: destino }}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Regístrate gratis aquí
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
