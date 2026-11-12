import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, UserPlus } from 'lucide-react';
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
    <div className="mx-auto flex min-h-[75vh] max-w-lg items-center justify-center px-4 py-10">
      <div className="animate-modal-in w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Participa en rifas solidarias y sigue tus números en tiempo real
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
              helperText="Se muestra en sorteos públicos en lugar de tus datos privados"
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

          <Button type="submit" className="w-full" loading={loading}>
            Registrarme
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" state={{ from: destino }} className="font-semibold text-emerald-600 hover:text-emerald-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
