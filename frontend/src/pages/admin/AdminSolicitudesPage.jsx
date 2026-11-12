import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  aprobarSolicitudApi,
  cambiarEstadoSolicitudApi,
  getSolicitudesAdminApi,
} from '../../features/panel/panelApi.js';
import { getCausasPublicas } from '../../features/rifas/publicApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import {
  aDatetimeLocalLaPaz,
  deDatetimeLocalLaPazAUtcIso,
  formatearBs,
  formatearFecha,
} from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

export function AdminSolicitudesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [page, setPage] = useState(1);

  const [modalEstado, setModalEstado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('ESPERANDO_PAGO');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [observacionEstado, setObservacionEstado] = useState('');
  const [procesandoEstado, setProcesandoEstado] = useState(false);

  const [modalAprobar, setModalAprobar] = useState(null);
  const [formAprobar, setFormAprobar] = useState({});
  const [aprobando, setAprobando] = useState(false);

  const { data: causasData } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-solicitudes', { estado, page }],
    queryFn: () =>
      getSolicitudesAdminApi({
        page,
        limit: 15,
        ...(estado ? { estado } : {}),
      }),
  });

  function abrirCambiarEstado(sol) {
    setModalEstado(sol);
    setNuevoEstado(sol.estado === 'REVISION' ? 'ESPERANDO_PAGO' : 'PAGO_CONFIRMADO');
    setReferenciaPago(sol.referenciaPago || '');
    setObservacionEstado(sol.observacion || '');
  }

  function abrirAprobar(sol) {
    setModalAprobar(sol);
    setFormAprobar({
      nombre: sol.nombre,
      descripcion: sol.descripcion || '',
      precioTicket: sol.precioTicket,
      cantidadTickets: String(sol.cantidadTickets),
      fechaInicio: aDatetimeLocalLaPaz(sol.fechaInicio),
      fechaFin: aDatetimeLocalLaPaz(sol.fechaFin),
      causaId: sol.causaId ? String(sol.causaId) : '',
      observacion: '',
    });
  }

  async function handleCambiarEstado(e) {
    e.preventDefault();
    setProcesandoEstado(true);
    try {
      await cambiarEstadoSolicitudApi(modalEstado.rifaSolicitadaId, {
        estado: nuevoEstado,
        referenciaPago: referenciaPago.trim() || null,
        observacion: observacionEstado.trim() || null,
      });
      setModalEstado(null);
      queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error('Error al cambiar estado', extraerErrorApi(err).message);
    } finally {
      setProcesandoEstado(false);
    }
  }

  async function handleAprobar(e) {
    e.preventDefault();
    setAprobando(true);
    try {
      const res = await aprobarSolicitudApi(modalAprobar.rifaSolicitadaId, {
        nombre: formAprobar.nombre.trim(),
        descripcion: formAprobar.descripcion.trim() || null,
        precioTicket: Number(formAprobar.precioTicket),
        cantidadTickets: Number(formAprobar.cantidadTickets),
        fechaInicio: deDatetimeLocalLaPazAUtcIso(formAprobar.fechaInicio),
        fechaFin: deDatetimeLocalLaPazAUtcIso(formAprobar.fechaFin),
        causaId: formAprobar.causaId ? Number(formAprobar.causaId) : null,
        observacion: formAprobar.observacion.trim() || null,
      });
      setModalAprobar(null);
      queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
      toast.success('Solicitud aprobada', 'Ahora carga los premios iniciales de la rifa.');
      if (res.rifa?.rifaId) {
        navigate(`/organizador/rifas/${res.rifa.rifaId}`);
      }
    } catch (err) {
      toast.error('No se pudo aprobar', extraerErrorApi(err).message);
    } finally {
      setAprobando(false);
    }
  }

  const causasOpciones = (causasData?.items || []).map((c) => ({
    value: String(c.causaId),
    label: c.nombre,
  }));

  const baseItems = useMemo(() => data?.items || [], [data]);
  const solicitudesVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = q
      ? baseItems.filter(
          (s) =>
            s.nombre?.toLowerCase().includes(q) ||
            s.usuario?.alias?.toLowerCase().includes(q) ||
            s.referenciaPago?.toLowerCase().includes(q) ||
            String(s.rifaSolicitadaId).includes(q)
        )
      : baseItems;

    return [...filtradas].sort((a, b) => {
      if (orden === 'tickets_desc') return (b.cantidadTickets || 0) - (a.cantidadTickets || 0);
      if (orden === 'precio_desc') return Number(b.precioTicket || 0) - Number(a.precioTicket || 0);
      return b.rifaSolicitadaId - a.rifaSolicitadaId;
    });
  }, [baseItems, busqueda, orden]);

  const totalGlobal = data?.pagination?.total ?? baseItems.length;
  const enProcesoCount = baseItems.filter(
    (s) => s.estado === 'REVISION' || s.estado === 'ESPERANDO_PAGO' || s.estado === 'PAGO_CONFIRMADO'
  ).length;
  const aprobadasCount = baseItems.filter((s) => s.estado === 'APROBADA').length;
  const rechazadasCount = baseItems.filter((s) => s.estado === 'RECHAZADA').length;

  const columns = [
    {
      key: 'nombre',
      label: 'Solicitud de Campaña',
      icon: Sparkles,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.nombre}</p>
          <p className="text-xs text-slate-500">
            ID #{r.rifaSolicitadaId} · Solicitante: @{r.usuario?.alias || `ID ${r.usuarioId}`}
          </p>
        </div>
      ),
    },
    {
      key: 'config',
      label: 'Configuración',
      icon: ClipboardList,
      render: (r) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-700">{formatearBs(r.precioTicket)} / ticket</p>
          <p className="text-slate-500">{r.cantidadTickets} boletos totales</p>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      icon: CheckCircle2,
      render: (r) => <Badge estado={r.estado} />,
    },
    {
      key: 'fechaSolicitud',
      label: 'Fecha',
      icon: Calendar,
      render: (r) => (
        <span className="text-xs text-slate-600">{formatearFecha(r.fechaSolicitud)}</span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {r.estado !== 'APROBADA' && r.estado !== 'RECHAZADA' && (
            <>
              <RowActionButton
                icon={Edit3}
                title="Cambiar estado de solicitud"
                tone="neutral"
                onClick={() => abrirCambiarEstado(r)}
              />
              <RowActionButton
                icon={Check}
                label="Aprobar"
                tone="primary"
                onClick={() => abrirAprobar(r)}
              />
            </>
          )}
          {r.rifa && (
            <Link to={`/organizador/rifas/${r.rifa.rifaId}`}>
              <RowActionButton icon={Eye} label="Ver rifa" tone="view" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  const hasFilters = Boolean(busqueda.trim() || estado || orden !== 'recientes');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Gestión de Solicitudes de Rifas"
        subtitle="Evaluación de propuestas, tarifa de publicación y aprobación oficial"
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por título, solicitante o referencia..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setBusqueda('');
          setEstado('');
          setOrden('recientes');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado',
            value: estado,
            onChange: (val) => {
              setEstado(val);
              setPage(1);
            },
            options: [
              { value: '', label: 'Todos los estados' },
              { value: 'REVISION', label: 'En revisión' },
              { value: 'ESPERANDO_PAGO', label: 'Esperando pago' },
              { value: 'PAGO_CONFIRMADO', label: 'Pago confirmado' },
              { value: 'APROBADA', label: 'Aprobadas' },
              { value: 'RECHAZADA', label: 'Rechazadas' },
            ],
          },
          {
            label: 'Ordenar por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'tickets_desc', label: 'Más tickets' },
              { value: 'precio_desc', label: 'Mayor precio ticket' },
            ],
          },
        ]}
        extraContent={
          <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                1
              </span>
              <span>Revisa propuesta y habilita tarifa</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                2
              </span>
              <span>Confirma referencia de tarifa recibida</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                3
              </span>
              <span>Aprueba para generar rifa y premios</span>
            </div>
          </div>
        }
      />

      <PanelSectionHeader
        icon={ClipboardList}
        title="Bandeja de Solicitudes"
        subtitle="Resultados de la consulta activa"
        badgeText={`${totalGlobal} solicitudes registradas`}
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total Solicitudes',
            value: totalGlobal,
            trendText: estado || 'Historial completo',
            icon: ClipboardList,
            accent: 'emerald',
          },
          {
            label: 'En Revisión / Tarifa',
            value: enProcesoCount,
            trendText: 'Pendientes de cierre',
            icon: Clock,
            accent: 'amber',
          },
          {
            label: 'Aprobadas (pág.)',
            value: aprobadasCount,
            trendText: 'Rifas generadas',
            icon: CheckCircle2,
            accent: 'sky',
          },
          {
            label: 'Rechazadas (pág.)',
            value: rechazadasCount,
            trendText: 'Con observación',
            icon: XCircle,
            accent: 'rose',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={solicitudesVisibles}
        loading={isLoading}
        rowKey="rifaSolicitadaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={totalGlobal}
        pageSize={15}
        itemLabel="solicitudes"
        onPageChange={setPage}
        emptyTitle="Sin solicitudes"
        emptyDescription="No hay solicitudes registradas con el filtro actual."
      />

      {/* Modal cambiar estado */}
      <Modal
        open={Boolean(modalEstado)}
        onClose={() => setModalEstado(null)}
        title={`Cambiar estado · #${modalEstado?.rifaSolicitadaId || ''}`}
      >
        <form onSubmit={handleCambiarEstado} className="space-y-4">
          <Select
            label="Nuevo estado"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            options={[
              { value: 'ESPERANDO_PAGO', label: 'ESPERANDO_PAGO' },
              { value: 'PAGO_CONFIRMADO', label: 'PAGO_CONFIRMADO' },
              { value: 'RECHAZADA', label: 'RECHAZADA' },
            ]}
          />
          <Input
            label="Referencia de pago (si aplica)"
            value={referenciaPago}
            onChange={(e) => setReferenciaPago(e.target.value)}
          />
          <Textarea
            label="Observación (obligatoria al rechazar)"
            value={observacionEstado}
            onChange={(e) => setObservacionEstado(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalEstado(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={procesandoEstado}>
              Guardar estado
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal ajustar y aprobar */}
      <Modal
        open={Boolean(modalAprobar)}
        onClose={() => setModalAprobar(null)}
        title={`Aprobar solicitud · ${modalAprobar?.nombre || ''}`}
        description="Puedes ajustar los valores finales antes de crear la rifa y generar sus tickets."
        maxWidth="max-w-2xl"
      >
        {modalAprobar && (
          <form onSubmit={handleAprobar} className="space-y-4">
            <Input
              label="Nombre definitivo"
              required
              value={formAprobar.nombre}
              onChange={(e) => setFormAprobar((f) => ({ ...f, nombre: e.target.value }))}
            />
            <Textarea
              label="Descripción"
              value={formAprobar.descripcion}
              onChange={(e) => setFormAprobar((f) => ({ ...f, descripcion: e.target.value }))}
            />
            <Select
              label="Causa solidaria"
              placeholder="Sin causa"
              options={causasOpciones}
              value={formAprobar.causaId}
              onChange={(e) => setFormAprobar((f) => ({ ...f, causaId: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Precio ticket (Bs)"
                type="number"
                step="0.01"
                required
                value={formAprobar.precioTicket}
                onChange={(e) => setFormAprobar((f) => ({ ...f, precioTicket: e.target.value }))}
              />
              <Input
                label="Cantidad de tickets"
                type="number"
                required
                value={formAprobar.cantidadTickets}
                onChange={(e) =>
                  setFormAprobar((f) => ({ ...f, cantidadTickets: e.target.value }))
                }
              />
              <Input
                label="Inicio (La Paz)"
                type="datetime-local"
                required
                value={formAprobar.fechaInicio}
                onChange={(e) => setFormAprobar((f) => ({ ...f, fechaInicio: e.target.value }))}
              />
              <Input
                label="Fin (La Paz)"
                type="datetime-local"
                required
                value={formAprobar.fechaFin}
                onChange={(e) => setFormAprobar((f) => ({ ...f, fechaFin: e.target.value }))}
              />
            </div>
            <Textarea
              label="Observación de aprobación"
              value={formAprobar.observacion}
              onChange={(e) => setFormAprobar((f) => ({ ...f, observacion: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalAprobar(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={aprobando}>
                Aprobar y generar rifa
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
