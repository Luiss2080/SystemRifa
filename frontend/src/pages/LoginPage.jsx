import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { resolverAccesoRol } from '../features/auth/roleAccess.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { BrandMark } from '../components/ui/BrandLogo.jsx';
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
      const perms = me?.permisos || [];
      const esAdminMe = roles.includes('ADMINISTRADOR');
      const tienePermMe = (recurso, accion) => esAdminMe || perms.includes(`${recurso}:${accion}`);
      const { homeDestino } = resolverAccesoRol({
        autenticado: true,
        esAdmin: esAdminMe,
        esOrganizador: roles.includes('ORGANIZADOR'),
        tienePermiso: tienePermMe,
        tieneAlgunPermiso: (lista) => lista.some(([r, a]) => tienePermMe(r, a)),
      });
      const destinoFinal = fromRuta && fromRuta !== '/' ? fromRuta : homeDestino;
      navigate(destinoFinal, { replace: true });
    } catch (err) {
      const apiErr = extraerErrorApi(err);
      setErrorMsg(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-auto mx-auto w-full max-w-5xl py-4 sm:py-6">
      <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5 lg:grid-cols-12">
        {/* Columna izquierda informativa con fondo esmeralda profundo y branding premium */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-emerald-950/20 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-6 text-white sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-emerald-900/40">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-2xl" />

          <div className="relative flex flex-1 flex-col justify-center space-y-6">
            <div className="text-center">
              <div className="mb-3.5 flex justify-center">
                <div className="rounded-2xl bg-white/10 p-2.5 shadow-inner ring-1 ring-white/20 backdrop-blur-md">
                  <BrandMark size="xl" />
                </div>
              </div>
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300 ring-1 ring-amber-300/30 backdrop-blur-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                Portal Rifas Solidarias
              </span>
              <h1 className="mt-3.5 text-2xl font-black tracking-tight text-white sm:text-[28px]">
                Bienvenido de vuelta
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-emerald-100/80 sm:text-sm">
                Gestiona tus números reservados, pagos y campañas solidarias en tiempo real.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-5 text-xs">
              <div className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-sm backdrop-blur-sm transition hover:border-emerald-400/40 hover:bg-white/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-extrabold text-white">Sesiones cifradas por rol</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-100/70">
                    Tokens rotativos y control granular de permisos sin exponer datos privados.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-sm backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-white/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-extrabold text-white">Reservas en tiempo real</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-100/70">
                    Bloqueo temporal de 15 min por ticket mientras completas tu comprobante.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6 border-t border-white/10 pt-4 text-center text-xs text-emerald-100/70">
            ¿Solo quieres explorar?{' '}
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-extrabold text-amber-300 transition hover:text-amber-200 hover:underline"
            >
              Ver catálogo público
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Columna derecha: Formulario */}
        <section className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-950/20 ring-4 ring-emerald-50">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Iniciar sesión
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Introduce tus credenciales o despliega una cuenta de prueba por rol.
              </p>
            </div>

            {/* Desplegable compacto para autocompletar por rol (solo DEV) */}
            {perfilesDemo.length > 0 && (
              <div ref={dropdownRef} className="relative mb-5">
                <button
                  type="button"
                  onClick={() => setMenuDemoAbierto((v) => !v)}
                  aria-expanded={menuDemoAbierto}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl border border-amber-200/90 bg-amber-50/60 px-3.5 py-2.5 text-left text-xs font-bold text-amber-950 transition hover:border-amber-300 hover:bg-amber-100/70 cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
                    {perfilSeleccionado ? (
                      <span>
                        Rol cargado:{' '}
                        <strong className="text-amber-900">{perfilSeleccionado.titulo}</strong>
                      </span>
                    ) : (
                      <span>Autocompletar cuenta de prueba por rol...</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-amber-700 transition-transform ${
                      menuDemoAbierto ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {menuDemoAbierto && (
                  <div className="animate-modal-in absolute right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-amber-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
                    {perfilesDemo.map((p) => {
                      const Icon = p.icon;
                      const seleccionado = perfilActivo === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => autocompletarPerfil(p)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                            seleccionado ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50'
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
                          {seleccionado && <Check className="h-4 w-4 shrink-0 text-amber-600" />}
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
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                icon={Mail}
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
                icon={Lock}
                autoComplete="current-password"
                required
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPerfilActivo(null);
                }}
              />

              <Button
                type="submit"
                className="mt-3 w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold shadow-lg shadow-emerald-700/25 transition duration-200 hover:-translate-y-0.5 cursor-pointer"
                size="lg"
                loading={loading}
              >
                Ingresar al sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
              ¿Aún no tienes cuenta?{' '}
              <Link
                to="/registro"
                state={{ from: destinoRegistro }}
                className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Regístrate gratis aquí
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
