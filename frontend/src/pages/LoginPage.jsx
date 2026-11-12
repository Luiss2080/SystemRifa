import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
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
      email: import.meta.env.VITE_DEMO_ADMIN_EMAIL,
      password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
      badgeClass: 'bg-indigo-100 text-indigo-800',
      icon: ShieldCheck,
    },
    {
      id: 'organizador',
      rol: 'ORGANIZADOR',
      titulo: 'Organizador',
      email: import.meta.env.VITE_DEMO_ORG_EMAIL,
      password: import.meta.env.VITE_DEMO_ORG_PASSWORD,
      badgeClass: 'bg-sky-100 text-sky-800',
      icon: Sparkles,
    },
    {
      id: 'participante1',
      rol: 'PARTICIPANTE',
      titulo: 'Participante 1 (Ana)',
      email: import.meta.env.VITE_DEMO_PART1_EMAIL,
      password: import.meta.env.VITE_DEMO_PART1_PASSWORD,
      badgeClass: 'bg-emerald-100 text-emerald-800',
      icon: UserCheck,
    },
    {
      id: 'participante2',
      rol: 'PARTICIPANTE',
      titulo: 'Participante 2 (Luis)',
      email: import.meta.env.VITE_DEMO_PART2_EMAIL,
      password: import.meta.env.VITE_DEMO_PART2_PASSWORD,
      badgeClass: 'bg-teal-100 text-teal-800',
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
  const [menuDemoAbierto, setMenuDemoAbierto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const fromRuta = location.state?.from;
  const destinoRegistro = fromRuta || '/';
  const perfilesDemo = useMemo(() => obtenerPerfilesDemoDev(), []);
  const perfilSeleccionado = perfilesDemo.find((p) => p.id === perfilActivo) || null;

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuDemoAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function autocompletarPerfil(perfil) {
    setEmail(perfil.email);
    setPassword(perfil.password);
    setPerfilActivo(perfil.id);
    setMenuDemoAbierto(false);
    setErrorMsg('');
    toast.info(`Credenciales cargadas (${perfil.titulo})`, 'Pulsa "Ingresar" para acceder.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const me = await login({ email: email.trim(), password });
      toast.success('Bienvenido', 'Iniciaste sesión correctamente.');
      const roles = me?.roles || [];
      const destinoPorRol = roles.includes('ADMINISTRADOR')
        ? '/admin/reportes'
        : roles.includes('ORGANIZADOR')
          ? '/organizador/rifas'
          : '/mis-tickets';
      navigate(fromRuta || destinoPorRol, { replace: true });
    } catch (err) {
      const apiErr = extraerErrorApi(err);
      setErrorMsg(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-auto mx-auto w-full max-w-5xl py-2">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md lg:grid-cols-12">
        {/* Columna izquierda más compacta */}
        <section className="flex flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white sm:p-6 lg:col-span-4">
          <div className="mx-auto w-full space-y-4">
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-white/15">
                <Ticket className="h-3.5 w-3.5" />
                Portal Rifas Solidarias
              </div>
              <h1 className="mt-2.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                Bienvenido de vuelta
              </h1>
              <p className="mt-2 text-justify text-xs leading-relaxed text-slate-300">
                Gestiona tus números reservados, pagos y campañas solidarias en tiempo real.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/15 pt-3.5 text-[11px] text-slate-300">
              <div className="flex items-start gap-2 rounded-xl bg-white/5 p-2.5">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="text-justify">
                  Sesiones cifradas con tokens rotativos y control de permisos por rol.
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-white/5 p-2.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                <span className="text-justify">
                  Reservas de 15 min y sorteos auditados sin exponer datos privados.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Columna derecha más amplia: Formulario + Desplegable de autocompletado */}
        <section className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-8">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-2.5 inline-flex rounded-2xl bg-emerald-100 p-2.5 text-emerald-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Iniciar sesión</h2>
              <p className="mt-1 text-xs text-slate-500">
                Introduce tus credenciales o despliega una cuenta de prueba por rol.
              </p>
            </div>

            {/* Desplegable compacto para autocompletar por rol */}
            {perfilesDemo.length > 0 && (
              <div ref={dropdownRef} className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setMenuDemoAbierto((v) => !v)}
                  aria-expanded={menuDemoAbierto}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                    {perfilSeleccionado ? (
                      <span>
                        Rol cargado:{' '}
                        <strong className="text-emerald-700">{perfilSeleccionado.titulo}</strong>
                      </span>
                    ) : (
                      <span>Autocompletar cuenta de prueba por rol...</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      menuDemoAbierto ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {menuDemoAbierto && (
                  <div className="animate-modal-in absolute right-0 left-0 z-30 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {perfilesDemo.map((p) => {
                      const Icon = p.icon;
                      const seleccionado = perfilActivo === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => autocompletarPerfil(p)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                            seleccionado ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.badgeClass}`}
                            >
                              <Icon className="h-3 w-3" />
                              {p.rol}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">{p.titulo}</p>
                              <p className="truncate font-mono text-[11px] text-slate-500">
                                {p.email}
                              </p>
                            </div>
                          </div>
                          {seleccionado && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm text-rose-700"
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
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

            <p className="mt-4 text-center text-sm text-slate-600">
              ¿Aún no tienes cuenta?{' '}
              <Link
                to="/registro"
                state={{ from: destinoRegistro }}
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Regístrate gratis aquí
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
