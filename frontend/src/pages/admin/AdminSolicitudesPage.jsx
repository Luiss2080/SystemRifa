import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export function AdminSolicitudesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [estado, setEstado] = useState('');
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

  const columns = [
    { key: 'rifaSolicitadaId', label: 'ID', render: (r) => `#${r.rifaSolicitadaId}` },
    {
      key: 'nombre',
      label: 'Solicitud',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.nombre}</p>
          <p className="text-xs text-slate-500">
            Solicitante: {r.usuario?.alias || `ID ${r.usuarioId}`} · {r.cantidadTickets} tickets ·{' '}
            {formatearBs(r.precioTicket)}
          </p>
        </div>
      ),
    },
    { key: 'estado', label: 'Estado', render: (r) => <Badge estado={r.estado} /> },
    {
      key: 'fechaSolicitud',
      label: 'Fecha',
      render: (r) => formatearFecha(r.fechaSolicitud),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {r.estado !== 'APROBADA' && r.estado !== 'RECHAZADA' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => abrirCambiarEstado(r)}>
                Cambiar estado
              </Button>
              <Button size="sm" onClick={() => abrirAprobar(r)}>
                Ajustar y aprobar
              </Button>
            </>
          )}
          {r.rifa && (
            <Link to={`/organizador/rifas/${r.rifa.rifaId}`}>
              <Button size="sm" variant="secondary">
                Ver rifa
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de solicitudes</h1>
        <p className="text-sm text-slate-500">
          Revisa propuestas, confirma tarifa de publicación y aprueba nuevas rifas
        </p>
      </div>

      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 shadow-xs sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            1
          </span>
          <span>Revisa la propuesta y habilita pago de tarifa</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            2
          </span>
          <span>Confirma referencia de tarifa recibida</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            3
          </span>
          <span>Aprueba para generar rifa y cargar premios</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { key: '', label: 'Todas' },
          { key: 'REVISION', label: 'En revisión' },
          { key: 'ESPERANDO_PAGO', label: 'Esperando pago' },
          { key: 'PAGO_CONFIRMADO', label: 'Pago confirmado' },
          { key: 'APROBADA', label: 'Aprobadas' },
          { key: 'RECHAZADA', label: 'Rechazadas' },
        ].map((chip) => (
          <button
            key={chip.key || 'all'}
            type="button"
            onClick={() => {
              setEstado(chip.key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              estado === chip.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        rowKey="rifaSolicitadaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Sin solicitudes"
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
                onChange={(e) => setFormAprobar((f) => ({ ...f, cantidadTickets: e.target.value }))}
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

