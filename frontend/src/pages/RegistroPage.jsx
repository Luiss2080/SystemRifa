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
    <div className="my-auto mx-auto w-full max-w-5xl py-2">
      <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-md lg:grid-cols-12">
        {/* Columna izquierda informativa (tema claro comercial) */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/90 p-6 text-slate-900 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-1 flex-col justify-center space-y-5">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <BrandMark size="xl" />
              </div>
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                <HeartHandshake className="h-3.5 w-3.5 text-emerald-700" />
                Únete a Rifas Solidarias
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                Crea tu cuenta en segundos
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Elige tus números favoritos en tiempo real o propón rifas para causas verificadas.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-slate-200/80 pt-4 text-xs">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Ticket className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Reservas instantáneas de 15 min</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    Bloquea tus números disponibles mientras envías tu comprobante.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Privacidad con alias público</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    Tu nombre y contacto se mantienen privados en tableros y sorteos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Avisos automáticos</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    Recibe alertas sobre validación de pagos y resultados del sorteo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              state={{ from: destino }}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline"
            >
              Inicia sesión
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Columna derecha: Formulario */}
        <section className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Crear cuenta
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Completa tus datos para habilitar tu acceso a la plataforma
            </p>
          </div>

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
            <div className="space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Identidad y contacto
              </p>
              <div className="grid gap-3.5 sm:grid-cols-2">
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

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Input
                  label="Alias público"
                  name="alias"
                  icon={AtSign}
                  required
                  minLength={3}
                  placeholder="ana_solidaria"
                  helperText="Visible en sorteos en lugar de tu nombre"
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
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Credenciales de acceso
              </p>

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

              <div className="space-y-2">
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  icon={Lock}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  labelRight={
                    form.password ? (
                      <span
                        className={`text-[11px] font-bold ${
                          puntajePassword === 3
                            ? 'text-emerald-700'
                            : puntajePassword === 2
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        Seguridad: {fuerzaTexto}
                      </span>
                    ) : null
                  }
                  value={form.password}
                  onChange={handleChange}
                />

                {form.password && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((nivel) => (
                      <span
                        key={nivel}
                        className={`h-1.5 rounded-full transition-colors ${
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
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2 text-xs">
                  {reglas.map((r) => (
                    <span
                      key={r.label}
                      className={`inline-flex items-center gap-1.5 transition ${
                        r.ok ? 'font-semibold text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {r.ok ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-slate-300" />
                      )}
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full shadow-md shadow-emerald-600/20" size="lg" loading={loading}>
              Crear mi cuenta solidaria
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
