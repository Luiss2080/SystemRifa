import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Bell,
  CheckCircle2,
  Circle,
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../utils/apiError.js';
import { BrandMark } from '../components/ui/BrandLogo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export function RegistroPage() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [form, setForm] = useState({
    alias: '',
    email: '',
    telefono: '',
    nombres: '',
    apellidos: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const destino = location.state?.from || '/';

  const tieneLargoMinimo = form.password.length >= 8;
  const tieneLetra = /[A-Za-z]/.test(form.password);
  const tieneNumero = /\d/.test(form.password);
  const passwordValida = tieneLargoMinimo && tieneLetra && tieneNumero;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!passwordValida) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }

    setLoading(true);
    try {
      await registro({
        alias: form.alias.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() ? form.telefono.trim() : null,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        password: form.password,
      });
      toast.success('Cuenta creada', 'Ya puedes iniciar sesión con tu correo y contraseña.');
      navigate('/login', { state: { from: destino }, replace: true });
    } catch (err) {
      const apiErr = extraerErrorApi(err);
      setErrorMsg(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  const reglas = [
    { ok: tieneLargoMinimo, label: 'Mínimo 8 caracteres' },
    { ok: tieneLetra, label: 'Al menos una letra' },
    { ok: tieneNumero, label: 'Al menos un número' },
  ];
  const puntajePassword = [tieneLargoMinimo, tieneLetra, tieneNumero].filter(Boolean).length;
  const fuerzaTexto =
    !form.password
      ? 'Sin definir'
      : puntajePassword === 3 && form.password.length >= 12
      ? 'Muy segura'
      : puntajePassword === 3
      ? 'Segura'
      : puntajePassword === 2
      ? 'Media'
      : 'Débil';

  return (
    <div className="my-auto mx-auto w-full max-w-4xl py-2 sm:py-4">
      <div className="grid w-full overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 lg:grid-cols-12">
        {/* Columna izquierda informativa compacta con fondo esmeralda profundo y branding premium */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-emerald-950/20 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-5 sm:p-6 text-white lg:col-span-5 lg:border-b-0 lg:border-r lg:border-emerald-900/40">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative flex flex-1 flex-col justify-center space-y-4">
            <div className="text-center">
              <div className="mb-2.5 flex justify-center">
                <div className="rounded-xl bg-white/10 p-2 shadow-inner ring-1 ring-white/20 backdrop-blur-md">
                  <BrandMark size="lg" />
                </div>
              </div>
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 ring-1 ring-amber-300/30 backdrop-blur-xs">
                <HeartHandshake className="h-3 w-3 text-amber-400" />
                Únete a Rifas Solidarias
              </span>
              <h1 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Crea tu cuenta en segundos
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                Elige tus boletos en tiempo real o propón rifas benéficas.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
              <div className="group flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xs backdrop-blur-sm transition hover:border-emerald-400/40 hover:bg-white/10">
                <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40">
                  <Ticket className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-extrabold text-xs text-white">Reserva de 15 min</p>
                  <p className="text-[10.5px] leading-tight text-emerald-100/70">
                    Bloqueo temporal exclusivo por ticket.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xs backdrop-blur-sm transition hover:border-teal-400/40 hover:bg-white/10">
                <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/40">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-extrabold text-xs text-white">Alias público protegido</p>
                  <p className="text-[10.5px] leading-tight text-emerald-100/70">
                    Tu nombre se mantiene privado en sorteos.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xs backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-white/10">
                <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-extrabold text-xs text-white">Alertas automáticas</p>
                  <p className="text-[10.5px] leading-tight text-emerald-100/70">
                    Notificaciones en vivo sobre pagos y sorteos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-4 border-t border-white/10 pt-3 text-center text-xs text-emerald-100/70">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              state={{ from: destino }}
              className="inline-flex items-center gap-1 font-extrabold text-amber-300 transition hover:text-amber-200 hover:underline"
            >
              Inicia sesión
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Columna derecha compacta: Formulario */}
        <section className="flex flex-col justify-center p-5 sm:p-6 lg:col-span-7">
          <div className="mb-3 text-center">
            <div className="mx-auto mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              Crear cuenta
            </h2>
            <p className="text-[11px] text-slate-500">
              Completa tus datos para habilitar tu acceso a la plataforma
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input
                  label="Nombres"
                  name="nombres"
                  icon={User}
                  required
                  minLength={2}
                  placeholder="Ej. Ana María"
                  value={form.nombres}
                  onChange={handleChange}
                />
                <Input
                  label="Apellidos"
                  name="apellidos"
                  icon={User}
                  required
                  minLength={2}
                  placeholder="Ej. Rojas Pérez"
                  value={form.apellidos}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input
                  label="Alias público"
                  name="alias"
                  icon={AtSign}
                  required
                  minLength={3}
                  placeholder="ana_solidaria"
                  helperText="Visible en sorteos públicos"
                  value={form.alias}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono (opcional)"
                  name="telefono"
                  icon={Phone}
                  placeholder="Ej. 70012345"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input
                  label="Correo electrónico"
                  type="email"
                  name="email"
                  icon={Mail}
                  autoComplete="email"
                  required
                  placeholder="nombre@correo.com"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  icon={Lock}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mín. 8 caracteres"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {/* Indicador de seguridad y reglas compacto */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-semibold text-slate-500">Fuerza:</span>
                    <div className="flex w-14 gap-1">
                      {[1, 2, 3].map((nivel) => (
                        <span
                          key={nivel}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            puntajePassword >= nivel
                              ? puntajePassword === 3
                                ? 'bg-emerald-500'
                                : puntajePassword === 2
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[10.5px] font-bold ${
                        puntajePassword === 3
                          ? 'text-emerald-700'
                          : puntajePassword === 2
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {fuerzaTexto}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10.5px]">
                    {reglas.map((r) => (
                      <span
                        key={r.label}
                        className={`inline-flex items-center gap-1 ${
                          r.ok ? 'font-semibold text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {r.ok ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Circle className="h-3 w-3 text-slate-300" />
                        )}
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold shadow-md shadow-emerald-700/20 py-2.5 text-xs sm:text-sm transition duration-200 hover:-translate-y-0.5 cursor-pointer"
              loading={loading}
            >
              Crear mi cuenta solidaria
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-1 text-center text-xs text-slate-500 lg:hidden">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                state={{ from: destino }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
