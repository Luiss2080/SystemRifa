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
  Plus,
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
  crearTipoNotificacionApi,
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
  const [modalPlantilla, setModalPlantilla] = useState(null); // { modo: 'crear' | 'editar', tipo?: obj }
  const [form, setForm] = useState({
    codigo: '',
    plantillaTitulo: '',
    plantillaMensaje: '',
    variables: ['nombre', 'alias', 'nombreRifa'],
    estaActivo: true,
  });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function abrirCrear() {
    setModalPlantilla({ modo: 'crear' });
    setForm({
      codigo: '',
      plantillaTitulo: '',
      plantillaMensaje: '',
      variables: ['nombre', 'alias', 'nombreRifa'],
      estaActivo: true,
    });
  }

  function abrirEditar(tipo) {
    setModalPlantilla({ modo: 'editar', tipo });
    setForm({
      codigo: tipo.codigo,
      plantillaTitulo: tipo.plantillaTitulo,
      plantillaMensaje: tipo.plantillaMensaje,
      variables: tipo.variables || ['nombre', 'alias'],
      estaActivo: tipo.estaActivo,
    });
  }

  function insertarVariable(variable) {
    setForm((f) => ({
      ...f,
      plantillaMensaje: `${f.plantillaMensaje}${f.plantillaMensaje.endsWith(' ') || !f.plantillaMensaje ? '' : ' '}{${variable}}`,
    }));
  }

  const varsAdmitidas = useMemo(() => {
    if (modalPlantilla?.modo === 'editar') {
      return Array.isArray(modalPlantilla.tipo?.variables) && modalPlantilla.tipo.variables.length
        ? modalPlantilla.tipo.variables
        : ['nombre', 'alias', 'nombreRifa'];
    }
    return form.variables || ['nombre', 'alias', 'nombreRifa'];
  }, [modalPlantilla, form.variables]);

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
    if (!modalPlantilla) return;
    setSaving(true);
    try {
      if (modalPlantilla.modo === 'crear') {
        await crearTipoNotificacionApi({
          codigo: form.codigo.trim().toUpperCase(),
          plantillaTitulo: form.plantillaTitulo.trim(),
          plantillaMensaje: form.plantillaMensaje.trim(),
          variables: form.variables,
          estaActivo: form.estaActivo,
        });
        toast.success('Plantilla creada', 'El nuevo evento de notificación fue registrado con éxito.');
      } else {
        await actualizarTipoNotificacionApi(modalPlantilla.tipo.tipoNotificacionId, {
          plantillaTitulo: form.plantillaTitulo.trim(),
          plantillaMensaje: form.plantillaMensaje.trim(),
          estaActivo: form.estaActivo,
        });
        toast.success('Plantilla guardada', 'El formato del mensaje se actualizó correctamente.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-plantillas'] });
      setModalPlantilla(null);
    } catch (err) {
      toast.error('Error al guardar plantilla', extraerErrorApi(err).message);
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
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nueva plantilla
            </Button>
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

      {/* Modal de Previsualización en Vivo Horizontal */}
      <Modal
        open={Boolean(previsualizando)}
        onClose={() => setPrevisualizando(null)}
        title={`Vista previa en vivo · ${previsualizando?.codigo || ''}`}
        description="Simulación del mensaje renderizado tal como lo recibe el usuario final con variables dinámicas."
        badge={getEventoConfig(previsualizando?.codigo).categoria}
        icon={Eye}
        maxWidth="max-w-4xl sm:max-w-5xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-slate-500">
              Canal: <strong>{getEventoConfig(previsualizando?.codigo).canal}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPrevisualizando(null)}>
                Cerrar
              </Button>
              <Button
                size="sm"
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
        }
      >
        {previsualizando && (
          <div className="grid gap-4 md:grid-cols-12 items-start">
            {/* Cabecera y cuerpo de simulación */}
            <div className="md:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                <div className="space-y-0.5">
                  <p className="text-slate-500">
                    <strong className="text-slate-700">De:</strong> Rifas Solidarias &lt;notificaciones@rifas.local&gt;
                  </p>
                  <p className="text-slate-500">
                    <strong className="text-slate-700">Para:</strong> {EJEMPLOS_VARIABLES.nombre} &lt;participante@rifas.local&gt;
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  <Send className="h-3 w-3 text-emerald-600" />
                  {getEventoConfig(previsualizando.codigo).canal}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asunto / Título</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900 leading-snug">
                  {previsualizarTexto(previsualizando.plantillaTitulo, previsualizando.variables || [])}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">Cuerpo del Mensaje</p>
                <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {previsualizarTexto(previsualizando.plantillaMensaje, previsualizando.variables || [])}
                </p>
              </div>
            </div>

            {/* Resumen lateral de variables aplicadas */}
            <div className="md:col-span-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-2.5 text-xs">
              <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Variable className="h-4 w-4 text-indigo-600" />
                Variables renderizadas:
              </p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {(previsualizando.variables || []).map((v) => (
                  <div key={v} className="rounded-lg border border-indigo-200/80 bg-white p-2">
                    <p className="font-mono text-[11px] font-bold text-indigo-700">{`{${v}}`}</p>
                    <p className="truncate text-[11px] text-slate-700 font-medium">{EJEMPLOS_VARIABLES[v] ?? '—'}</p>
                  </div>
                ))}
                {(!previsualizando.variables || previsualizando.variables.length === 0) && (
                  <p className="text-slate-500 italic">Esta plantilla no utiliza variables dinámicas.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Compacto y Horizontal de Creación / Edición */}
      <Modal
        open={Boolean(modalPlantilla)}
        onClose={() => setModalPlantilla(null)}
        title={
          modalPlantilla?.modo === 'crear'
            ? 'Nueva plantilla de notificación'
            : `Editar plantilla · ${modalPlantilla?.tipo?.codigo || ''}`
        }
        description="Personaliza el asunto, variables dinámicas y mensaje que recibirán automáticamente los participantes."
        badge={modalPlantilla?.tipo ? getEventoConfig(modalPlantilla.tipo.codigo).categoria : 'Mensajería'}
        icon={Mail}
        maxWidth="max-w-4xl sm:max-w-5xl"
      >
        {modalPlantilla && (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-12 items-stretch">
              {/* Columna izquierda (7 cols): Campos de configuración */}
              <div className="space-y-3 md:col-span-7">
                {modalPlantilla.modo === 'crear' ? (
                  <Input
                    label="Código único de evento"
                    icon={Code2}
                    required
                    placeholder="Ej. BOLETO_CONFIRMADO"
                    value={form.codigo}
                    onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs">
                    <span className="font-bold text-slate-600">Código de evento:</span>
                    <span className="font-mono font-black text-slate-900">{modalPlantilla.tipo.codigo}</span>
                  </div>
                )}

                <Input
                  label="Plantilla del título / Asunto *"
                  required
                  placeholder="Ej. ¡Felicidades {nombre}, tu pago fue verificado!"
                  value={form.plantillaTitulo}
                  onChange={(e) => setForm((f) => ({ ...f, plantillaTitulo: e.target.value }))}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Plantilla del mensaje *
                    </label>
                    <span className="text-[10px] text-slate-400">Clic en variable para insertar</span>
                  </div>
                  
                  {/* Variables admitidas como chips interactivos */}
                  <div className="flex flex-wrap gap-1 pb-1">
                    {varsAdmitidas.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertarVariable(v)}
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-200/90 bg-indigo-50/80 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs transition cursor-pointer"
                        title={`Insertar {${v}}`}
                      >
                        <PlusCircle className="h-3 w-3 text-indigo-500" />
                        {`{${v}}`}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    required
                    rows={4}
                    placeholder="Escribe el mensaje completo respetando las llaves para variables..."
                    value={form.plantillaMensaje}
                    onChange={(e) => setForm((f) => ({ ...f, plantillaMensaje: e.target.value }))}
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    checked={form.estaActivo}
                    onChange={(e) => setForm((f) => ({ ...f, estaActivo: e.target.checked }))}
                  />
                  <span>Habilitar envío automático en producción</span>
                </label>
              </div>

              {/* Columna derecha (5 cols): Previsualización realista en vivo */}
              <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-3.5 shadow-2xs space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      Vista previa en vivo
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Simulación
                    </span>
                  </div>

                  {/* Tarjeta de simulación */}
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs text-xs">
                    <div className="border-b border-slate-100 pb-2 text-[10.5px] text-slate-500 space-y-0.5">
                      <p><strong>De:</strong> Rifas Solidarias &lt;notif@rifas.local&gt;</p>
                      <p><strong>Para:</strong> {EJEMPLOS_VARIABLES.nombre} &lt;usuario@ejemplo.bo&gt;</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asunto</p>
                      <p className="font-extrabold text-slate-900 text-xs">
                        {previsualizarTexto(form.plantillaTitulo, varsAdmitidas) || (
                          <span className="text-slate-400 italic">Escribe un título...</span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">Mensaje</p>
                      <p className="text-[11.5px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                        {previsualizarTexto(form.plantillaMensaje, varsAdmitidas) || (
                          <span className="text-slate-400 italic">Escribe el cuerpo del mensaje...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-2 text-[10.5px] text-indigo-950">
                  <p className="font-bold mb-1">Valores simulados:</p>
                  <p className="text-slate-600 truncate">nombre: <strong>{EJEMPLOS_VARIABLES.nombre}</strong></p>
                  <p className="text-slate-600 truncate">rifa: <strong>{EJEMPLOS_VARIABLES.nombreRifa}</strong></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="secondary" size="sm" onClick={() => setModalPlantilla(null)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={saving}>
                {modalPlantilla.modo === 'crear' ? 'Crear plantilla' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
