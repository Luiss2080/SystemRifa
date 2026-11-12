import { useEffect, useState } from 'react';
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
  const toast = useToast();

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna izquierda: Tarjeta de Identidad */}
        <aside className="lg:col-span-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" />
            <div className="-mt-10 px-6 pb-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-extrabold text-white ring-4 ring-white shadow-md">
                {iniciales}
              </div>
              <h1 className="mt-3 text-xl font-extrabold text-slate-900">
                {usuario?.nombres} {usuario?.apellidos}
              </h1>
              <p className="text-sm font-medium text-indigo-600">@{usuario?.alias}</p>
              <p className="mt-1 text-xs text-slate-500">{usuario?.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5 border-t border-slate-100 pt-4">
                {roles.map((r) => (
                  <Badge key={r} color={r === 'ADMINISTRADOR' ? 'indigo' : r === 'ORGANIZADOR' ? 'sky' : 'emerald'}>
                    {r}
                  </Badge>
                ))}
              </div>

              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-left text-xs leading-relaxed text-slate-500">
                Tu <strong>alias público</strong> se muestra cuando ganas un sorteo, protegiendo tu correo y teléfono ante el público.
              </p>
            </div>
          </div>
        </aside>

        {/* Columna derecha: Edición y Bóveda de Seguridad */}
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Datos personales</h2>
            </div>

            <form onSubmit={handleGuardarPerfil} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="flex justify-end">
                <Button type="submit" loading={savingPerfil}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-amber-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Bóveda de contraseña</h2>
            </div>

            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                required
                value={passwords.passwordActual}
                onChange={(e) => setPasswords((p) => ({ ...p, passwordActual: e.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs">
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
              <div className="flex justify-end">
                <Button type="submit" variant="amber" loading={savingPassword}>
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
