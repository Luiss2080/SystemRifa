import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  HeartHandshake,
  RefreshCw,
  Search,
  ShoppingCart,
  Trophy,
} from 'lucide-react';
import {
  getDetalleRifa,
  getMisTickets,
  getTicketsRifa,
  liberarReservasRifa,
  registrarPago,
  reservarTicketsRifa,
} from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { extraerErrorApi } from '../utils/apiError.js';
import { formatearBs, formatearFecha, multiplicarMontoBs } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const MAX_SELECCION = 10;
const BLOQUE_TAMANO = 100;

function Countdown({ targetIso }) {
  const [segundosRestantes, setSegundosRestantes] = useState(() =>
    Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const update = () => {
      setSegundosRestantes(
        Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000))
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  const min = Math.floor(segundosRestantes / 60);
  const seg = segundosRestantes % 60;
  return (
    <span className="font-mono font-bold">
      {String(min).padStart(2, '0')}:{String(seg).padStart(2, '0')}
    </span>
  );
}

export function RifaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { autenticado } = useAuth();

  const storageKey = `rifa_sel_${id}`;
  const [seleccionados, setSeleccionados] = useState(() => {
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [bloqueIdx, setBloqueIdx] = useState(0);
  const [busquedaNumero, setBusquedaNumero] = useState('');
  const [conflictoNumeros, setConflictoNumeros] = useState([]);
  const [reservando, setReservando] = useState(false);

  // Estado para modal de pago después de reservar
  const [reservaActiva, setReservaActiva] = useState(null);
  const [ticketsReservadosIds, setTicketsReservadosIds] = useState([]);
  const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA_QR');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [enviandoPago, setEnviandoPago] = useState(false);
  const [liberando, setLiberando] = useState(false);

  const { data: detalleData, isLoading: loadingDetalle, error: errorDetalle } = useQuery({
    queryKey: ['rifa-detalle', id],
    queryFn: () => getDetalleRifa(id),
  });

  const {
    data: ticketsData,
    isLoading: loadingTickets,
    refetch: refetchTickets,
    isFetching: fetchingTickets,
  } = useQuery({
    queryKey: ['rifa-tickets', id],
    queryFn: () => getTicketsRifa(id),
    refetchInterval: 10000,
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(seleccionados));
    } catch {
      // Ignora restricciones de sessionStorage
    }
  }, [seleccionados, storageKey]);

  const rifa = detalleData?.rifa;
  const tickets = useMemo(() => ticketsData?.items || [], [ticketsData]);

  // Limpia de la selección los números que ya dejaron de estar DISPONIBLE
  useEffect(() => {
    if (!tickets.length) return;
    const disponiblesSet = new Set(
      tickets.filter((t) => t.estado === 'DISPONIBLE').map((t) => t.numeroTicket)
    );
    setSeleccionados((prev) => prev.filter((n) => disponiblesSet.has(n)));
  }, [tickets]);

  const bloques = useMemo(() => {
    const total = tickets.length;
    const cantBloques = Math.max(1, Math.ceil(total / BLOQUE_TAMANO));
    return Array.from({ length: cantBloques }, (_, idx) => {
      const inicio = idx * BLOQUE_TAMANO + 1;
      const fin = Math.min(total, (idx + 1) * BLOQUE_TAMANO);
      return { idx, label: `${inicio}-${fin}` };
    });
  }, [tickets.length]);

  const ticketsVisibles = useMemo(() => {
    const numBuscado = busquedaNumero.trim();
    if (numBuscado) {
      return tickets.filter((t) => String(t.numeroTicket).includes(numBuscado));
    }
    const start = bloqueIdx * BLOQUE_TAMANO;
    return tickets.slice(start, start + BLOQUE_TAMANO);
  }, [tickets, bloqueIdx, busquedaNumero]);

  if (loadingDetalle) return <FullPageSpinner message="Cargando detalle de la rifa..." />;

  if (errorDetalle || !rifa) {
    return (
      <EmptyState
        title="No se encontró la rifa"
        description={extraerErrorApi(errorDetalle).message}
        action={
          <Link to="/">
            <Button variant="secondary">Volver al catálogo</Button>
          </Link>
        }
      />
    );
  }

  const rifaAbierta =
    rifa.estado !== 'FINALIZADA' && new Date(rifa.fechaFin).getTime() > Date.now();
  const totalBs = multiplicarMontoBs(rifa.precioTicket, seleccionados.length);

  function toggleNumero(ticket) {
    if (!rifaAbierta || ticket.estado !== 'DISPONIBLE') return;
    setConflictoNumeros([]);
    setSeleccionados((prev) => {
      if (prev.includes(ticket.numeroTicket)) {
        return prev.filter((n) => n !== ticket.numeroTicket);
      }
      if (prev.length >= MAX_SELECCION) {
        toast.info('Límite alcanzado', `Puedes seleccionar hasta ${MAX_SELECCION} números por reserva.`);
        return prev;
      }
      return [...prev, ticket.numeroTicket].sort((a, b) => a - b);
    });
  }

  async function handleReservar() {
    if (!seleccionados.length) return;
    if (!autenticado) {
      toast.info('Inicia sesión', 'Debes iniciar sesión para reservar tus números.');
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    setReservando(true);
    setConflictoNumeros([]);
    try {
      const res = await reservarTicketsRifa(rifa.rifaId, seleccionados);
      // Obtenemos los ticketIds recién reservados desde /tickets/mios para poder registrar el pago
      const mis = await getMisTickets();
      const setNums = new Set(res.numeros);
      const ids = (mis.items || [])
        .filter(
          (t) =>
            Number(t.rifaId) === Number(rifa.rifaId) &&
            t.estado === 'RESERVADO' &&
            !t.pagoId &&
            setNums.has(t.numeroTicket)
        )
        .map((t) => t.ticketId);

      setTicketsReservadosIds(ids);
      setReservaActiva(res);
      setSeleccionados([]);
      window.sessionStorage.removeItem(storageKey);
      await refetchTickets();
      queryClient.invalidateQueries({ queryKey: ['rifa-detalle', id] });
      toast.success(
        'Reserva confirmada',
        `Reservaste ${res.numeros.length} número(s). Completa el pago antes de que expire el tiempo.`
      );
    } catch (err) {
      const apiErr = extraerErrorApi(err);
      if (apiErr.status === 409 && Array.isArray(apiErr.details?.noDisponibles)) {
        const noDisp = apiErr.details.noDisponibles;
        setConflictoNumeros(noDisp);
        setSeleccionados((prev) => prev.filter((n) => !noDisp.includes(n)));
        await refetchTickets();
        toast.error(
          'Números no disponibles',
          `Los números ${noDisp.join(', ')} ya fueron tomados. Conservamos el resto de tu selección.`
        );
      } else {
        toast.error('No se pudo reservar', apiErr.message);
      }
    } finally {
      setReservando(false);
    }
  }

  async function handleRegistrarPago(e) {
    e.preventDefault();
    if (!ticketsReservadosIds.length) {
      toast.error('Error', 'No se encontraron los tickets reservados. Ve a "Mis tickets".');
      return;
    }

    setEnviandoPago(true);
    try {
      await registrarPago({
        rifaId: rifa.rifaId,
        ticketIds: ticketsReservadosIds,
        metodo: metodoPago,
        referencia: referenciaPago.trim() || null,
      });
      setReservaActiva(null);
      setReferenciaPago('');
      queryClient.invalidateQueries({ queryKey: ['mis-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pagos'] });
      toast.success(
        'Pago registrado',
        'Tu pago quedó en estado PENDIENTE de verificación por un administrador.'
      );
      navigate('/mis-pagos');
    } catch (err) {
      toast.error('Error al registrar pago', extraerErrorApi(err).message);
    } finally {
      setEnviandoPago(false);
    }
  }

  async function handleLiberarReserva() {
    if (!reservaActiva) return;
    setLiberando(true);
    try {
      await liberarReservasRifa(rifa.rifaId, reservaActiva.numeros);
      setReservaActiva(null);
      setTicketsReservadosIds([]);
      await refetchTickets();
      queryClient.invalidateQueries({ queryKey: ['rifa-detalle', id] });
      toast.info('Reserva liberada', 'Los números quedaron disponibles nuevamente.');
    } catch (err) {
      toast.error('No se pudo liberar', extraerErrorApi(err).message);
    } finally {
      setLiberando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <HeartHandshake className="h-3.5 w-3.5" />
                {rifa.causa?.nombre}
              </span>
              <Badge estado={rifa.estado} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{rifa.nombre}</h1>
            {rifa.descripcion && <p className="max-w-3xl text-sm text-slate-600">{rifa.descripcion}</p>}
            {rifa.causa?.descripcion && (
              <p className="text-xs text-slate-500">
                <strong>Causa solidaria:</strong> {rifa.causa.descripcion}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-right">
              <p className="text-xs font-medium text-emerald-700">Precio por número</p>
              <p className="text-xl font-extrabold text-emerald-800">
                {formatearBs(rifa.precioTicket)}
              </p>
            </div>
            {rifa.estado === 'FINALIZADA' && (
              <Link to={`/rifas/${rifa.rifaId}/resultado`}>
                <Button variant="amber">
                  <Trophy className="h-4 w-4" />
                  Ver resultado del sorteo
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Cierre: {formatearFecha(rifa.fechaFin)}</span>
          </div>
          <div>
            Disponibles: <strong className="text-emerald-700">{rifa.conteos?.DISPONIBLE ?? 0}</strong>
          </div>
          <div>
            Reservados: <strong className="text-amber-700">{rifa.conteos?.RESERVADO ?? 0}</strong>
          </div>
          <div>
            Vendidos: <strong className="text-indigo-700">{rifa.conteos?.VENDIDO ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* Premios */}
      {rifa.premios?.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
            <Award className="h-5 w-5 text-amber-500" />
            Premios de la rifa
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rifa.premios.map((p) => (
              <div key={p.premioId} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-900">{p.nombre}</p>
                {p.descripcion && <p className="mt-1 text-xs text-slate-600">{p.descripcion}</p>}
                {p.valor && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Valor estimado: {formatearBs(p.valor)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aviso de conflicto 409 */}
      {conflictoNumeros.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Algunos números ya no estaban disponibles</p>
            <p className="text-xs">
              Se removieron de tu selección: <strong>{conflictoNumeros.join(', ')}</strong>. Puedes
              continuar con el resto de tus números o elegir otros disponibles.
            </p>
          </div>
        </div>
      )}

      {/* Selector y grilla */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tablero de números</h2>
              <p className="text-xs text-slate-500">
                Selecciona hasta {MAX_SELECCION} números disponibles (se actualiza cada 10s)
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={fetchingTickets}
              onClick={() => refetchTickets()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-emerald-700 bg-emerald-600" />
              Seleccionado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
              Reservado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-indigo-300 bg-indigo-100" />
              Vendido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-300 bg-slate-200" />
              Anulado
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar número..."
                className="pl-9"
                value={busquedaNumero}
                onChange={(e) => setBusquedaNumero(e.target.value)}
              />
            </div>

            {!busquedaNumero && bloques.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {bloques.map((b) => (
                  <button
                    key={b.idx}
                    type="button"
                    onClick={() => setBloqueIdx(b.idx)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      bloqueIdx === b.idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingTickets ? (
            <FullPageSpinner message="Cargando números..." />
          ) : (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {ticketsVisibles.map((t) => {
                const seleccionado = seleccionados.includes(t.numeroTicket);
                const disponible = t.estado === 'DISPONIBLE';
                let estilo = 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed';
                let textoEstado = t.estado === 'ANULADO' ? 'Anul.' : t.estado === 'VENDIDO' ? 'Vend.' : 'Res.';

                if (seleccionado) {
                  estilo =
                    'border-emerald-700 bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200 cursor-pointer';
                  textoEstado = 'Elegido';
                } else if (disponible && rifaAbierta) {
                  estilo =
                    'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100 cursor-pointer';
                  textoEstado = 'Disp.';
                } else if (t.estado === 'RESERVADO') {
                  estilo = 'border-amber-200 bg-amber-50 text-amber-800 cursor-not-allowed';
                } else if (t.estado === 'VENDIDO') {
                  estilo = 'border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed';
                }

                return (
                  <button
                    key={t.numeroTicket}
                    type="button"
                    disabled={!disponible || !rifaAbierta}
                    onClick={() => toggleNumero(t)}
                    title={`Número ${t.numeroTicket} - ${t.estado}`}
                    className={`flex flex-col items-center justify-center rounded-xl border py-2 text-center transition ${estilo}`}
                  >
                    <span className="text-sm font-bold leading-tight">{t.numeroTicket}</span>
                    <span className="text-[10px] opacity-80">{textoEstado}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumen de selección */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:sticky lg:top-20">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            Tu selección
          </h2>

          {!rifaAbierta ? (
            <p className="mt-3 text-sm text-slate-500">
              Esta rifa ya no admite nuevas reservas.
            </p>
          ) : seleccionados.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Haz clic en los números disponibles del tablero para agregarlos a tu reserva.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {seleccionados.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSeleccionados((prev) => prev.filter((x) => x !== n))}
                    className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                    title="Quitar número"
                  >
                    #{n} ×
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Cantidad</span>
                  <strong>{seleccionados.length} ticket(s)</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Precio unitario</span>
                  <span>{formatearBs(rifa.precioTicket)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total a pagar</span>
                  <span className="text-emerald-700">{formatearBs(totalBs)}</span>
                </div>
              </div>

              <Button className="w-full" loading={reservando} onClick={handleReservar}>
                {autenticado ? 'Reservar y pagar' : 'Iniciar sesión para reservar'}
              </Button>
            </div>
          )}
        </aside>
      </section>

      {/* Modal de pago tras reserva */}
      <Modal
        open={Boolean(reservaActiva)}
        onClose={() => setReservaActiva(null)}
        title="Completar pago de reserva"
        description="Tus números están reservados temporalmente. Registra tu comprobante antes de que venza el tiempo."
      >
        {reservaActiva && (
          <form onSubmit={handleRegistrarPago} className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-amber-600" />
                Tiempo restante de reserva
              </span>
              <Countdown targetIso={reservaActiva.reservadoHasta} />
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 text-sm space-y-1">
              <p>
                <strong>Números:</strong> {reservaActiva.numeros.map((n) => `#${n}`).join(', ')}
              </p>
              <p>
                <strong>Total a pagar:</strong>{' '}
                <span className="font-bold text-emerald-700">
                  {formatearBs(reservaActiva.montoTotal)}
                </span>
              </p>
            </div>

            <Select
              label="Método de pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              options={[
                { value: 'TRANSFERENCIA_QR', label: 'Transferencia / QR Bancario' },
                { value: 'TRANSFERENCIA_BANCARIA', label: 'Transferencia bancaria directa' },
                { value: 'EFECTIVO', label: 'Efectivo' },
              ]}
            />

            <Input
              label="Número de referencia o comprobante"
              placeholder="Ej. QR-847291 o N° de transacción"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              helperText="Un administrador verificará tu comprobante para confirmar los tickets"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={liberando}
                onClick={handleLiberarReserva}
              >
                Liberar reserva
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setReservaActiva(null)}>
                  Pagar después
                </Button>
                <Button type="submit" loading={enviandoPago}>
                  Enviar comprobante
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

