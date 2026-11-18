import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BellRing,
  CheckCircle2,
  Code2,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  Mail,
  PauseCircle,
  PlusCircle,
  SlidersHorizontal,
  Variable,
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
  observacion: 'Comprobante verificado con éxito',
  numeros: '12, 24, 77',
  minutos: '15',
  monto: '50.00',
  motivo: 'Referencia bancaria no coincide',
  numeroGanador: '77',
  premio: 'Bicicleta Montañera',
};

function getEventoConfig(codigo = '') {
  if (codigo.includes('APROBADA') || codigo.includes('CONFIRMADO') || codigo.includes('GANADOR')) {
    return {
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      iconBox: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    };
  }
  if (codigo.includes('RECHAZAD') || codigo.includes('VENCID') || codigo.includes('CANCEL')) {
    return {
      badge: 'border-rose-200 bg-rose-50 text-rose-800',
      iconBox: 'bg-rose-50 text-rose-700 border border-rose-200',
    };
  }
  if (codigo.includes('BIENVENIDA')) {
    return {
      badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
      iconBox: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    };
  }
  if (codigo.includes('TICKET') || codigo.includes('RESERV')) {
    return {
      badge: 'border-amber-200 bg-amber-50 text-amber-800',
      iconBox: 'bg-amber-50 text-amber-700 border border-amber-200',
    };
  }
  return {
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    iconBox: 'bg-sky-50 text-sky-700 border border-sky-200',
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
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'tarjetas'
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    plantillaTitulo: '',
    plantillaMensaje: '',
    estaActivo: true,
  });
  const [saving, setSaving] = useState(false);

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
    const byEstado =
      filtroEstado === 'ACTIVAS'
        ? base.filter((i) => i.estaActivo)
        : filtroEstado === 'INACTIVAS'
        ? base.filter((i) => !i.estaActivo)
        : base;
    const q = busqueda.trim().toLowerCase();
    if (!q) return byEstado;
    return byEstado.filter(
      (i) =>
        (i.codigo || '').toLowerCase().includes(q) ||
        (i.plantillaTitulo || '').toLowerCase().includes(q) ||
        (i.plantillaMensaje || '').toLowerCase().includes(q)
    );
  }, [data, filtroEstado, busqueda]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const itemsPaginados = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

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
      render: (tipo) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Mail className="h-4 w-4 text-emerald-600" />
          </span>
          <div>
            <span className="font-mono text-xs font-black tracking-tight text-slate-900">
              {tipo.codigo}
            </span>
            <p className="text-[10px] text-slate-400">ID #{tipo.tipoNotificacionId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plantilla',
      label: 'Título y Mensaje Predeterminado',
      icon: BellRing,
      render: (tipo) => (
        <div className="max-w-md space-y-0.5">
          <p className="font-bold text-slate-900 text-xs">{tipo.plantillaTitulo}</p>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">
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
              className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700"
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
        <Badge color={tipo.estaActivo ? 'emerald' : 'slate'}>
          {tipo.estaActivo ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (tipo) => (
        <div className="flex items-center gap-1.5">
          <RowActionButton
            icon={Edit2}
            title="Editar y previsualizar plantilla"
            tone="edit"
            onClick={() => abrirEditar(tipo)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Plantillas de Notificación del Sistema"
        subtitle="Personaliza títulos y mensajes respetando únicamente las variables admitidas por evento."
        searchValue={busqueda}
        onSearchChange={(val) => {
          setBusqueda(val);
          setPage(1);
        }}
        searchPlaceholder="Buscar por código de evento, título o mensaje..."
        hasActiveFilters={Boolean(busqueda || filtroEstado !== 'TODAS')}
        onResetFilters={() => {
          setBusqueda('');
          setFiltroEstado('TODAS');
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
              { value: 'TODAS', label: 'Todas' },
              { value: 'ACTIVAS', label: 'Activas' },
              { value: 'INACTIVAS', label: 'Inactivas' },
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
        subtitle="Renderizado seguro con previsualización de variables"
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
            trendText: 'Envío habilitado',
            icon: CheckCircle2,
            accent: 'sky',
          },
          {
            label: 'Plantillas inactivas',
            value: inactivasCount,
            trendText: 'Pausadas temporalmente',
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
            {itemsPaginados.map((tipo) => (
              <div
                key={tipo.tipoNotificacionId}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="space-y-2.5 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-900">
                      <Code2 className="h-3.5 w-3.5 text-emerald-600" />
                      {tipo.codigo}
                    </span>
                    <Badge color={tipo.estaActivo ? 'emerald' : 'slate'}>
                      {tipo.estaActivo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{tipo.plantillaTitulo}</p>
                  <p className="text-xs leading-relaxed text-slate-600">{tipo.plantillaMensaje}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(tipo.variables || []).map((v) => (
                      <span
                        key={v}
                        className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700"
                      >
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={() => abrirEditar(tipo)}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Editar y previsualizar
                  </Button>
                </div>
              </div>
            ))}
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

      <Modal
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        title={`Editar plantilla · ${editando?.codigo || ''}`}
        description="Personaliza el título, cuerpo e insertables dinámicos de esta notificación automática."
        badge="Mensajería del sistema"
        icon={Mail}
        maxWidth="max-w-2xl"
      >
        {editando && (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">
                Variables admitidas (clic para insertar en el mensaje):
              </p>
              {varsAdmitidas.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {varsAdmitidas.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertarVariable(v)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-medium text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
                    >
                      <PlusCircle className="h-3 w-3" />
                      {`{${v}}`}
                    </button>
                  ))}
                </div>
              ) : (
                <span>Ninguna</span>
              )}
            </div>

            <Input
              label="Plantilla del título"
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

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.estaActivo}
                onChange={(e) => setForm((f) => ({ ...f, estaActivo: e.target.checked }))}
              />
              Notificación activa
            </label>

            <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-800">
                <Eye className="h-3.5 w-3.5" />
                Vista previa con variables de ejemplo
              </p>
              <p className="text-sm font-bold text-slate-900">
                {previsualizarTexto(form.plantillaTitulo, varsAdmitidas)}
              </p>
              <p className="text-xs text-slate-700">
                {previsualizarTexto(form.plantillaMensaje, varsAdmitidas)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
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
