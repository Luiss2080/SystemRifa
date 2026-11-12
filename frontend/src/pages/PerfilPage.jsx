import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AtSign,
  CheckCircle2,
  Circle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { cambiarMiPasswordRequest, updateMiPerfilRequest } from '../features/auth/authApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { PanelKpiGrid, PanelSectionHeader } from '../components/panel/PanelKit.jsx';

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

  const iniciales =
    `${(usuario?.nombres || '')[0] || ''}${(usuario?.apellidos || '')[0] || ''}`.toUpperCase() ||
    'RS';

  const reglasPassword = [
    { ok: tieneLargoMinimo, label: 'Mínimo 8 caracteres' },
    { ok: tieneLetra, label: 'Una letra' },
    { ok: tieneNumero, label: 'Un número' },
    { ok: coinciden, label: 'Coinciden' },
  ];
  const puntajePassword = [tieneLargoMinimo, tieneLetra, tieneNumero].filter(Boolean).length;
  const fuerzaTexto =
    !passwords.passwordNueva
      ? 'Sin definir'
      : puntajePassword === 3 && passwords.passwordNueva.length >= 12
      ? 'Muy segura'
      : puntajePassword === 3
      ? 'Segura'
      : puntajePassword === 2
      ? 'Media'
      : 'Débil';

  const enSeguridad = location.hash === '#seguridad';

  return (
    <div className="space-y-5">
      {/* Cabecera superior con franja de acento y resumen completo de cuenta */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />
        <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-lg font-extrabold tracking-wide text-white shadow-sm ring-4 ring-emerald-50">
              {iniciales}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {usuario?.nombres} {usuario?.apellidos}
                </h1>
                {roles.map((r) => (
                  <Badge
                    key={r}
                    color={r === 'ADMINISTRADOR' ? 'indigo' : r === 'ORGANIZADOR' ? 'teal' : 'emerald'}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
                  <AtSign className="h-3 w-3" />
                  {usuario?.alias}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                  <Mail className="h-3 w-3 text-slate-400" />
                  {usuario?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#datos-personales"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                !enSeguridad
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Datos personales
            </a>
            <a
              href="#seguridad"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                enSeguridad
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Seguridad y clave
            </a>
          </div>
        </div>
      </section>

      <PanelSectionHeader
        icon={User}
        title="Identidad de Cuenta & Seguridad"
        subtitle="Gestión de datos personales verificados y protección de acceso"
        badgeText={roles[0] || 'PARTICIPANTE'}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Alias público',
            value: `@${usuario?.alias || 'usuario'}`,
            trendText: 'Visible en sorteos y premios',
            icon: AtSign,
            accent: 'emerald',
          },
          {
            label: 'Estado de cuenta',
            value: 'Activa y verificada',
            trendText: usuario?.email || 'Correo vinculado',
            icon: ShieldCheck,
            accent: 'sky',
          },
          {
            label: 'Roles asignados',
            value: roles.length || 1,
            trendText: roles.join(' · ') || 'PARTICIPANTE',
            icon: KeyRound,
            accent: 'indigo',
          },
        ]}
      />

      {/* Doble columna simétrica: Datos personales + Seguridad y contraseña */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section
          id="datos-personales"
          className="flex flex-col rounded-[26px] border border-slate-200/80 bg-white/95 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md scroll-mt-24"
        >
          <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Datos personales</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Actualiza tu alias público en sorteos y tus datos de contacto verificados.
              </p>
            </div>
          </div>

          <form onSubmit={handleGuardarPerfil} className="flex flex-1 flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombres"
                  icon={User}
                  required
                  value={perfil.nombres}
                  onChange={(e) => setPerfil((p) => ({ ...p, nombres: e.target.value }))}
                />
                <Input
                  label="Apellidos"
                  icon={User}
                  required
                  value={perfil.apellidos}
                  onChange={(e) => setPerfil((p) => ({ ...p, apellidos: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Alias público"
                  icon={AtSign}
                  required
                  helperText="Visible en tableros y ganadores"
                  value={perfil.alias}
                  onChange={(e) => setPerfil((p) => ({ ...p, alias: e.target.value }))}
                />
                <Input
                  label="Teléfono"
                  icon={Phone}
                  placeholder="Ej. 70012345"
                  value={perfil.telefono}
                  onChange={(e) => setPerfil((p) => ({ ...p, telefono: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700">Correo vinculado</p>
                    <p className="truncate text-slate-500">{usuario?.email}</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200/70">
                  <ShieldCheck className="h-3 w-3" />
                  Activo
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" loading={savingPerfil} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </section>

        <section
          id="seguridad"
          className={`flex flex-col rounded-[26px] border bg-white/95 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md scroll-mt-24 transition ${
            enSeguridad
              ? 'border-amber-400 ring-4 ring-amber-400/15'
              : 'border-amber-200/80'
          }`}
        >
          <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/80">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Seguridad y contraseña</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Renueva tu clave periódicamente para mantener tu cuenta protegida.
              </p>
            </div>
          </div>

          <form onSubmit={handleCambiarPassword} className="flex flex-1 flex-col justify-between space-y-4">
            <div className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                icon={Lock}
                autoComplete="current-password"
                required
                placeholder="Introduce tu clave actual"
                value={passwords.passwordActual}
                onChange={(e) => setPasswords((p) => ({ ...p, passwordActual: e.target.value }))}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  icon={KeyRound}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  labelRight={
                    passwords.passwordNueva ? (
                      <span
                        className={`text-[11px] font-bold ${
                          puntajePassword === 3
                            ? 'text-emerald-700'
                            : puntajePassword === 2
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {fuerzaTexto}
                      </span>
                    ) : null
                  }
                  value={passwords.passwordNueva}
                  onChange={(e) => setPasswords((p) => ({ ...p, passwordNueva: e.target.value }))}
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  icon={ShieldCheck}
                  autoComplete="new-password"
                  required
                  placeholder="Repite tu nueva clave"
                  value={passwords.confirmarPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmarPassword: e.target.value }))}
                />
              </div>

              {passwords.passwordNueva && (
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

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/90 p-3 text-xs sm:grid-cols-4">
                {reglasPassword.map((r) => (
                  <span
                    key={r.label}
                    className={`inline-flex items-center gap-1.5 transition ${
                      r.ok ? 'font-semibold text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {r.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    )}
                    <span className="truncate">{r.label}</span>
                  </span>
                ))}
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-900">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Por seguridad, al actualizar tu contraseña se cerrarán las sesiones activas en otros dispositivos.
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" variant="amber" loading={savingPassword} className="w-full sm:w-auto">
                <KeyRound className="h-4 w-4" />
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
