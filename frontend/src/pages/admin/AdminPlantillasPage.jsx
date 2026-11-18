import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertOctagon,
  BellRing,
  CheckCircle2,
  Clock,
  Code2,
  CreditCard,
  Edit2,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Mail,
  PauseCircle,
  PlusCircle,
  Send,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Trophy,
  UserCheck,
  UserPlus,
  Variable,
  XCircle,
} from 'lucide-react';
import {
  actualizarTipoNotificacionApi,
  getTiposNotificacionApi,
} from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable, PaginationCard } from '../../components/ui/DataTable.jsx';
import { FullPageSpinner } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

const EJEMPLOS_VARIABLES = {
  nombre: 'Ana María Rojas',
  alias: 'AnaSolidaria',
  nombreRifa: 'Rifa Pro Hogar Infantil',
  estado: 'PAGO_CONFIRMADO',
  observacion: 'Comprobante verificado con éxito por tesorería',
  numeros: '12, 24, 77',
  minutos: '15',
  monto: '50.00',
  motivo: 'Referencia bancaria no coincide con el extracto',
  numeroGanador: '77',
  premio: 'Bicicleta Montañera Profesional',
};

function getEventoConfig(codigo = '') {
  if (codigo.includes('BIENVENIDA')) {
    return {
      badge: 'border-indigo-200 bg-indigo-50/90 text-indigo-800 font-bold',
      iconBox: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      icon: UserPlus,
      canal: 'Email & In-App',
      categoria: 'Onboarding & Usuario',
    };
  }
  if (codigo.includes('APROBADA') || codigo.includes('CONFIRMADO')) {
    return {
      badge: 'border-emerald-200 bg-emerald-50/90 text-emerald-800 font-bold',
      iconBox: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: CheckCircle2,
      canal: 'Email & In-App',
      categoria: 'Aprobaciones',
    };
  }
  if (codigo.includes('GANADOR') || codigo.includes('SORTEO')) {
    return {
      badge: 'border-purple-200 bg-purple-50/90 text-purple-800 font-bold',
      iconBox: 'bg-purple-50 text-purple-700 border border-purple-200',
      icon: Trophy,
      canal: 'Alta Prioridad · Email & In-App',
      categoria: 'Sorteos & Premios',
    };
  }
  if (codigo.includes('RECHAZAD') || codigo.includes('CANCEL')) {
    return {
      badge: 'border-rose-200 bg-rose-50/90 text-rose-800 font-bold',
      iconBox: 'bg-rose-50 text-rose-700 border border-rose-200',
      icon: XCircle,
      canal: 'Alerta Inmediata · In-App',
      categoria: 'Observaciones & Rechazos',
    };
  }
  if (codigo.includes('VENCID')) {
    return {
      badge: 'border-orange-200 bg-orange-50/90 text-orange-800 font-bold',
      iconBox: 'bg-orange-50 text-orange-700 border border-orange-200',
      icon: Clock,
      canal: 'Cron Job Automático',
      categoria: 'Expiraciones',
    };
  }
  if (codigo.includes('PAGO')) {
    return {
      badge: 'border-teal-200 bg-teal-50/90 text-teal-800 font-bold',
      iconBox: 'bg-teal-50 text-teal-700 border border-teal-200',
      icon: CreditCard,
      canal: 'Tesorería & Auditoría',
      categoria: 'Pagos & Finanzas',
    };
  }
  if (codigo.includes('TICKET') || codigo.includes('RESERV')) {
    return {
      badge: 'border-amber-200 bg-amber-50/90 text-amber-800 font-bold',
      iconBox: 'bg-amber-50 text-amber-700 border border-amber-200',
      icon: Ticket,
      canal: 'Inventario & Compras',
      categoria: 'Boletos',
    };
  }
  return {
    badge: 'border-sky-200 bg-sky-50/90 text-sky-800 font-bold',
    iconBox: 'bg-sky-50 text-sky-700 border border-sky-200',
    icon: FileText,
    canal: 'Mensajería Estándar',
    categoria: 'Solicitudes',
  };
}

function previsualizarTexto(plantilla = '', variables = []) {
  return plantilla.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!variables.includes(key)) return `[INVÁLIDA:${key}]`;
    return EJEMPLOS_VARIABLES[key] ?? `[${key}]`;
  });
}

export function AdminPlantillasPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-plantillas'],
    queryFn: getTiposNotificacionApi,
  });

  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [filtroOrden, setFiltroOrden] = useState('recientes');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'tarjetas'
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [previsualizando, setPrevisualizando] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    plantillaTitulo: '',
    plantillaMensaje: '',
    estaActivo: true,
  });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function abrirEditar(tipo) {
    setEditando(tipo);
    setForm({
      plantillaTitulo: tipo.plantillaTitulo,
      plantillaMensaje: tipo.plantillaMensaje,
      estaActivo: tipo.estaActivo,
    });
  }

  function insertarVariable(variable) {
    setForm((f) => ({
      ...f,
      plantillaMensaje: `${f.plantillaMensaje}${f.plantillaMensaje.endsWith(' ') || !f.plantillaMensaje ? '' : ' '}{${variable}}`,
    }));
  }

  const varsAdmitidas = useMemo(
    () => (Array.isArray(editando?.variables) ? editando.variables : []),
    [editando]
  );

  const items = useMemo(() => {
    const base = data?.items || [];
    let list =
      filtroEstado === 'ACTIVAS'
        ? base.filter((i) => i.estaActivo)
        : filtroEstado === 'INACTIVAS'
        ? base.filter((i) => !i.estaActivo)
        : base;
    const q = busqueda.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          (i.codigo || '').toLowerCase().includes(q) ||
          (i.plantillaTitulo || '').toLowerCase().includes(q) ||
          (i.plantillaMensaje || '').toLowerCase().includes(q)
      );
    }
    if (filtroOrden === 'codigo_asc') {
      list = [...list].sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
    } else if (filtroOrden === 'codigo_desc') {
      list = [...list].sort((a, b) => (b.codigo || '').localeCompare(a.codigo || ''));
    } else if (filtroOrden === 'titulo_asc') {
      list = [...list].sort((a, b) => (a.plantillaTitulo || '').localeCompare(b.plantillaTitulo || ''));
    }
    return list;
  }, [data, filtroEstado, busqueda, filtroOrden]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const itemsPaginados = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  async function handleToggleActivo(tipo) {
    setTogglingId(tipo.tipoNotificacionId);
    try {
      await actualizarTipoNotificacionApi(tipo.tipoNotificacionId, {
        estaActivo: !tipo.estaActivo,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-plantillas'] });
      toast.success(
        tipo.estaActivo ? 'Plantilla pausada' : 'Plantilla activada',
        `El evento ${tipo.codigo} ahora está ${tipo.estaActivo ? 'inactivo' : 'activo'}.`
      );
    } catch (err) {
      toast.error('Error al cambiar estado', extraerErrorApi(err).message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!editando) return;
    setSaving(true);
    try {
      await actualizarTipoNotificacionApi(editando.tipoNotificacionId, {
        plantillaTitulo: form.plantillaTitulo.trim(),
        plantillaMensaje: form.plantillaMensaje.trim(),
        estaActivo: form.estaActivo,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-plantillas'] });
      toast.success('Plantilla guardada', 'El formato del mensaje se actualizó correctamente.');
      setEditando(null);
    } catch (err) {
      toast.error('Error al guardar', extraerErrorApi(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <FullPageSpinner message="Cargando plantillas del sistema..." />;

  const totalBase = data?.items || [];
  const activasCount = totalBase.filter((i) => i.estaActivo).length;
  const inactivasCount = totalBase.filter((i) => !i.estaActivo).length;

  const columns = [
    {
      key: 'codigo',
      label: 'Código de Evento',
      icon: Code2,
      render: (tipo) => {
        const cfg = getEventoConfig(tipo.codigo);
        const IconComponent = cfg.icon;
        return (
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${cfg.iconBox}`}
            >
              <IconComponent className="h-4 w-4" />
            </span>
            <div>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-black tracking-tight ${cfg.badge}`}
              >
                {tipo.codigo}
              </span>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">ID #{tipo.tipoNotificacionId} · {cfg.categoria}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'plantilla',
      label: 'Título y Mensaje Predeterminado',
      icon: BellRing,
      render: (tipo) => (
        <div className="max-w-md space-y-1">
          <p className="font-extrabold text-slate-900 text-xs leading-snug">{tipo.plantillaTitulo}</p>
          <p className="line-clamp-2 text-[11.5px] leading-relaxed text-slate-600">
            {tipo.plantillaMensaje}
          </p>
        </div>
      ),
    },
    {
      key: 'variables',
      label: 'Variables Admitidas',
      icon: Variable,
      render: (tipo) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {(tipo.variables || []).map((v) => (
            <span
              key={v}
              className="rounded-md border border-indigo-200/90 bg-indigo-50/80 px-2 py-0.5 font-mono text-[10.5px] font-bold text-indigo-700 shadow-2xs"
            >
              {`{${v}}`}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      icon: CheckCircle2,
      render: (tipo) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border shadow-2xs ${
            tipo.estaActivo
              ? 'border-emerald-200/90 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-100 text-slate-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              tipo.estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {tipo.estaActivo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (tipo) => (
        <div className="flex items-center gap-1.5">
          <RowActionButton
            icon={Eye}
            title="Ver previsualización en vivo"
            tone="view"
            onClick={() => setPrevisualizando(tipo)}
          />
          <RowActionButton
            icon={Edit2}
            title="Editar plantilla y variables"
            tone="edit"
            onClick={() => abrirEditar(tipo)}
          />
          <RowActionButton
            icon={tipo.estaActivo ? PauseCircle : CheckCircle2}
            title={tipo.estaActivo ? 'Pausar envío de este evento' : 'Habilitar envío de este evento'}
            tone={tipo.estaActivo ? 'danger' : 'primary'}
            loading={togglingId === tipo.tipoNotificacionId}
            onClick={() => handleToggleActivo(tipo)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Plantillas de Notificación del Sistema"
        subtitle="Personaliza títulos y mensajes con variables dinámicas como {nombre}, {alias} y datos de rifas."
        searchValue={busqueda}
        onSearchChange={(val) => {
          setBusqueda(val);
          setPage(1);
        }}
        searchPlaceholder="Buscar por código de evento, título o mensaje..."
        hasActiveFilters={Boolean(busqueda || filtroEstado !== 'TODAS' || filtroOrden !== 'recientes')}
        onResetFilters={() => {
          setBusqueda('');
          setFiltroEstado('TODAS');
          setFiltroOrden('recientes');
          setPage(1);
        }}
        selects={[
          {
            label: 'Estado',
            value: filtroEstado,
            onChange: (val) => {
              setFiltroEstado(val);
              setPage(1);
            },
            options: [
              { value: 'TODAS', label: 'Todas las plantillas' },
              { value: 'ACTIVAS', label: 'Solo activas' },
              { value: 'INACTIVAS', label: 'Solo pausadas' },
            ],
          },
          {
            label: 'Ordenar por',
            value: filtroOrden,
            onChange: (val) => {
              setFiltroOrden(val);
              setPage(1);
            },
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'codigo_asc', label: 'Código (A - Z)' },
              { value: 'codigo_desc', label: 'Código (Z - A)' },
              { value: 'titulo_asc', label: 'Título (A - Z)' },
            ],
          },
        ]}
        rightActions={
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setVista('tabla')}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition cursor-pointer ${
                vista === 'tabla'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de tabla"
            >
              <List className="h-4 w-4" />
              <span>Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setVista('tarjetas')}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition cursor-pointer ${
                vista === 'tarjetas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Tarjetas</span>
            </button>
          </div>
        }
      />

      <PanelSectionHeader
        icon={Mail}
        title="Catálogo de Eventos & Mensajería"
        subtitle="Renderizado seguro y adaptable con variables de usuario"
        badgeText={`${items.length} Plantillas configuradas`}
        accent="emerald"
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total plantillas',
            value: totalBase.length,
            trendText: 'Eventos configurados',
            icon: BellRing,
            accent: 'emerald',
          },
          {
            label: 'Plantillas activas',
            value: activasCount,
            trendText: 'Envío en producción',
            icon: CheckCircle2,
            accent: 'sky',
          },
          {
            label: 'Plantillas pausadas',
            value: inactivasCount,
            trendText: 'Silenciadas temporalmente',
            icon: PauseCircle,
            accent: 'amber',
          },
        ]}
      />

      {vista === 'tabla' ? (
        <>
          <DataTable
            columns={columns}
            data={itemsPaginados}
            keyField="tipoNotificacionId"
            emptyMessage="No se encontraron plantillas con los criterios aplicados."
          />
          {totalPages > 1 && (
            <PaginationCard
              page={safePage}
              totalPages={totalPages}
              total={items.length}
              showingFrom={(safePage - 1) * pageSize + 1}
              showingTo={Math.min(safePage * pageSize, items.length)}
              onPageChange={setPage}
              itemLabel="plantillas"
            />
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {itemsPaginados.map((tipo) => {
              const cfg = getEventoConfig(tipo.codigo);
              const IconComp = cfg.icon;
              return (
                <div
                  key={tipo.tipoNotificacionId}
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-2xs ${cfg.iconBox}`}>
                          <IconComp className="h-4 w-4" />
                        </span>
                        <div>
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-black tracking-tight ${cfg.badge}`}>
                            {tipo.codigo}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          tipo.estaActivo
                            ? 'border-emerald-200/90 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tipo.estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {tipo.estaActivo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-snug">{tipo.plantillaTitulo}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-3">{tipo.plantillaMensaje}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(tipo.variables || []).map((v) => (
                        <span
                          key={v}
                          className="rounded-md border border-indigo-200/90 bg-indigo-50/80 px-2 py-0.5 font-mono text-[10.5px] font-bold text-indigo-700 shadow-2xs"
                        >
                          {`{${v}}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                    <span className="text-[11px] font-medium text-slate-500">{cfg.canal}</span>
                    <div className="flex items-center gap-1.5">
                      <RowActionButton
                        icon={Eye}
                        title="Ver previsualización en vivo"
                        tone="view"
                        onClick={() => setPrevisualizando(tipo)}
                      />
                      <RowActionButton
                        icon={Edit2}
                        title="Editar plantilla"
                        tone="edit"
                        onClick={() => abrirEditar(tipo)}
                      />
                      <RowActionButton
                        icon={tipo.estaActivo ? PauseCircle : CheckCircle2}
                        title={tipo.estaActivo ? 'Pausar' : 'Activar'}
                        tone={tipo.estaActivo ? 'danger' : 'primary'}
                        loading={togglingId === tipo.tipoNotificacionId}
                        onClick={() => handleToggleActivo(tipo)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <PaginationCard
              page={safePage}
              totalPages={totalPages}
              total={items.length}
              showingFrom={(safePage - 1) * pageSize + 1}
              showingTo={Math.min(safePage * pageSize, items.length)}
              onPageChange={setPage}
              itemLabel="plantillas"
            />
          )}
        </>
      )}

      {/* Modal de Previsualización en Vivo */}
      <Modal
        open={Boolean(previsualizando)}
        onClose={() => setPrevisualizando(null)}
        title={`Vista Previa en Vivo · ${previsualizando?.codigo || ''}`}
        description="Simulación del mensaje renderizado tal como lo recibe el usuario final con variables dinámicas."
        badge={getEventoConfig(previsualizando?.codigo).categoria}
        icon={Eye}
        maxWidth="max-w-2xl"
      >
        {previsualizando && (
          <div className="space-y-4">
            {/* Cabecera de simulación de correo / push */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div className="space-y-0.5">
                  <p className="text-slate-500">
                    <strong className="text-slate-700">De:</strong> Sistema Rifas Solidarias &lt;notificaciones@rifas.local&gt;
                  </p>
                  <p className="text-slate-500">
                    <strong className="text-slate-700">Para:</strong> {EJEMPLOS_VARIABLES.nombre} &lt;participante@rifas.local&gt;
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  <Send className="h-3 w-3 text-emerald-600" />
                  {getEventoConfig(previsualizando.codigo).canal}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Asunto / Título</p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900">
                  {previsualizarTexto(previsualizando.plantillaTitulo, previsualizando.variables || [])}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">Cuerpo del Mensaje</p>
                <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {previsualizarTexto(previsualizando.plantillaMensaje, previsualizando.variables || [])}
                </p>
              </div>
            </div>

            {/* Resumen de variables aplicadas */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-2 text-xs">
              <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Variable className="h-4 w-4 text-indigo-600" />
                Variables simuladas en esta plantilla:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(previsualizando.variables || []).map((v) => (
                  <div key={v} className="rounded-lg border border-indigo-200/80 bg-white p-2">
                    <p className="font-mono text-[11px] font-bold text-indigo-700">{`{${v}}`}</p>
                    <p className="truncate text-[11px] text-slate-600 font-medium">{EJEMPLOS_VARIABLES[v] ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setPrevisualizando(null)}>
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  const t = previsualizando;
                  setPrevisualizando(null);
                  abrirEditar(t);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar esta plantilla
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        title={`Editar plantilla · ${editando?.codigo || ''}`}
        description="Personaliza el título, mensaje y variables admitidas. Puedes usar {nombre} para un trato personalizado o {alias}."
        badge={getEventoConfig(editando?.codigo).categoria}
        icon={Mail}
        maxWidth="max-w-2xl"
      >
        {editando && (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-950">
              <p className="font-bold flex items-center gap-1.5">
                <Variable className="h-4 w-4 text-indigo-600" />
                Variables admitidas (haz clic para insertar en el mensaje):
              </p>
              {varsAdmitidas.length ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {varsAdmitidas.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertarVariable(v)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 shadow-2xs transition cursor-pointer"
                    >
                      <PlusCircle className="h-3 w-3 text-indigo-500" />
                      {`{${v}}`}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">Ninguna variable</span>
              )}
            </div>

            <Input
              label="Plantilla del título / Asunto"
              required
              value={form.plantillaTitulo}
              onChange={(e) => setForm((f) => ({ ...f, plantillaTitulo: e.target.value }))}
            />

            <Textarea
              label="Plantilla del mensaje"
              required
              rows={3}
              value={form.plantillaMensaje}
              onChange={(e) => setForm((f) => ({ ...f, plantillaMensaje: e.target.value }))}
            />

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={form.estaActivo}
                onChange={(e) => setForm((f) => ({ ...f, estaActivo: e.target.checked }))}
              />
              Notificación activa para envío en producción
            </label>

            <div className="space-y-1 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-4 shadow-2xs">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Eye className="h-3.5 w-3.5" />
                Vista previa en tiempo real
              </p>
              <p className="text-sm font-extrabold text-slate-900">
                {previsualizarTexto(form.plantillaTitulo, varsAdmitidas)}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                {previsualizarTexto(form.plantillaMensaje, varsAdmitidas)}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar plantilla
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
