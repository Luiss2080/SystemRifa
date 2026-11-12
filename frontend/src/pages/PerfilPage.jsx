import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Circle, KeyRound, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { cambiarMiPasswordRequest, updateMiPerfilRequest } from '../features/auth/authApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export function PerfilPage() {
  const { usuario, roles, recargarPerfil } = useAuth();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    if (location.hash === '#seguridad') {
      const el = document.getElementById('seguridad');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.hash]);

  const [perfil, setPerfil] = useState({
    alias: '',
    nombres: '',
    apellidos: '',
    telefono: '',
  });
  const [savingPerfil, setSavingPerfil] = useState(false);

  const [passwords, setPasswords] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (usuario) {
      setPerfil({
        alias: usuario.alias || '',
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        telefono: usuario.telefono || '',
      });
    }
  }, [usuario]);

  const tieneLargoMinimo = passwords.passwordNueva.length >= 8;
  const tieneLetra = /[A-Za-z]/.test(passwords.passwordNueva);
  const tieneNumero = /\d/.test(passwords.passwordNueva);
  const coinciden =
    Boolean(passwords.passwordNueva) && passwords.passwordNueva === passwords.confirmarPassword;

  async function handleGuardarPerfil(e) {
    e.preventDefault();
    setSavingPerfil(true);
    try {
      await updateMiPerfilRequest({
        alias: perfil.alias.trim(),
        nombres: perfil.nombres.trim(),
        apellidos: perfil.apellidos.trim(),
        telefono: perfil.telefono.trim() ? perfil.telefono.trim() : null,
      });
      await recargarPerfil();
      toast.success('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch (err) {
      toast.error('No se pudo actualizar', extraerErrorApi(err).message);
    } finally {
      setSavingPerfil(false);
    }
  }

  async function handleCambiarPassword(e) {
    e.preventDefault();
    if (!tieneLargoMinimo || !tieneLetra || !tieneNumero) {
      toast.error(
        'Contraseña débil',
        'La nueva contraseña debe tener al menos 8 caracteres, una letra y un número.'
      );
      return;
    }
    if (!coinciden) {
      toast.error('Error', 'Las nuevas contraseñas no coinciden.');
      return;
    }
    setSavingPassword(true);
    try {
      await cambiarMiPasswordRequest({
        passwordActual: passwords.passwordActual,
        passwordNueva: passwords.passwordNueva,
      });
      setPasswords({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
      toast.success('Contraseña actualizada', 'Tu contraseña cambió correctamente.');
    } catch (err) {
      toast.error('Error al cambiar contraseña', extraerErrorApi(err).message);
    } finally {
      setSavingPassword(false);
    }
  }

  const iniciales = `${(usuario?.nombres || '')[0] || ''}${(usuario?.apellidos || '')[0] || ''}`.toUpperCase() || 'RS';

  const reglasPassword = [
    { ok: tieneLargoMinimo, label: 'Mínimo 8 caracteres' },
    { ok: tieneLetra, label: 'Una letra' },
    { ok: tieneNumero, label: 'Un número' },
    { ok: coinciden, label: 'Coinciden' },
  ];

  return (
    <div className="mx-auto my-auto w-full max-w-5xl space-y-5 py-2">
      {/* Cabecera superior con franja superior limpia (sin traslape de texto oscuro) */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-md">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-slate-800" />
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-extrabold text-white shadow-md ring-4 ring-emerald-50">
              {iniciales}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                {usuario?.nombres} {usuario?.apellidos}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="font-semibold text-emerald-700">@{usuario?.alias}</span> ·{' '}
                {usuario?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {roles.map((r) => (
              <Badge key={r} color={r === 'ADMINISTRADOR' ? 'slate' : r === 'ORGANIZADOR' ? 'teal' : 'emerald'}>
                {r}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Doble columna simétrica de igual altura: Datos personales + Cambiar contraseña */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-md backdrop-blur-md">
          <div className="mb-3.5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <User className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Datos personales</h2>
              <p className="text-justify text-xs text-slate-500">
                Actualiza tu identidad pública y datos de contacto visibles solo cuando corresponda.
              </p>
            </div>
          </div>

          <form onSubmit={handleGuardarPerfil} className="flex flex-1 flex-col justify-between space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Input
                label="Nombres"
                required
                value={perfil.nombres}
                onChange={(e) => setPerfil((p) => ({ ...p, nombres: e.target.value }))}
              />
              <Input
                label="Apellidos"
                required
                value={perfil.apellidos}
                onChange={(e) => setPerfil((p) => ({ ...p, apellidos: e.target.value }))}
              />
              <Input
                label="Alias público"
                required
                helperText="Visible en resultados de sorteos"
                value={perfil.alias}
                onChange={(e) => setPerfil((p) => ({ ...p, alias: e.target.value }))}
              />
              <Input
                label="Teléfono"
                value={perfil.telefono}
                onChange={(e) => setPerfil((p) => ({ ...p, telefono: e.target.value }))}
              />
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button type="submit" loading={savingPerfil} className="w-full sm:w-auto">
                Guardar cambios
              </Button>
            </div>
          </form>
        </section>

        <section
          id="seguridad"
          className="flex flex-col rounded-3xl border border-amber-200/80 bg-white/90 p-6 shadow-md backdrop-blur-md scroll-mt-24"
        >
          <div className="mb-3.5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cambiar contraseña</h2>
              <p className="text-justify text-xs text-slate-500">
                Protege tu cuenta renovando tu clave; las sesiones activas previas se cerrarán.
              </p>
            </div>
          </div>

          <form onSubmit={handleCambiarPassword} className="flex flex-1 flex-col justify-between space-y-3.5">
            <div className="space-y-3">
              <Input
                label="Contraseña actual"
                type="password"
                required
                value={passwords.passwordActual}
                onChange={(e) => setPasswords((p) => ({ ...p, passwordActual: e.target.value }))}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  required
                  minLength={8}
                  value={passwords.passwordNueva}
                  onChange={(e) => setPasswords((p) => ({ ...p, passwordNueva: e.target.value }))}
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  required
                  value={passwords.confirmarPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmarPassword: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                {reglasPassword.map((r) => (
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
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button type="submit" variant="amber" loading={savingPassword} className="w-full sm:w-auto">
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
