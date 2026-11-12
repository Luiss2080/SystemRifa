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
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-5xl items-center py-1">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-md lg:grid-cols-12">
        {/* Columna izquierda: Beneficios y privacidad */}
        <section className="flex flex-col justify-between bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 p-5 text-white sm:p-6 lg:col-span-5">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <HeartHandshake className="h-3.5 w-3.5" />
              Únete a Rifas Solidarias
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Crea tu cuenta en segundos
            </h1>
            <p className="text-sm leading-relaxed text-emerald-50">
              Elige tus números favoritos en tiempo real o propón rifas para causas verificadas.
            </p>
          </div>

          <div className="my-4 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              <div>
                <p className="font-bold">Reservas instantáneas de 15 minutos</p>
                <p className="text-emerald-50/90">Bloquea tus números sin colisiones mientras pagas.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              <div>
                <p className="font-bold">Privacidad protegida por alias</p>
                <p className="text-emerald-50/90">Solo tu alias público aparece en los resultados.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              <div>
                <p className="font-bold">Avisos automáticos</p>
                <p className="text-emerald-50/90">Confirmación de pagos y sorteos al instante.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/15 pt-3 text-xs text-emerald-50">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              state={{ from: destino }}
              className="inline-flex items-center gap-1 font-bold text-white underline-offset-2 hover:underline"
            >
              Inicia sesión aquí
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Columna derecha: Formulario de registro */}
        <section className="flex flex-col justify-center p-5 sm:p-6 lg:col-span-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Datos de registro</h2>
              <p className="text-xs text-slate-500">Completa tus datos para habilitar tu cuenta</p>
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
