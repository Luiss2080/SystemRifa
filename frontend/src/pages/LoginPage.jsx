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
    <div className="my-auto mx-auto w-full max-w-5xl py-2">
      <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-md lg:grid-cols-12">
        {/* Columna izquierda informativa */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white sm:p-8 lg:col-span-5">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-3">
              <BrandMark size="lg" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-white/15">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso seguro
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-[26px]">
                Bienvenido de vuelta
              </h1>
              <p className="text-sm leading-relaxed text-slate-300">
                Gestiona tus números reservados, valida pagos y administra campañas solidarias desde un solo panel.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-white/10 pt-5 text-xs text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Lock className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-white">Sesiones cifradas por rol</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                    Tokens rotativos y control granular de permisos sin exponer datos privados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-white">Reservas en tiempo real</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                    Bloqueo temporal de 15 min por ticket mientras completas tu comprobante.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
            <span>¿Solo quieres ver campañas?</span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-bold text-emerald-300 transition hover:text-emerald-200 hover:underline"
            >
              Ver catálogo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Columna derecha: Formulario */}
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Iniciar sesión
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  Introduce tus credenciales o selecciona una cuenta de prueba por rol.
                </p>
              </div>
            </div>

            {/* Desplegable compacto para autocompletar por rol (solo DEV) */}
            {perfilesDemo.length > 0 && (
              <div ref={dropdownRef} className="relative mb-5">
                <button
                  type="button"
                  onClick={() => setMenuDemoAbierto((v) => !v)}
                  aria-expanded={menuDemoAbierto}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer"
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
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      menuDemoAbierto ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {menuDemoAbierto && (
                  <div className="animate-modal-in absolute right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
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

              <Button type="submit" className="mt-2 w-full shadow-md shadow-emerald-600/20" size="lg" loading={loading}>
                Ingresar al sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
              ¿Aún no tienes cuenta?{' '}
              <Link
                to="/registro"
                state={{ from: destinoRegistro }}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
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
