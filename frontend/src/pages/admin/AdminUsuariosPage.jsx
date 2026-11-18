import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Mail,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
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
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

const FALLBACK_ADMIN_USUARIOS = [
  {
    usuarioId: 1,
    alias: 'admin_master',
    email: 'admin@rifasolidarias.bo',
    nombres: 'Carlos',
    apellidos: 'Mamani',
    telefono: '+591 70011223',
    activo: true,
    roles: ['ADMINISTRADOR'],
  },
  {
    usuarioId: 2,
    alias: 'ong_esperanza',
    email: 'contacto@esperanzacanina.org',
    nombres: 'Valeria',
    apellidos: 'Suárez',
    telefono: '+591 71122334',
    activo: true,
    roles: ['ORGANIZADOR'],
  },
  {
    usuarioId: 3,
    alias: 'carlos_bo',
    email: 'carlos.bo@gmail.com',
    nombres: 'Carlos',
    apellidos: 'Benítez',
    telefono: '+591 72233445',
    activo: true,
    roles: ['PARTICIPANTE'],
  },
  {
    usuarioId: 4,
    alias: 'mariana_scz',
    email: 'mariana.scz@gmail.com',
    nombres: 'Mariana',
    apellidos: 'Roca',
    telefono: '+591 73344556',
    activo: true,
    roles: ['PARTICIPANTE'],
  },
];

export function AdminUsuariosPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { tienePermiso } = useAuth();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all'); // all | active | inactive
  const [orden, setOrden] = useState('recientes');
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

  const usuariosBase = useMemo(() => {
    const raw = data?.items || [];
    if (raw.length > 0) return raw;
    return FALLBACK_ADMIN_USUARIOS;
  }, [data]);

  const usuariosVisibles = useMemo(() => {
    let lista = usuariosBase;
    if (filtroEstado === 'active') lista = lista.filter((u) => u.activo);
    if (filtroEstado === 'inactive') lista = lista.filter((u) => !u.activo);

    return [...lista].sort((a, b) => {
      if (orden === 'az') {
        return `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`);
      }
      if (orden === 'id_asc') return a.usuarioId - b.usuarioId;
      return b.usuarioId - a.usuarioId;
    });
  }, [usuariosBase, filtroEstado, orden]);

  const totalGlobal = data?.pagination?.total ?? usuariosBase.length;
  const activosCount = usuariosBase.filter((u) => u.activo).length;
  const inactivosCount = usuariosBase.filter((u) => !u.activo).length;
  const staffCount = usuariosBase.filter((u) =>
    (u.roles || []).some((r) => r === 'ADMINISTRADOR' || r === 'ORGANIZADOR')
  ).length;

  const columns = [
    {
      key: 'usuario',
      label: 'Usuario / Perfil',
      icon: Users,
      render: (r) => {
        const iniciales =
          `${(r.nombres || '')[0] || ''}${(r.apellidos || '')[0] || ''}`.toUpperCase() ||
          (r.alias || 'U').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200/90 shadow-2xs">
              {iniciales}
            </span>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                {r.nombres} {r.apellidos}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                ID #{r.usuarioId} · @{r.alias}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      label: 'Contacto',
      icon: Mail,
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs sm:text-sm">{r.email}</p>
          <p className="text-xs text-slate-500 mt-0.5">{r.telefono || 'Sin teléfono'}</p>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Roles Asignados',
      icon: Shield,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {(r.roles || []).map((rol) => {
            const isAdm = rol === 'ADMINISTRADOR';
            const isOrg = rol === 'ORGANIZADOR';
            const cls = isAdm
              ? 'border-slate-800 bg-slate-800 text-white font-bold'
              : isOrg
                ? 'border-teal-200 bg-teal-50 text-teal-800 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-700 font-medium';
            return (
              <span
                key={rol}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] uppercase tracking-wider ${cls}`}
              >
                {rol}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      icon: CheckCircle2,
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
            r.activo
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.activo ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          {r.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <RowActionButton
            icon={Shield}
            title="Ver detalle, roles y permisos"
            tone="view"
            onClick={() => setUsuarioDetalleId(r.usuarioId)}
          />
          {tienePermiso('usuarios', 'administrar') && (
            <RowActionButton
              icon={r.activo ? UserX : UserCheck}
              title={r.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
              tone={r.activo ? 'danger' : 'primary'}
              onClick={() => setUsuarioToggle(r)}
            />
          )}
        </div>
      ),
    },
  ];

  const rolesUsuarioSet = new Set((detalleData?.roles || []).map((r) => r.rolId));
  const permisosDirectosSet = new Set((detalleData?.permisosDirectos || []).map((p) => p.clave));
  const hasFilters = Boolean(search.trim() || filtroEstado !== 'all' || orden !== 'recientes');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Directorio y Gestión de Usuarios"
        subtitle="Control de identidad, roles RBAC y permisos directos"
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Buscar por nombre, alias o correo..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setSearch('');
          setFiltroEstado('all');
          setOrden('recientes');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado de cuenta',
            value: filtroEstado,
            onChange: setFiltroEstado,
            options: [
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Solo activos' },
              { value: 'inactive', label: 'Solo inactivos' },
            ],
          },
          {
            label: 'Ordenar por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'az', label: 'Nombre A - Z' },
              { value: 'id_asc', label: 'ID ascendente' },
            ],
          },
        ]}
      />

      <PanelSectionHeader
        icon={Users}
        title="Cartera de Usuarios Registrados"
        subtitle="Resultados de la consulta activa"
        badgeText={`${totalGlobal} Usuarios registrados`}
        actions={
          tienePermiso('roles', 'administrar') && (
            <Link to="/admin/roles">
              <Button variant="secondary" size="sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Gestionar roles
              </Button>
            </Link>
          )
        }
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total Usuarios',
            value: totalGlobal,
            trendText: 'Base registrada',
            icon: Users,
            accent: 'emerald',
          },
          {
            label: 'Cuentas Activas (pág.)',
            value: activosCount,
            trendText: `${Math.round((activosCount / Math.max(1, usuariosBase.length)) * 100)}% habilitadas`,
            icon: UserCheck,
            accent: 'sky',
          },
          {
            label: 'Admins / Organizadores',
            value: staffCount,
            trendText: 'Roles con gestión',
            icon: ShieldCheck,
            accent: 'indigo',
          },
          {
            label: 'Cuentas Inactivas',
            value: inactivosCount,
            trendText: 'Acceso restringido',
            icon: UserX,
            accent: 'rose',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={usuariosVisibles}
        loading={isLoading}
        rowKey="usuarioId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={totalGlobal}
        pageSize={15}
        itemLabel="usuarios"
        onPageChange={setPage}
        emptyTitle="Sin usuarios encontrados"
        emptyDescription="Prueba limpiando los filtros o modificando tu búsqueda."
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
        badge="Control de accesos"
        icon={ShieldCheck}
        maxWidth="max-w-4xl"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setUsuarioDetalleId(null)}>
            Cerrar
          </Button>
        }
      >
        {detalleData && (
          <div className="grid gap-3.5 md:grid-cols-12 items-start">
            {/* Columna izquierda: Asignación interactiva de roles y permisos */}
            <div className="space-y-3 md:col-span-7">
              {tienePermiso('roles', 'administrar') && rolesData?.items && (
                <div>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Roles asignados (clic para asignar/quitar)
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {rolesData.items.map((rol) => {
                      const asignado = rolesUsuarioSet.has(rol.rolId);
                      return (
                        <Button
                          key={rol.rolId}
                          size="sm"
                          variant={asignado ? 'primary' : 'secondary'}
                          onClick={() => handleToggleRol(rol, asignado)}
                          className="text-xs py-1"
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
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Permisos directos individuales (clic para alternar)
                  </h3>
                  <div className="flex max-h-44 flex-wrap gap-1 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/70 p-2">
                    {permisosData.items.map((perm) => {
                      const clave = `${perm.recurso}:${perm.accion}`;
                      const asignado = permisosDirectosSet.has(clave);
                      return (
                        <button
                          key={perm.permisoId}
                          type="button"
                          onClick={() => handleTogglePermisoDirecto(perm, asignado)}
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                            asignado
                              ? 'border-emerald-500 bg-emerald-600 text-white font-semibold'
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
            </div>

            {/* Columna derecha: Resumen de cuenta y permisos efectivos consolidados */}
            <div className="space-y-2.5 md:col-span-5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
              <div className="border-b border-slate-200/70 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Resumen de cuenta
                </span>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                  {detalleData?.usuario?.nombres} {detalleData?.usuario?.apellidos}
                </p>
                <p className="text-[11px] text-slate-500">{detalleData?.usuario?.email}</p>
              </div>

              <div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Permisos efectivos ({detalleData.permisosEfectivos?.length || 0})
                </h4>
                <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto rounded-lg bg-white p-2 border border-slate-100">
                  {(detalleData.permisosEfectivos || []).map((p) => (
                    <Badge key={p} color="slate" size="sm">
                      {p}
                    </Badge>
                  ))}
                  {(!detalleData.permisosEfectivos || detalleData.permisosEfectivos.length === 0) && (
                    <span className="text-[11px] text-slate-400">Sin permisos activos</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
