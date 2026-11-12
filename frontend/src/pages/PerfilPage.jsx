import { useEffect, useState } from 'react';
import { KeyRound, User } from 'lucide-react';
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
    if (passwords.passwordNueva !== passwords.confirmarPassword) {
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
          <p className="text-sm text-slate-500">{usuario?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Badge key={r} color={r === 'ADMINISTRADOR' ? 'indigo' : r === 'ORGANIZADOR' ? 'sky' : 'emerald'}>
              {r}
            </Badge>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900">Datos personales</h2>
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
              label="Alias"
              required
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <KeyRound className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-slate-900">Cambiar contraseña</h2>
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
              helperText="Mínimo 8 caracteres, letra y número"
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
          <div className="flex justify-end">
            <Button type="submit" variant="amber" loading={savingPassword}>
              Actualizar contraseña
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

