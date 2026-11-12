import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldCheck, UserCheck, Users, UserX, X } from 'lucide-react';
import {
  asignarPermisoUsuarioApi,
  asignarRolUsuarioApi,
  cambiarActivoUsuarioApi,
  getPermisosApi,
  getRolesApi,
  getUsuarioDetalleApi,
  getUsuariosAdminApi,
  quitarPermisoUsuarioApi,
  quitarRolUsuarioApi,
} from '../../features/panel/panelApi.js';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../../utils/apiError.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function AdminUsuariosPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { tienePermiso } = useAuth();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all'); // all | active | inactive
  const [page, setPage] = useState(1);

  const [usuarioDetalleId, setUsuarioDetalleId] = useState(null);
  const [usuarioToggle, setUsuarioToggle] = useState(null);
  const [procesandoToggle, setProcesandoToggle] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usuarios', { search, page }],
    queryFn: () =>
      getUsuariosAdminApi({
        page,
        limit: 15,
        ...(search.trim() ? { search: search.trim() } : {}),
      }),
  });

  const { data: detalleData, refetch: refetchDetalle } = useQuery({
    queryKey: ['admin-usuario-detalle', usuarioDetalleId],
    queryFn: () => getUsuarioDetalleApi(usuarioDetalleId),
    enabled: Boolean(usuarioDetalleId),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: getRolesApi,
    enabled: tienePermiso('roles', 'administrar'),
  });

  const { data: permisosData } = useQuery({
    queryKey: ['admin-permisos'],
    queryFn: () => getPermisosApi(),
    enabled: tienePermiso('permisos', 'administrar'),
  });

  async function handleToggleActivo() {
    if (!usuarioToggle) return;
    setProcesandoToggle(true);
    try {
      await cambiarActivoUsuarioApi(usuarioToggle.usuarioId, !usuarioToggle.activo);
      setUsuarioToggle(null);
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success('Estado de cuenta actualizado');
    } catch (err) {
      toast.error('No se pudo actualizar', extraerErrorApi(err).message);
    } finally {
      setProcesandoToggle(false);
    }
  }

  async function handleToggleRol(rol, asignado) {
    if (!usuarioDetalleId) return;
    try {
      if (asignado) {
        await quitarRolUsuarioApi(usuarioDetalleId, rol.rolId);
      } else {
        await asignarRolUsuarioApi(usuarioDetalleId, rol.rolId);
      }
      await refetchDetalle();
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success('Roles actualizados');
    } catch (err) {
      toast.error('Error al modificar rol', extraerErrorApi(err).message);
    }
  }

  async function handleTogglePermisoDirecto(permiso, asignado) {
    if (!usuarioDetalleId) return;
    try {
      if (asignado) {
        await quitarPermisoUsuarioApi(usuarioDetalleId, permiso.permisoId);
      } else {
        await asignarPermisoUsuarioApi(usuarioDetalleId, permiso.permisoId);
      }
      await refetchDetalle();
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success('Permiso directo actualizado');
    } catch (err) {
      toast.error('Error al modificar permiso', extraerErrorApi(err).message);
    }
  }

  const columns = [
    { key: 'usuarioId', label: 'ID', render: (r) => <span className="font-mono">#{r.usuarioId}</span> },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">
            {r.nombres} {r.apellidos} <span className="text-slate-500">(@{r.alias})</span>
          </p>
          <p className="text-xs text-slate-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {(r.roles || []).map((rol) => (
            <Badge key={rol} color="indigo">
              {rol}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (r) => (
        <Badge color={r.activo ? 'emerald' : 'rose'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => setUsuarioDetalleId(r.usuarioId)}>
            <Shield className="h-3.5 w-3.5" />
            Detalle / Roles
          </Button>
          {tienePermiso('usuarios', 'administrar') && (
            <Button
              size="sm"
              variant={r.activo ? 'danger' : 'primary'}
              onClick={() => setUsuarioToggle(r)}
            >
              {r.activo ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
              {r.activo ? 'Desactivar' : 'Activar'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rolesUsuarioSet = new Set((detalleData?.roles || []).map((r) => r.rolId));
  const permisosDirectosSet = new Set((detalleData?.permisosDirectos || []).map((p) => p.clave));

  const usuariosVisibles = useMemo(() => {
    const items = data?.items || [];
    if (filtroEstado === 'active') return items.filter((u) => u.activo);
    if (filtroEstado === 'inactive') return items.filter((u) => !u.activo);
    return items;
  }, [data, filtroEstado]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
            <Users className="h-3.5 w-3.5" />
            Control de identidad y accesos
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Usuarios y permisos</h1>
          <p className="text-sm text-slate-600">
            Administra cuentas registradas, activa o desactiva accesos y asigna roles o permisos granulares.
          </p>
        </div>

        {tienePermiso('roles', 'administrar') && (
          <Link to="/admin/roles">
            <Button variant="secondary" size="sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Gestionar roles
            </Button>
          </Link>
        )}
      </div>

      {/* Buscador + botones rápidos en la misma fila */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por nombre, alias o email..."
            aria-label="Buscar usuarios"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-9 pl-9 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'inactive', label: 'Inactivos' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFiltroEstado(opt.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                filtroEstado === opt.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={usuariosVisibles}
        loading={isLoading}
        rowKey="usuarioId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Sin usuarios encontrados"
      />

      <ConfirmModal
        open={Boolean(usuarioToggle)}
        onClose={() => setUsuarioToggle(null)}
        onConfirm={handleToggleActivo}
        loading={procesandoToggle}
        variant={usuarioToggle?.activo ? 'danger' : 'primary'}
        title={usuarioToggle?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        message={`¿Confirmas ${usuarioToggle?.activo ? 'desactivar' : 'activar'} la cuenta de ${
          usuarioToggle?.alias
        }?`}
        confirmText={usuarioToggle?.activo ? 'Desactivar' : 'Activar'}
      />

      <Modal
        open={Boolean(usuarioDetalleId)}
        onClose={() => setUsuarioDetalleId(null)}
        title={`Permisos y roles · ${detalleData?.usuario?.alias || ''}`}
        description={detalleData?.usuario?.email}
        maxWidth="max-w-2xl"
      >
        {detalleData && (
          <div className="space-y-5">
            {tienePermiso('roles', 'administrar') && rolesData?.items && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Roles asignados (clic para asignar/quitar)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rolesData.items.map((rol) => {
                    const asignado = rolesUsuarioSet.has(rol.rolId);
                    return (
                      <Button
                        key={rol.rolId}
                        size="sm"
                        variant={asignado ? 'primary' : 'secondary'}
                        onClick={() => handleToggleRol(rol, asignado)}
                      >
                        {rol.nombre} {asignado ? '✓' : '+'}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {tienePermiso('permisos', 'administrar') && permisosData?.items && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Permisos directos del usuario (clic para asignar/quitar)
                </h3>
                <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                  {permisosData.items.map((perm) => {
                    const clave = `${perm.recurso}:${perm.accion}`;
                    const asignado = permisosDirectosSet.has(clave);
                    return (
                      <button
                        key={perm.permisoId}
                        type="button"
                        onClick={() => handleTogglePermisoDirecto(perm, asignado)}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium transition cursor-pointer ${
                          asignado
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {clave} {asignado ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Permisos efectivos ({detalleData.permisosEfectivos?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-50 p-3">
                {(detalleData.permisosEfectivos || []).map((p) => (
                  <Badge key={p} color="slate">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
