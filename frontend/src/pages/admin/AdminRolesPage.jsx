import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  CalendarClock,
  KeyRound,
  Plus,
  Search,
  Shield,
  Sliders,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  actualizarPermisoApi,
  asignarPermisoRolApi,
  crearRolApi,
  eliminarRolApi,
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
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { tienePermiso } = useAuth();

  const [tab, setTab] = useState('roles'); // 'roles' | 'permisos' | 'historial'
  const [busqueda, setBusqueda] = useState('');
  const [histPage, setHistPage] = useState(1);

  const [modalRol, setModalRol] = useState(false);
  const [formRol, setFormRol] = useState({ nombre: '', descripcion: '' });
  const [creandoRol, setCreandoRol] = useState(false);

  const [rolEditando, setRolEditando] = useState(null);
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const [eliminandoRol, setEliminandoRol] = useState(false);
  const [filtroPermiso, setFiltroPermiso] = useState('');

  const ROLES_SISTEMA = new Set(['ADMINISTRADOR', 'ORGANIZADOR', 'PARTICIPANTE']);

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

  async function handleEliminarRol() {
    if (!rolAEliminar) return;
    setEliminandoRol(true);
    try {
      await eliminarRolApi(rolAEliminar.rolId);
      setRolAEliminar(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Rol eliminado');
    } catch (err) {
      toast.error('No se pudo eliminar', extraerErrorApi(err).message);
    } finally {
      setEliminandoRol(false);
    }
  }

  async function handleToggleEstadoPermiso(permiso) {
    try {
      await actualizarPermisoApi(permiso.permisoId, { estaActivo: !permiso.estaActivo });
      await queryClient.invalidateQueries({ queryKey: ['admin-permisos'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Estado de permiso actualizado');
    } catch (err) {
      toast.error('Error al actualizar permiso', extraerErrorApi(err).message);
    }
  }

  const roles = useMemo(() => rolesData?.items || [], [rolesData]);
  const permisos = useMemo(() => permisosData?.items || [], [permisosData]);
  const rolesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        (r.nombre || '').toLowerCase().includes(q) ||
        (r.descripcion || '').toLowerCase().includes(q)
    );
  }, [roles, busqueda]);

  const permisosFiltradosCatalogo = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return permisos;
    return permisos.filter(
      (p) =>
        `${p.recurso}:${p.accion}`.toLowerCase().includes(q) ||
        (p.nombre || '').toLowerCase().includes(q)
    );
  }, [permisos, busqueda]);

  const rolSeleccionadoActual = roles.find((r) => r.rolId === rolEditando?.rolId) || rolEditando;
  const permisosDeRolSet = new Set(
    (rolSeleccionadoActual?.permisos || []).map((p) => p.permisoId)
  );

  const permisosAgrupados = useMemo(() => {
    const q = filtroPermiso.trim().toLowerCase();
    const grupos = new Map();
    for (const p of permisos) {
      if (
        q &&
        !`${p.recurso}:${p.accion}`.toLowerCase().includes(q) &&
        !p.nombre?.toLowerCase().includes(q)
      ) {
        continue;
      }
      if (!grupos.has(p.recurso)) grupos.set(p.recurso, []);
      grupos.get(p.recurso).push(p);
    }
    return Array.from(grupos.entries());
  }, [permisos, filtroPermiso]);

  const histColumns = [
    {
      key: 'fecha',
      label: 'Fecha',
      icon: CalendarClock,
      render: (r) => <span className="text-xs text-slate-600">{formatearFecha(r.fecha)}</span>,
    },
    {
      key: 'operacion',
      label: 'Operación',
      icon: Activity,
      render: (r) => <Badge color="indigo">{r.operacion}</Badge>,
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: UserCheck,
      render: (r) => (
        <span className="font-semibold text-slate-800">
          {r.usuarioAdmin?.alias || `ID ${r.usuarioAdminId}`}
        </span>
      ),
    },
    {
      key: 'objetivo',
      label: 'Afectado',
      icon: Users,
      render: (r) => r.rolAfectado?.nombre || r.usuarioAfectado?.alias || '—',
    },
    {
      key: 'detalle',
      label: 'Rol / Permiso',
      icon: KeyRound,
      render: (r) =>
        r.permiso ? (
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
            {`${r.permiso.recurso}:${r.permiso.accion}`}
          </span>
        ) : (
          r.rol?.nombre || '—'
        ),
    },
  ];

  const permisosActivosCount = permisos.filter((p) => p.estaActivo).length;

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Roles, Matriz de Permisos & Auditoría"
        subtitle="Administra los privilegios asignados por rol, catálogo de permisos e historial."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder={
          tab === 'permisos'
            ? 'Buscar permiso por recurso:acción o descripción...'
            : 'Buscar rol por nombre o descripción...'
        }
        hasActiveFilters={Boolean(busqueda)}
        onResetFilters={() => setBusqueda('')}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={tab === 'roles' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTab('roles')}
            >
              Roles y matriz
            </Button>
            {tienePermiso('permisos', 'administrar') && (
              <>
                <Button
                  variant={tab === 'permisos' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTab('permisos')}
                >
                  Catálogo permisos
                </Button>
                <Button
                  variant={tab === 'historial' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTab('historial')}
                >
                  Historial
                </Button>
              </>
            )}
            {tienePermiso('roles', 'administrar') && (
              <Button size="sm" onClick={() => setModalRol(true)}>
                <Plus className="h-4 w-4" />
                Nuevo rol
              </Button>
            )}
          </div>
        }
      />

      <PanelSectionHeader
        icon={Shield}
        title={
          tab === 'roles'
            ? 'Matriz de Roles del Sistema'
            : tab === 'permisos'
            ? 'Catálogo Granular de Permisos'
            : 'Historial de Cambios de Privilegios'
        }
        subtitle="Control de acceso basado en roles (RBAC)"
        badgeText={`${roles.length} Roles configurados`}
        accent="indigo"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Roles registrados',
            value: roles.length,
            trendText: `${roles.filter((r) => ROLES_SISTEMA.has(r.nombre)).length} base del sistema`,
            icon: Shield,
            accent: 'indigo',
          },
          {
            label: 'Permisos activos',
            value: `${permisosActivosCount} / ${permisos.length}`,
            trendText: 'Catálogo habilitado',
            icon: KeyRound,
            accent: 'emerald',
          },
          {
            label: 'Eventos de privilegios',
            value: historialData?.pagination?.total ?? '—',
            trendText: 'Trazabilidad administrativa',
            icon: Activity,
            accent: 'sky',
          },
        ]}
      />

      {tab === 'roles' ? (
        loadingRoles ? (
          <FullPageSpinner message="Cargando roles..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rolesFiltrados.map((rol) => (
              <div
                key={rol.rolId}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Shield className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900">{rol.nombre}</h2>
                    </div>
                    <Badge color="slate">{rol.usuariosCount} usuario(s)</Badge>
                  </div>
                  {rol.descripcion && <p className="mt-2 text-xs text-slate-500">{rol.descripcion}</p>}
                  <div className="mt-3 flex flex-wrap gap-1">
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

                {(tienePermiso('permisos', 'administrar') ||
                  (tienePermiso('roles', 'administrar') && !ROLES_SISTEMA.has(rol.nombre))) && (
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                    {tienePermiso('permisos', 'administrar') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setFiltroPermiso('');
                          setRolEditando(rol);
                        }}
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        Configurar permisos ({rol.permisos.length})
                      </Button>
                    )}
                    {tienePermiso('roles', 'administrar') && !ROLES_SISTEMA.has(rol.nombre) && (
                      <RowActionButton
                        icon={Trash2}
                        title={`Eliminar rol ${rol.nombre}`}
                        tone="danger"
                        onClick={() => setRolAEliminar(rol)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : tab === 'permisos' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {permisosFiltradosCatalogo.map((p) => (
            <div
              key={p.permisoId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/85 bg-white p-4 shadow-xs transition hover:border-emerald-200"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-bold text-slate-900">
                  {p.recurso}:{p.accion}
                </p>
                <p className="truncate text-xs text-slate-500">{p.nombre}</p>
              </div>
              <Button
                size="sm"
                variant={p.estaActivo ? 'secondary' : 'primary'}
                onClick={() => handleToggleEstadoPermiso(p)}
              >
                {p.estaActivo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          ))}
        </div>
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
          itemLabel="movimientos"
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
        description={`Activos actualmente: ${rolSeleccionadoActual?.permisos?.length || 0} de ${permisos.length}`}
        maxWidth="max-w-2xl"
      >
        {rolSeleccionadoActual && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Filtrar permisos (ej. pagos, usuarios, sorteos)..."
                value={filtroPermiso}
                onChange={(e) => setFiltroPermiso(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2 pr-3 pl-9 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
              {permisosAgrupados.map(([recurso, lista]) => (
                <div key={recurso} className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {recurso}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lista.map((permiso) => {
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
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(rolAEliminar)}
        onClose={() => setRolAEliminar(null)}
        onConfirm={handleEliminarRol}
        loading={eliminandoRol}
        title={`Eliminar rol "${rolAEliminar?.nombre || ''}"`}
        message={`¿Seguro que deseas eliminar el rol "${rolAEliminar?.nombre || ''}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar rol"
      />
    </div>
  );
}
