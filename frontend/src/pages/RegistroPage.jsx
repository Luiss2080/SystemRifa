import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Circle,
  HeartHandshake,
  ShieldCheck,
  Ticket,
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

  return (
    <div className="my-auto mx-auto w-full max-w-6xl py-2">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md lg:grid-cols-12">
        {/* Columna izquierda más compacta */}
        <section className="flex flex-col justify-center bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 p-5 text-white sm:p-6 lg:col-span-4">
          <div className="mx-auto w-full space-y-3.5">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <BrandMark size="xl" />
              </div>
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-xs">
                <HeartHandshake className="h-3.5 w-3.5" />
                Únete a Rifas Solidarias
              </span>
              <h1 className="mt-2.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                Crea tu cuenta en segundos
              </h1>
              <p className="mt-1.5 text-justify text-xs leading-relaxed text-emerald-50">
                Elige tus números favoritos en tiempo real o propón rifas para causas verificadas.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/15 pt-3 text-[11px]">
              <div className="flex items-start gap-2 rounded-xl bg-white/10 p-2.5 backdrop-blur-xs">
                <Ticket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" />
                <div className="text-justify">
                  <p className="font-bold">Reservas instantáneas de 15 min</p>
                  <p className="text-emerald-50/90">Bloquea tus números mientras pagas.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-white/10 p-2.5 backdrop-blur-xs">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" />
                <div className="text-justify">
                  <p className="font-bold">Privacidad por alias público</p>
                  <p className="text-emerald-50/90">Tus datos privados permanecen protegidos.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-white/10 p-2.5 backdrop-blur-xs">
                <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" />
                <div className="text-justify">
                  <p className="font-bold">Avisos automáticos</p>
                  <p className="text-emerald-50/90">Alertas de pagos y resultados al instante.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/15 pt-2.5 text-center text-xs text-emerald-50">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                state={{ from: destino }}
                className="inline-flex items-center gap-1 font-bold text-white underline-offset-2 hover:underline"
              >
                Inicia sesión
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Columna derecha ampliada: Formulario */}
        <section className="flex flex-col justify-center p-6 sm:p-7 lg:col-span-8">
          <div className="mb-4 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Datos de registro</h2>
              <p className="text-xs text-slate-500">
                Completa tus datos para habilitar tu cuenta solidaria
              </p>
            </div>
            <div className="mx-auto mt-2 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700 sm:mx-0 sm:mt-0">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm text-rose-700"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombres"
                name="nombres"
                required
                minLength={2}
                value={form.nombres}
                onChange={handleChange}
              />
              <Input
                label="Apellidos"
                name="apellidos"
                required
                minLength={2}
                value={form.apellidos}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Alias público"
                name="alias"
                required
                minLength={3}
                helperText="Visible en sorteos públicos en lugar de tus datos privados"
                value={form.alias}
                onChange={handleChange}
              />
              <Input
                label="Teléfono (opcional)"
                name="telefono"
                placeholder="Ej. 70012345"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
            />

            <div className="space-y-2">
              <Input
                label="Contraseña"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                {reglas.map((r) => (
                  <span
                    key={r.label}
                    className={`inline-flex items-center gap-1 transition ${
                      r.ok ? 'font-medium text-emerald-700' : 'text-slate-500'
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

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Crear mi cuenta solidaria
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
