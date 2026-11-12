import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, UserCheck, UserX, X } from 'lucide-react';
import {
  asignarRolUsuarioApi,
  cambiarActivoUsuarioApi,
  getRolesApi,
  getUsuarioDetalleApi,
  getUsuariosAdminApi,
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Consulta cuentas, roles asignados y permisos efectivos</p>
        </div>

        <div className="relative w-full sm:w-80">
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
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
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
