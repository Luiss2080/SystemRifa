import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import {
  asignarPermisoRolApi,
  crearRolApi,
  getHistorialPermisosApi,
  getPermisosApi,
  getRolesApi,
  quitarPermisoRolApi,
} from '../../features/panel/panelApi.js';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../../utils/apiError.js';
import { formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { FullPageSpinner } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { tienePermiso } = useAuth();

  const [tab, setTab] = useState('roles'); // 'roles' | 'historial'
  const [histPage, setHistPage] = useState(1);

  const [modalRol, setModalRol] = useState(false);
  const [formRol, setFormRol] = useState({ nombre: '', descripcion: '' });
  const [creandoRol, setCreandoRol] = useState(false);

  const [rolEditando, setRolEditando] = useState(null);

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: getRolesApi,
    enabled: tienePermiso('roles', 'administrar'),
  });

  const { data: permisosData } = useQuery({
    queryKey: ['admin-permisos'],
    queryFn: () => getPermisosApi(),
    enabled: tienePermiso('permisos', 'administrar'),
  });

  const { data: historialData, isLoading: loadingHistorial } = useQuery({
    queryKey: ['admin-historial-permisos', histPage],
    queryFn: () => getHistorialPermisosApi({ page: histPage, limit: 15 }),
    enabled: tab === 'historial' && tienePermiso('permisos', 'administrar'),
  });

  async function handleCrearRol(e) {
    e.preventDefault();
    setCreandoRol(true);
    try {
      await crearRolApi({
        nombre: formRol.nombre.trim().toUpperCase(),
        descripcion: formRol.descripcion.trim() || null,
      });
      setModalRol(false);
      setFormRol({ nombre: '', descripcion: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Rol creado');
    } catch (err) {
      toast.error('Error al crear rol', extraerErrorApi(err).message);
    } finally {
      setCreandoRol(false);
    }
  }

  async function handleTogglePermiso(rol, permiso, asignado) {
    try {
      if (asignado) {
        await quitarPermisoRolApi(rol.rolId, permiso.permisoId);
      } else {
        await asignarPermisoRolApi(rol.rolId, permiso.permisoId);
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Permiso actualizado');
    } catch (err) {
      toast.error('Error al modificar permiso', extraerErrorApi(err).message);
    }
  }

  const roles = rolesData?.items || [];
  const permisos = permisosData?.items || [];
  const rolSeleccionadoActual = roles.find((r) => r.rolId === rolEditando?.rolId) || rolEditando;
  const permisosDeRolSet = new Set(
    (rolSeleccionadoActual?.permisos || []).map((p) => p.permisoId)
  );

  const histColumns = [
    { key: 'fecha', label: 'Fecha', render: (r) => formatearFecha(r.fecha) },
    { key: 'operacion', label: 'Operación', render: (r) => <Badge color="indigo">{r.operacion}</Badge> },
    {
      key: 'admin',
      label: 'Admin',
      render: (r) => r.usuarioAdmin?.alias || `ID ${r.usuarioAdminId}`,
    },
    {
      key: 'objetivo',
      label: 'Afectado',
      render: (r) =>
        r.rolAfectado?.nombre ||
        r.usuarioAfectado?.alias ||
        '—',
    },
    {
      key: 'detalle',
      label: 'Rol / Permiso',
      render: (r) =>
        r.permiso
          ? `${r.permiso.recurso}:${r.permiso.accion}`
          : r.rol?.nombre || '—',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles, permisos e historial</h1>
          <p className="text-sm text-slate-500">
            Administra los permisos asignados a cada rol y audita cambios de privilegios
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant={tab === 'roles' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('roles')}>
            Roles y matriz
          </Button>
          {tienePermiso('permisos', 'administrar') && (
            <Button
              variant={tab === 'historial' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTab('historial')}
            >
              Historial de permisos
            </Button>
          )}
          {tienePermiso('roles', 'administrar') && (
            <Button size="sm" onClick={() => setModalRol(true)}>
              <Plus className="h-4 w-4" />
              Nuevo rol
            </Button>
          )}
        </div>
      </div>

      {tab === 'roles' ? (
        loadingRoles ? (
          <FullPageSpinner message="Cargando roles..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((rol) => (
              <div
                key={rol.rolId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">{rol.nombre}</h2>
                    <Badge color="slate">{rol.usuariosCount} usuario(s)</Badge>
                  </div>
                  {rol.descripcion && <p className="text-xs text-slate-500">{rol.descripcion}</p>}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {rol.permisos.slice(0, 6).map((p) => (
                      <Badge key={p.permisoId} color="emerald">
                        {p.recurso}:{p.accion}
                      </Badge>
                    ))}
                    {rol.permisos.length > 6 && (
                      <Badge color="slate">+{rol.permisos.length - 6} más</Badge>
                    )}
                  </div>
                </div>

                {tienePermiso('permisos', 'administrar') && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setRolEditando(rol)}
                    >
                      Configurar permisos ({rol.permisos.length})
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <DataTable
          columns={histColumns}
          data={historialData?.items || []}
          loading={loadingHistorial}
          rowKey="historialId"
          page={historialData?.pagination?.page || 1}
          totalPages={historialData?.pagination?.totalPages || 1}
          total={historialData?.pagination?.total || 0}
          onPageChange={setHistPage}
          emptyTitle="Sin movimientos de permisos"
        />
      )}

      <Modal open={modalRol} onClose={() => setModalRol(false)} title="Crear nuevo rol">
        <form onSubmit={handleCrearRol} className="space-y-4">
          <Input
            label="Nombre del rol"
            required
            placeholder="Ej. AUDITOR_EXTERNO"
            value={formRol.nombre}
            onChange={(e) => setFormRol((f) => ({ ...f, nombre: e.target.value }))}
          />
          <Textarea
            label="Descripción"
            value={formRol.descripcion}
            onChange={(e) => setFormRol((f) => ({ ...f, descripcion: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalRol(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={creandoRol}>
              Crear rol
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(rolSeleccionadoActual)}
        onClose={() => setRolEditando(null)}
        title={`Permisos del rol · ${rolSeleccionadoActual?.nombre || ''}`}
        maxWidth="max-w-2xl"
      >
        {rolSeleccionadoActual && (
          <div className="grid gap-2 sm:grid-cols-2">
            {permisos.map((permiso) => {
              const asignado = permisosDeRolSet.has(permiso.permisoId);
              return (
                <button
                  key={permiso.permisoId}
                  type="button"
                  onClick={() => handleTogglePermiso(rolSeleccionadoActual, permiso, asignado)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition cursor-pointer ${
                    asignado
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold">
                      {permiso.recurso}:{permiso.accion}
                    </p>
                    <p className="text-[11px] opacity-75">{permiso.nombre}</p>
                  </div>
                  <span className="font-bold">{asignado ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

