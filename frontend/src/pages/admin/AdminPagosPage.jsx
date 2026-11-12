import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Info,
  SlidersHorizontal,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { getPagosAdminApi, verificarPagoAdminApi } from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { formatearBs, formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

export function AdminPagosPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [estado, setEstado] = useState('PENDIENTE');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recientes');
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

  const pagosBase = useMemo(() => data?.items || [], [data]);

  const pagosVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrados = q
      ? pagosBase.filter(
          (p) =>
            p.usuario?.alias?.toLowerCase().includes(q) ||
            p.usuario?.email?.toLowerCase().includes(q) ||
            p.rifa?.nombre?.toLowerCase().includes(q) ||
            p.referencia?.toLowerCase().includes(q) ||
            String(p.pagoId).includes(q)
        )
      : pagosBase;

    return [...filtrados].sort((a, b) => {
      if (orden === 'monto_desc') return Number(b.monto || 0) - Number(a.monto || 0);
      if (orden === 'monto_asc') return Number(a.monto || 0) - Number(b.monto || 0);
      return b.pagoId - a.pagoId;
    });
  }, [pagosBase, busqueda, orden]);

  const totalGlobal = data?.pagination?.total ?? pagosBase.length;
  const montoVisible = pagosVisibles.reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const pendientesCount = pagosVisibles.filter((p) => p.estado === 'PENDIENTE').length;
  const confirmadosCount = pagosVisibles.filter((p) => p.estado === 'CONFIRMADO').length;

  const columns = [
    {
      key: 'usuario',
      label: 'Participante',
      icon: Users,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.usuario?.alias || `ID ${r.usuarioId}`}</p>
          <p className="text-xs text-slate-500">
            Pago #{r.pagoId} · {r.usuario?.email || 'Sin correo'}
          </p>
        </div>
      ),
    },
    {
      key: 'rifa',
      label: 'Rifa / Boletos',
      icon: Ticket,
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.rifa?.nombre}</p>
          <p className="text-xs font-medium text-emerald-700">
            {(r.tickets || []).map((t) => `#${t.numeroTicket}`).join(', ') || 'Sin boletos'}
          </p>
        </div>
      ),
    },
    {
      key: 'monto',
      label: 'Monto',
      icon: DollarSign,
      render: (r) => (
        <span className="text-base font-extrabold text-emerald-700">{formatearBs(r.monto)}</span>
      ),
    },
    {
      key: 'metodo',
      label: 'Método / Ref.',
      icon: CreditCard,
      render: (r) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{r.metodo}</p>
          <p className="text-slate-500">{r.referencia || 'Sin referencia'}</p>
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
      key: 'fecha',
      label: 'Fecha',
      icon: Calendar,
      render: (r) => <span className="text-xs text-slate-600">{formatearFecha(r.fecha)}</span>,
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (r) =>
        r.estado === 'PENDIENTE' ? (
          <div className="flex items-center gap-1.5">
            <RowActionButton
              icon={Check}
              label="Aprobar"
              tone="primary"
              onClick={() => setPagoConfirmar(r)}
            />
            <RowActionButton
              icon={X}
              title="Rechazar comprobante"
              tone="danger"
              onClick={() => {
                setPagoRechazar(r);
                setMotivoRechazo('');
              }}
            />
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            Procesado
          </span>
        ),
    },
  ];

  const hasFilters = Boolean(busqueda.trim() || estado !== 'PENDIENTE' || orden !== 'recientes');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Bandeja de Verificación de Pagos"
        subtitle="Validación de comprobantes, referencias bancarias y confirmación de boletos"
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por participante, email, rifa o referencia..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setBusqueda('');
          setEstado('PENDIENTE');
          setOrden('recientes');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado del pago',
            value: estado,
            onChange: (val) => {
              setEstado(val);
              setPage(1);
            },
            options: [
              { value: 'PENDIENTE', label: 'Pendientes de validar' },
              { value: 'CONFIRMADO', label: 'Confirmados' },
              { value: 'RECHAZADO', label: 'Rechazados' },
              { value: '', label: 'Todos los estados' },
            ],
          },
          {
            label: 'Ordenar por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'monto_desc', label: 'Mayor monto' },
              { value: 'monto_asc', label: 'Menor monto' },
            ],
          },
        ]}
        extraContent={
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-2.5 text-xs text-slate-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Al confirmar un pago, sus tickets asociados pasan inmediatamente a{' '}
              <strong>VENDIDO</strong> y se notifica al participante. Si se rechaza, los números
              regresan al tablero disponible.
            </span>
          </div>
        }
      />

      <PanelSectionHeader
        icon={CreditCard}
        title="Comprobantes Registrados"
        subtitle="Resultados de la consulta activa"
        badgeText={`${totalGlobal} pagos encontrados`}
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total en Consulta',
            value: totalGlobal,
            trendText: estado || 'Todos los estados',
            icon: CreditCard,
            accent: 'emerald',
          },
          {
            label: 'Pendientes (pág.)',
            value: pendientesCount,
            trendText: 'Requieren revisión',
            icon: Clock,
            accent: 'amber',
          },
          {
            label: 'Confirmados (pág.)',
            value: confirmadosCount,
            trendText: 'Tickets vendidos',
            icon: CheckCircle2,
            accent: 'sky',
          },
          {
            label: 'Volumen Visible',
            value: formatearBs(montoVisible),
            trendText: 'Suma en página',
            icon: DollarSign,
            accent: 'indigo',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={pagosVisibles}
        loading={isLoading}
        rowKey="pagoId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={totalGlobal}
        pageSize={15}
        itemLabel="pagos"
        onPageChange={setPage}
        emptyTitle="Sin pagos para este filtro"
        emptyDescription="Cambia el estado o limpia la búsqueda para ver otros comprobantes."
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
              <strong>Participante:</strong>{' '}
              {pagoConfirmar.usuario?.alias || `ID ${pagoConfirmar.usuarioId}`}
            </p>
            <p>
              <strong>Rifa:</strong>{' '}
              {pagoConfirmar.rifa?.nombre || `Rifa #${pagoConfirmar.rifaId}`}
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
