import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, CreditCard, Ticket, Trash2 } from 'lucide-react';
import {
  getMisTickets,
  liberarReservasRifa,
  registrarPago,
} from '../features/rifas/publicApi.js';
import { extraerErrorApi } from '../utils/apiError.js';
import { formatearBs, formatearFecha, sumarMontosBs } from '../utils/format.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState, FullPageSpinner } from '../components/ui/Feedback.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export function MisTicketsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [filtroEstado, setFiltroEstado] = useState('');
  const [grupoAPagar, setGrupoAPagar] = useState(null);
  const [metodo, setMetodo] = useState('TRANSFERENCIA_QR');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-tickets'],
    queryFn: getMisTickets,
    refetchInterval: 15000,
  });

  const tickets = useMemo(() => {
    const items = data?.items || [];
    if (!filtroEstado) return items;
    return items.filter((t) => t.estado === filtroEstado);
  }, [data, filtroEstado]);

  // Agrupamos tickets RESERVADO sin pagoId por rifaId para facilitar el pago o liberación
  const reservasSinPagoPorRifa = useMemo(() => {
    const map = new Map();
    for (const t of data?.items || []) {
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
  }, [data]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis tickets</h1>
          <p className="text-sm text-slate-500">
            Revisa tus números reservados, vendidos y completa pagos pendientes
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select
            label="Filtrar por estado"
            placeholder="Todos"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: 'RESERVADO', label: 'Reservados' },
              { value: 'VENDIDO', label: 'Vendidos' },
              { value: 'ANULADO', label: 'Anulados' },
            ]}
          />
        </div>
      </div>

      {reservasSinPagoPorRifa.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
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
                  className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{grupo.nombreRifa}</h3>
                      <p className="text-xs text-amber-800">
                        Vence: {formatearFecha(expira)}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-800">{formatearBs(total)}</span>
                  </div>

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
              );
            })}
          </div>
        </section>
      )}

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tienes tickets registrados"
          description="Explora el catálogo de rifas solidarias para reservar tus números."
          action={
            <Link to="/">
              <Button>Ver rifas activas</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-500">Ticket</span>
                  <p className="text-2xl font-extrabold text-slate-900">#{t.numeroTicket}</p>
                </div>
                <Badge estado={t.estado} />
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <Link
                  to={`/rifas/${t.rifaId}`}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  {t.rifa?.nombre}
                </Link>
                <p className="text-xs text-slate-500">
                  Precio: {formatearBs(t.rifa?.precioTicket || '0')}
                </p>
                {t.pago && (
                  <p className="text-xs text-slate-600">
                    Pago #{t.pago.pagoId}: <Badge estado={t.pago.estado} />
                  </p>
                )}
                {t.estado === 'RESERVADO' && t.reservadoHasta && !t.pagoId && (
                  <p className="text-xs text-amber-700">
                    Reserva vence: {formatearFecha(t.reservadoHasta)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(grupoAPagar)}
        onClose={() => setGrupoAPagar(null)}
        title={`Registrar pago · ${grupoAPagar?.nombreRifa || ''}`}
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

