import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, CalendarClock, CheckCircle2, Plus, Trash2, Trophy } from 'lucide-react';
import { getDetalleRifa } from '../../features/rifas/publicApi.js';
import {
  actualizarPremioApi,
  crearPremioApi,
  desactivarPremioApi,
  extenderRifaApi,
  finalizarRifaSinVentasApi,
  getReporteRifaApi,
  realizarSorteoApi,
  registrarEntregaPremioApi,
} from '../../features/panel/panelApi.js';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../../utils/apiError.js';
import {
  aDatetimeLocalLaPaz,
  deDatetimeLocalLaPazAUtcIso,
  formatearBs,
  formatearFecha,
} from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageSpinner } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function OrganizadorRifaGestionPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { esAdmin, tienePermiso } = useAuth();

  const { data: detalleData, isLoading } = useQuery({
    queryKey: ['rifa-detalle', id],
    queryFn: () => getDetalleRifa(id),
  });

  const { data: reporteData } = useQuery({
    queryKey: ['reporte-rifa', id],
    queryFn: () => getReporteRifaApi(id),
    enabled: esAdmin || tienePermiso('reportes', 'leer'),
  });

  // Modales y formularios
  const [modalPremio, setModalPremio] = useState(null); // { modo: 'crear' | 'editar', premio?: obj }
  const [formPremio, setFormPremio] = useState({ nombre: '', descripcion: '', valor: '' });
  const [guardandoPremio, setGuardandoPremio] = useState(false);

  const [premioAEliminar, setPremioAEliminar] = useState(null);
  const [desactivandoPremio, setDesactivandoPremio] = useState(false);

  const [nuevaFechaFin, setNuevaFechaFin] = useState('');
  const [extendiendo, setExtendiendo] = useState(false);

  const [confirmSorteoOpen, setConfirmSorteoOpen] = useState(false);
  const [forzarSorteo, setForzarSorteo] = useState(false);
  const [obsSorteo, setObsSorteo] = useState('');
  const [sorteando, setSorteando] = useState(false);

  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);
  const [motivoFinalizar, setMotivoFinalizar] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  const [modalEntrega, setModalEntrega] = useState(null);
  const [datosEntrega, setDatosEntrega] = useState('');
  const [guardandoEntrega, setGuardandoEntrega] = useState(false);

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['rifa-detalle', id] });
    queryClient.invalidateQueries({ queryKey: ['reporte-rifa', id] });
    queryClient.invalidateQueries({ queryKey: ['mis-rifas-org'] });
  }

  if (isLoading) return <FullPageSpinner message="Cargando gestión de rifa..." />;
  const rifa = detalleData?.rifa;
  if (!rifa) return null;

  const esFinalizada = rifa.estado === 'FINALIZADA';

  function abrirCrearPremio() {
    setFormPremio({ nombre: '', descripcion: '', valor: '' });
    setModalPremio({ modo: 'crear' });
  }

  function abrirEditarPremio(premio) {
    setFormPremio({
      nombre: premio.nombre || '',
      descripcion: premio.descripcion || '',
      valor: premio.valor || '',
    });
    setModalPremio({ modo: 'editar', premio });
  }

  async function handleGuardarPremio(e) {
    e.preventDefault();
    setGuardandoPremio(true);
    try {
      const payload = {
        nombre: formPremio.nombre.trim(),
        descripcion: formPremio.descripcion.trim() || null,
        valor: formPremio.valor ? Number(formPremio.valor) : null,
      };
      if (modalPremio.modo === 'crear') {
        await crearPremioApi(id, payload);
        toast.success('Premio agregado', 'El premio quedó activo en la rifa.');
      } else {
        await actualizarPremioApi(modalPremio.premio.premioId, payload);
        toast.success('Premio actualizado', 'Cambios guardados.');
      }
      setModalPremio(null);
      invalidar();
    } catch (err) {
      toast.error('Error al guardar premio', extraerErrorApi(err).message);
    } finally {
      setGuardandoPremio(false);
    }
  }

  async function handleDesactivarPremio() {
    if (!premioAEliminar) return;
    setDesactivandoPremio(true);
    try {
      await desactivarPremioApi(premioAEliminar.premioId);
      setPremioAEliminar(null);
      invalidar();
      toast.success('Premio desactivado');
    } catch (err) {
      toast.error('No se pudo desactivar', extraerErrorApi(err).message);
    } finally {
      setDesactivandoPremio(false);
    }
  }

  async function handleExtender(e) {
    e.preventDefault();
    const iso = deDatetimeLocalLaPazAUtcIso(nuevaFechaFin);
    if (!iso) {
      toast.error('Fecha inválida', 'Selecciona una fecha futura válida.');
      return;
    }
    setExtendiendo(true);
    try {
      await extenderRifaApi(id, iso);
      setNuevaFechaFin('');
      invalidar();
      toast.success('Fecha extendida', 'La rifa se actualizó correctamente.');
    } catch (err) {
      toast.error('No se pudo extender', extraerErrorApi(err).message);
    } finally {
      setExtendiendo(false);
    }
  }

  async function handleRealizarSorteo() {
    setSorteando(true);
    try {
      const res = await realizarSorteoApi(id, {
        forzar: forzarSorteo,
        observacion: obsSorteo.trim() || null,
      });
      setConfirmSorteoOpen(false);
      invalidar();
      toast.success(
        '¡Sorteo realizado!',
        `Ticket ganador principal: #${res.ganadores?.[0]?.numeroTicket}`
      );
    } catch (err) {
      toast.error('No se pudo realizar el sorteo', extraerErrorApi(err).message);
    } finally {
      setSorteando(false);
    }
  }

  async function handleFinalizarSinVentas() {
    if (!motivoFinalizar.trim()) {
      toast.error('Motivo requerido', 'Indica el motivo para finalizar sin ventas.');
      return;
    }
    setFinalizando(true);
    try {
      await finalizarRifaSinVentasApi(id, motivoFinalizar.trim());
      setConfirmFinalizarOpen(false);
      invalidar();
      toast.info('Rifa finalizada', 'La rifa cerró sin ventas registradas.');
    } catch (err) {
      toast.error('Error al finalizar', extraerErrorApi(err).message);
    } finally {
      setFinalizando(false);
    }
  }

  async function handleRegistrarEntrega(e) {
    e.preventDefault();
    if (!modalEntrega) return;
    setGuardandoEntrega(true);
    try {
      await registrarEntregaPremioApi(modalEntrega.premioId, {
        reclamado: true,
        datosEntrega: datosEntrega.trim() || null,
      });
      setModalEntrega(null);
      setDatosEntrega('');
      invalidar();
      toast.success('Entrega registrada', 'El premio figura ahora como entregado.');
    } catch (err) {
      toast.error('Error al registrar entrega', extraerErrorApi(err).message);
    } finally {
      setGuardandoEntrega(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{rifa.nombre}</h1>
            <Badge estado={rifa.estado} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cierre actual: {formatearFecha(rifa.fechaFin)} · Precio: {formatearBs(rifa.precioTicket)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/rifas/${rifa.rifaId}`}>
            <Button variant="secondary" size="sm">
              Vista pública
            </Button>
          </Link>
          {esFinalizada && (
            <Link to={`/rifas/${rifa.rifaId}/resultado`}>
              <Button variant="amber" size="sm">
                <Trophy className="h-4 w-4" />
                Ver resultado público
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Reporte en vivo */}
      {reporteData && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs text-slate-500">Recaudado confirmado</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">
              {formatearBs(reporteData.recaudacionConfirmada)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs text-slate-500">Pagos pendientes</p>
            <p className="mt-1 text-xl font-extrabold text-amber-600">
              {formatearBs(reporteData.recaudacionPendiente)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs text-slate-500">Tickets vendidos</p>
            <p className="mt-1 text-xl font-extrabold text-indigo-700">
              {reporteData.ticketsPorEstado.VENDIDO} / {reporteData.rifa.cantidadTickets}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs text-slate-500">Avance de venta</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {reporteData.porcentajeVendido}%
            </p>
          </div>
        </section>
      )}

      {/* Premios */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Award className="h-5 w-5 text-amber-500" />
            Premios ({rifa.premios?.length || 0})
          </h2>
          {!esFinalizada && tienePermiso('premios', 'crud') && (
            <Button size="sm" onClick={abrirCrearPremio}>
              <Plus className="h-4 w-4" />
              Agregar premio
            </Button>
          )}
        </div>

        {!rifa.premios?.length ? (
          <p className="text-sm text-amber-700">
            Esta rifa aún no tiene premios activos. Debes registrar al menos uno para que pueda recibir reservas y realizar el sorteo.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {rifa.premios.map((p) => (
              <div
                key={p.premioId}
                className="flex flex-col justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{p.nombre}</h3>
                    {p.valor && (
                      <span className="text-xs font-semibold text-emerald-700">
                        {formatearBs(p.valor)}
                      </span>
                    )}
                  </div>
                  {p.descripcion && <p className="mt-1 text-xs text-slate-600">{p.descripcion}</p>}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  {!esFinalizada && tienePermiso('premios', 'crud') && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => abrirEditarPremio(p)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPremioAEliminar(p)}>
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  )}

                  {p.ticketGanadorId && (
                    <div className="flex items-center gap-2">
                      {p.reclamado ? (
                        <Badge color="emerald">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Entregado
                        </Badge>
                      ) : (
                        tienePermiso('ganadores', 'publicar') && (
                          <Button
                            size="sm"
                            variant="amber"
                            onClick={() => {
                              setModalEntrega(p);
                              setDatosEntrega('');
                            }}
                          >
                            Registrar entrega
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Extensión y Sorteo */}
      {!esFinalizada && (
        <div className="grid gap-6 md:grid-cols-2">
          {tienePermiso('rifas', 'administrar') && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <CalendarClock className="h-5 w-5 text-sky-600" />
                Extender fecha de cierre
              </h2>
              <form onSubmit={handleExtender} className="space-y-3">
                <Input
                  label="Nueva fecha de cierre (La Paz)"
                  type="datetime-local"
                  required
                  value={nuevaFechaFin || aDatetimeLocalLaPaz(rifa.fechaFin)}
                  onChange={(e) => setNuevaFechaFin(e.target.value)}
                />
                <Button type="submit" variant="secondary" loading={extendiendo}>
                  Extender rifa
                </Button>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Trophy className="h-5 w-5 text-amber-500" />
              Cierre y sorteo
            </h2>
            <p className="text-xs text-slate-600">
              El sorteo selecciona ganadores aleatoriamente entre los tickets VENDIDOS y cierra la rifa de forma irreversible.
            </p>
            <div className="flex flex-wrap gap-2">
              {tienePermiso('sorteos', 'realizar') && (
                <Button variant="amber" onClick={() => setConfirmSorteoOpen(true)}>
                  <Trophy className="h-4 w-4" />
                  Realizar sorteo
                </Button>
              )}
              {tienePermiso('rifas', 'administrar') && (
                <Button variant="danger" onClick={() => setConfirmFinalizarOpen(true)}>
                  Finalizar sin ventas
                </Button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Modal Crear/Editar Premio */}
      <Modal
        open={Boolean(modalPremio)}
        onClose={() => setModalPremio(null)}
        title={modalPremio?.modo === 'editar' ? 'Editar premio' : 'Nuevo premio'}
      >
        <form onSubmit={handleGuardarPremio} className="space-y-4">
          <Input
            label="Nombre del premio"
            required
            value={formPremio.nombre}
            onChange={(e) => setFormPremio((f) => ({ ...f, nombre: e.target.value }))}
          />
          <Textarea
            label="Descripción"
            value={formPremio.descripcion}
            onChange={(e) => setFormPremio((f) => ({ ...f, descripcion: e.target.value }))}
          />
          <Input
            label="Valor referencial (Bs)"
            type="number"
            step="0.01"
            min="1"
            value={formPremio.valor}
            onChange={(e) => setFormPremio((f) => ({ ...f, valor: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalPremio(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardandoPremio}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación desactivar premio */}
      <ConfirmModal
        open={Boolean(premioAEliminar)}
        onClose={() => setPremioAEliminar(null)}
        onConfirm={handleDesactivarPremio}
        loading={desactivandoPremio}
        title="Desactivar premio"
        message={`¿Seguro que deseas desactivar el premio "${premioAEliminar?.nombre}"?`}
        confirmText="Sí, desactivar"
      />

      {/* Confirmación irreversible sorteo */}
      <ConfirmModal
        open={confirmSorteoOpen}
        onClose={() => setConfirmSorteoOpen(false)}
        onConfirm={handleRealizarSorteo}
        loading={sorteando}
        variant="amber"
        title="Confirmar realización de sorteo"
        message="Esta acción es irreversible: sorteará todos los premios activos entre los tickets vendidos y finalizará la rifa."
        confirmText="Ejecutar sorteo ahora"
      >
        <div className="mt-4 space-y-3">
          {esAdmin && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={forzarSorteo}
                onChange={(e) => setForzarSorteo(e.target.checked)}
              />
              Forzar sorteo antes de fechaFin (solo admin)
            </label>
          )}
          <Textarea
            label={forzarSorteo ? 'Observación (obligatoria al forzar)' : 'Observación (opcional)'}
            value={obsSorteo}
            onChange={(e) => setObsSorteo(e.target.value)}
          />
        </div>
      </ConfirmModal>

      {/* Confirmación finalizar sin ventas */}
      <ConfirmModal
        open={confirmFinalizarOpen}
        onClose={() => setConfirmFinalizarOpen(false)}
        onConfirm={handleFinalizarSinVentas}
        loading={finalizando}
        title="Finalizar rifa sin ventas"
        message="Esta acción cerrará la rifa definitivamente. Solo procede si no existen tickets vendidos."
        confirmText="Finalizar rifa"
      >
        <div className="mt-3">
          <Input
            label="Motivo de cierre"
            required
            placeholder="Ej. Sin ventas al cierre"
            value={motivoFinalizar}
            onChange={(e) => setMotivoFinalizar(e.target.value)}
          />
        </div>
      </ConfirmModal>

      {/* Modal entrega de premio */}
      <Modal
        open={Boolean(modalEntrega)}
        onClose={() => setModalEntrega(null)}
        title={`Registrar entrega · ${modalEntrega?.nombre || ''}`}
      >
        <form onSubmit={handleRegistrarEntrega} className="space-y-4">
          <Textarea
            label="Datos de entrega / constancia"
            placeholder="Ej. Entregado presencialmente con firma de acta"
            value={datosEntrega}
            onChange={(e) => setDatosEntrega(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalEntrega(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardandoEntrega}>
              Confirmar entrega
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
