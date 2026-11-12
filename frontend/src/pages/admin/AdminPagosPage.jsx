import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Info, X } from 'lucide-react';
import { getPagosAdminApi, verificarPagoAdminApi } from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { formatearBs, formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function AdminPagosPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [estado, setEstado] = useState('PENDIENTE');
  const [page, setPage] = useState(1);

  const [pagoConfirmar, setPagoConfirmar] = useState(null);
  const [pagoRechazar, setPagoRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pagos', { estado, page }],
    queryFn: () =>
      getPagosAdminApi({
        page,
        limit: 15,
        ...(estado ? { estado } : {}),
      }),
  });

  async function handleConfirmar() {
    if (!pagoConfirmar) return;
    setProcesando(true);
    try {
      await verificarPagoAdminApi(pagoConfirmar.pagoId, { aprobado: true });
      setPagoConfirmar(null);
      queryClient.invalidateQueries({ queryKey: ['admin-pagos'] });
      toast.success('Pago confirmado', 'Los tickets pasaron a estado VENDIDO.');
    } catch (err) {
      toast.error('Error al confirmar', extraerErrorApi(err).message);
    } finally {
      setProcesando(false);
    }
  }

  async function handleRechazar(e) {
    e.preventDefault();
    if (!pagoRechazar || !motivoRechazo.trim()) {
      toast.error('Motivo obligatorio', 'Debes escribir el motivo del rechazo.');
      return;
    }
    setProcesando(true);
    try {
      await verificarPagoAdminApi(pagoRechazar.pagoId, {
        aprobado: false,
        motivo: motivoRechazo.trim(),
      });
      setPagoRechazar(null);
      setMotivoRechazo('');
      queryClient.invalidateQueries({ queryKey: ['admin-pagos'] });
      toast.info('Pago rechazado', 'Los tickets fueron liberados.');
    } catch (err) {
      toast.error('Error al rechazar', extraerErrorApi(err).message);
    } finally {
      setProcesando(false);
    }
  }

  const columns = [
    { key: 'pagoId', label: 'ID', render: (r) => `#${r.pagoId}` },
    {
      key: 'usuario',
      label: 'Participante',
      render: (r) => (
        <div>
          <p className="font-semibold">{r.usuario?.alias || `ID ${r.usuarioId}`}</p>
          <p className="text-xs text-slate-500">{r.usuario?.email}</p>
        </div>
      ),
    },
    {
      key: 'rifa',
      label: 'Rifa / Números',
      render: (r) => (
        <div>
          <p className="font-medium">{r.rifa?.nombre}</p>
          <p className="text-xs text-slate-500">
            {(r.tickets || []).map((t) => `#${t.numeroTicket}`).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'monto',
      label: 'Monto',
      render: (r) => <span className="font-bold text-emerald-700">{formatearBs(r.monto)}</span>,
    },
    {
      key: 'metodo',
      label: 'Método / Ref.',
      render: (r) => (
        <div className="text-xs">
          <p className="font-medium">{r.metodo}</p>
          <p className="text-slate-500">{r.referencia || 'Sin referencia'}</p>
        </div>
      ),
    },
    { key: 'estado', label: 'Estado', render: (r) => <Badge estado={r.estado} /> },
    { key: 'fecha', label: 'Fecha', render: (r) => formatearFecha(r.fecha) },
    {
      key: 'acciones',
      label: 'Verificar',
      render: (r) =>
        r.estado === 'PENDIENTE' ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => setPagoConfirmar(r)}>
              <Check className="h-3.5 w-3.5" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setPagoRechazar(r);
                setMotivoRechazo('');
              }}
            >
              <X className="h-3.5 w-3.5" />
              Rechazar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Verificado</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verificación de pagos</h1>
          <p className="text-sm text-slate-500">
            Confirma comprobantes válidos o rechaza pagos inconsistentes
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'PENDIENTE', label: 'Pendientes' },
            { key: 'CONFIRMADO', label: 'Confirmados' },
            { key: 'RECHAZADO', label: 'Rechazados' },
            { key: '', label: 'Todos' },
          ].map((tab) => (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => {
                setEstado(tab.key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                estado === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-xs">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Al confirmar un pago, sus tickets asociados pasan inmediatamente a <strong>VENDIDO</strong>{' '}
          y se notifica al participante. Si se rechaza, los números regresan al tablero disponible.
        </span>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        rowKey="pagoId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Sin pagos para este filtro"
      />

      <ConfirmModal
        open={Boolean(pagoConfirmar)}
        onClose={() => setPagoConfirmar(null)}
        onConfirm={handleConfirmar}
        loading={procesando}
        variant="primary"
        title="Confirmar pago"
        message={`¿Confirmar el pago #${pagoConfirmar?.pagoId} por ${formatearBs(
          pagoConfirmar?.monto
        )}? Los tickets pasarán a VENDIDO de forma permanente.`}
        confirmText="Confirmar pago"
      >
        {pagoConfirmar && (
          <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
            <p>
              <strong>Participante:</strong> {pagoConfirmar.usuario?.alias || `ID ${pagoConfirmar.usuarioId}`}
            </p>
            <p>
              <strong>Rifa:</strong> {pagoConfirmar.rifa?.nombre || `Rifa #${pagoConfirmar.rifaId}`}
            </p>
            <p>
              <strong>Números:</strong>{' '}
              {(pagoConfirmar.tickets || []).map((t) => `#${t.numeroTicket}`).join(', ') || '—'}
            </p>
            {pagoConfirmar.referencia && (
              <p>
                <strong>Referencia:</strong> {pagoConfirmar.referencia}
              </p>
            )}
          </div>
        )}
      </ConfirmModal>

      <Modal
        open={Boolean(pagoRechazar)}
        onClose={() => setPagoRechazar(null)}
        title={`Rechazar pago #${pagoRechazar?.pagoId || ''}`}
      >
        <form onSubmit={handleRechazar} className="space-y-4">
          <Textarea
            label="Motivo del rechazo"
            required
            placeholder="Ej. Comprobante ilegible o monto incompleto"
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPagoRechazar(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={procesando}>
              Rechazar y liberar tickets
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

