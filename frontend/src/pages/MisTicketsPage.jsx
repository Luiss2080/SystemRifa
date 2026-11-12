import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Search,
  Ticket,
  Trash2,
} from 'lucide-react';
import {
  getMisTickets,
  liberarReservasRifa,
  registrarPago,
} from '../features/rifas/publicApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { formatearBs, formatearFecha, sumarMontosBs } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PaginationCard } from '../components/ui/DataTable.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { PanelFilterBar, PanelKpiGrid, PanelSectionHeader } from '../components/panel/PanelKit.jsx';

const RESERVA_SEGUNDOS = 15 * 60;

function CountdownReserva({ targetIso }) {
  const [seg, setSeg] = useState(() =>
    Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const update = () =>
      setSeg(Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const min = Math.floor(seg / 60);
  const rem = seg % 60;
  const pct = Math.min(100, Math.max(0, Math.round((seg / RESERVA_SEGUNDOS) * 100)));
  const critico = seg <= 180;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={critico ? 'font-semibold text-rose-700' : 'text-amber-800'}>
          {seg === 0 ? 'Reserva expirada' : `Vence: ${formatearFecha(targetIso)}`}
        </span>
        <span className={`font-mono font-bold ${critico ? 'text-rose-700' : 'text-amber-900'}`}>
          {String(min).padStart(2, '0')}:{String(rem).padStart(2, '0')}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200/70">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            critico ? 'bg-rose-500' : 'bg-amber-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MisTicketsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [grupoAPagar, setGrupoAPagar] = useState(null);
  const [metodo, setMetodo] = useState('TRANSFERENCIA_QR');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-tickets'],
    queryFn: getMisTickets,
    refetchInterval: 15000,
  });

  const todosTickets = useMemo(() => data?.items || [], [data]);

  const conteos = useMemo(() => {
    const map = { TOTAL: todosTickets.length, RESERVADO: 0, VENDIDO: 0, ANULADO: 0 };
    for (const t of todosTickets) {
      if (map[t.estado] !== undefined) map[t.estado] += 1;
    }
    return map;
  }, [todosTickets]);

  const tickets = useMemo(() => {
    const byEstado = !filtroEstado
      ? todosTickets
      : todosTickets.filter((t) => t.estado === filtroEstado);
    const q = busqueda.trim().toLowerCase();
    if (!q) return byEstado;
    return byEstado.filter(
      (t) =>
        String(t.numeroTicket).includes(q) ||
        (t.rifa?.nombre || '').toLowerCase().includes(q)
    );
  }, [todosTickets, filtroEstado, busqueda]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const ticketsPaginados = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, safePage]);

  // Agrupamos tickets RESERVADO sin pagoId por rifaId para facilitar el pago o liberación
  const reservasSinPagoPorRifa = useMemo(() => {
    const map = new Map();
    for (const t of todosTickets) {
      if (t.estado === 'RESERVADO' && !t.pagoId) {
        if (!map.has(t.rifaId)) {
          map.set(t.rifaId, {
            rifaId: t.rifaId,
            nombreRifa: t.rifa?.nombre || `Rifa #${t.rifaId}`,
            tickets: [],
          });
        }
        map.get(t.rifaId).tickets.push(t);
      }
    }
    return Array.from(map.values());
  }, [todosTickets]);

  async function handleLiberar(rifaId, numeros) {
    try {
      await liberarReservasRifa(rifaId, numeros);
      queryClient.invalidateQueries({ queryKey: ['mis-tickets'] });
      toast.info('Reserva liberada', 'Los números volvieron a estar disponibles.');
    } catch (err) {
      toast.error('Error al liberar', extraerErrorApi(err).message);
    }
  }

  async function handlePagarGrupo(e) {
    e.preventDefault();
    if (!grupoAPagar) return;
    setEnviando(true);
    try {
      await registrarPago({
        rifaId: grupoAPagar.rifaId,
        ticketIds: grupoAPagar.tickets.map((t) => t.ticketId),
        metodo,
        referencia: referencia.trim() || null,
      });
      setGrupoAPagar(null);
      setReferencia('');
      queryClient.invalidateQueries({ queryKey: ['mis-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pagos'] });
      toast.success('Pago registrado', 'Tu pago quedó pendiente de verificación.');
      navigate('/mis-pagos');
    } catch (err) {
      toast.error('No se pudo registrar el pago', extraerErrorApi(err).message);
    } finally {
      setEnviando(false);
    }
  }

  if (isLoading) return <FullPageSpinner message="Cargando tus tickets..." />;

  const filtros = [
    { key: '', label: `Todos (${conteos.TOTAL})` },
    { key: 'RESERVADO', label: `Reservados (${conteos.RESERVADO})` },
    { key: 'VENDIDO', label: `Vendidos (${conteos.VENDIDO})` },
    { key: 'ANULADO', label: `Anulados (${conteos.ANULADO})` },
  ];

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Billetera Digital de Participación"
        subtitle="Administra tus talones reservados, confirma pagos pendientes y conserva tus números oficiales."
        searchValue={busqueda}
        onSearchChange={(val) => {
          setBusqueda(val);
          setPage(1);
        }}
        searchPlaceholder="Buscar por número de ticket o nombre de rifa..."
        hasActiveFilters={Boolean(busqueda || filtroEstado)}
        onResetFilters={() => {
          setBusqueda('');
          setFiltroEstado('');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado del ticket',
            value: filtroEstado,
            onChange: (val) => {
              setFiltroEstado(val);
              setPage(1);
            },
            options: filtros.map((f) => ({ value: f.key, label: f.label })),
          },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/explorar">
              <Button variant="secondary" size="sm">
                <Search className="h-4 w-4 text-emerald-600" />
                Explorar rifas
              </Button>
            </Link>
            <Link to="/mis-pagos">
              <Button size="sm">
                <CreditCard className="h-4 w-4" />
                Mis pagos
              </Button>
            </Link>
          </div>
        }
      />

      <PanelSectionHeader
        icon={Ticket}
        title="Talonario Oficial del Participante"
        subtitle="Seguimiento en vivo de reservas y comprobantes acreditados"
        badgeText={`${tickets.length} Talones visibles`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total tickets',
            value: conteos.TOTAL,
            trendText: 'Historial completo',
            icon: Ticket,
            accent: 'indigo',
          },
          {
            label: 'Vendidos confirmados',
            value: conteos.VENDIDO,
            trendText: 'Participando en sorteos',
            icon: CheckCircle2,
            accent: 'emerald',
          },
          {
            label: 'Reservados activos',
            value: conteos.RESERVADO,
            trendText: 'Pendientes de pago/validación',
            icon: Clock,
            accent: 'amber',
          },
        ]}
      />

      {reservasSinPagoPorRifa.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700">
            <Clock className="h-4 w-4" />
            Reservas activas pendientes de pago
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reservasSinPagoPorRifa.map((grupo) => {
              const total = sumarMontosBs(grupo.tickets.map((t) => t.rifa?.precioTicket || '0'));
              const expira = grupo.tickets[0]?.reservadoHasta;
              return (
                <div
                  key={grupo.rifaId}
                  className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 shadow-sm"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{grupo.nombreRifa}</h3>
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-sm font-extrabold text-emerald-800">
                        {formatearBs(total)}
                      </span>
                    </div>

                    {expira && <CountdownReserva targetIso={expira} />}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {grupo.tickets.map((t) => (
                        <span
                          key={t.ticketId}
                          className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-800 ring-1 ring-amber-200"
                        >
                          #{t.numeroTicket}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setGrupoAPagar({ ...grupo, total })}>
                        <CreditCard className="h-4 w-4" />
                        Registrar pago
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleLiberar(
                            grupo.rifaId,
                            grupo.tickets.map((t) => t.numeroTicket)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        Liberar reserva
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={filtroEstado || busqueda ? 'Sin coincidencias en tus tickets' : 'No tienes tickets registrados'}
          description="Explora el catálogo de rifas solidarias para reservar tus números."
          action={
            filtroEstado || busqueda ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setFiltroEstado('');
                  setBusqueda('');
                  setPage(1);
                }}
              >
                Ver todos
              </Button>
            ) : (
              <Link to="/explorar">
                <Button>Ver rifas activas</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {ticketsPaginados.map((t) => {
              const stubBg =
                t.estado === 'VENDIDO'
                  ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white border-emerald-200/70'
                  : t.estado === 'RESERVADO'
                  ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white border-amber-200/70'
                  : 'bg-gradient-to-b from-slate-500 to-slate-600 text-white border-slate-300';
              return (
                <div
                  key={t.ticketId}
                  className="flex overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  {/* Talón perforado izquierdo con el número */}
                  <div
                    className={`flex w-28 shrink-0 flex-col items-center justify-center border-r-2 border-dashed p-3 text-center ${stubBg}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest opacity-85">
                      Ticket
                    </span>
                    <span className="mt-0.5 font-mono text-2xl font-black tracking-tight">
                      #{t.numeroTicket}
                    </span>
                    <span className="mt-1.5 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">
                      {t.estado}
                    </span>
                  </div>

                  {/* Cuerpo del comprobante */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">{t.rifa?.nombre}</p>
                        <Badge estado={t.estado} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Valor unitario:{' '}
                        <span className="font-bold text-emerald-700">
                          {formatearBs(t.rifa?.precioTicket || '0')}
                        </span>
                      </p>
                      {t.pago && (
                        <p className="text-xs text-slate-600">
                          Pago #{t.pago.pagoId}: <Badge estado={t.pago.estado} />
                        </p>
                      )}
                      {t.estado === 'RESERVADO' && t.reservadoHasta && !t.pagoId && (
                        <p className="text-xs font-medium text-amber-700">
                          Reserva vence: {formatearFecha(t.reservadoHasta)}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5">
                      <Link to={`/rifas/${t.rifaId}`}>
                        <Button variant="secondary" size="sm">
                          Ver rifa
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationCard
            page={safePage}
            totalPages={totalPages}
            total={tickets.length}
            showingFrom={(safePage - 1) * pageSize + 1}
            showingTo={Math.min(safePage * pageSize, tickets.length)}
            onPageChange={setPage}
            itemLabel="tickets"
          />
        </>
      )}

      <Modal
        open={Boolean(grupoAPagar)}
        onClose={() => setGrupoAPagar(null)}
        title={`Registrar pago · ${grupoAPagar?.nombreRifa || ''}`}
        description="Envía la referencia de tu transferencia o comprobante antes de que expire la reserva."
        badge="Pago de reserva"
        icon={CreditCard}
      >
        {grupoAPagar && (
          <form onSubmit={handlePagarGrupo} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p>
                <strong>Números:</strong>{' '}
                {grupoAPagar.tickets.map((t) => `#${t.numeroTicket}`).join(', ')}
              </p>
              <p className="mt-1">
                <strong>Monto total:</strong>{' '}
                <span className="font-bold text-emerald-700">{formatearBs(grupoAPagar.total)}</span>
              </p>
            </div>

            <Select
              label="Método de pago"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              options={[
                { value: 'TRANSFERENCIA_QR', label: 'Transferencia / QR Bancario' },
                { value: 'TRANSFERENCIA_BANCARIA', label: 'Transferencia bancaria directa' },
                { value: 'EFECTIVO', label: 'Efectivo' },
              ]}
            />

            <Input
              label="Referencia o comprobante"
              placeholder="N° de operación o nota"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setGrupoAPagar(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={enviando}>
                Confirmar envío de pago
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
