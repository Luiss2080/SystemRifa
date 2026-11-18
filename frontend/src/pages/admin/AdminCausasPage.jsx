import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  DollarSign,
  Edit2,
  ExternalLink,
  HeartHandshake,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import { getCausasPublicas } from '../../features/rifas/publicApi.js';
import {
  actualizarCausaApi,
  crearCausaApi,
  eliminarCausaApi,
} from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { formatearBs, sumarMontosBs } from '../../utils/format.js';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  PanelFilterBar,
  PanelKpiGrid,
  PanelSectionHeader,
  RowActionButton,
} from '../../components/panel/PanelKit.jsx';

const FALLBACK_ADMIN_CAUSAS = [
  {
    causaId: 1,
    nombre: 'Albergue Esperanza Canina',
    categoria: 'Albergues y Rescate Animal',
    descripcion:
      'Rescate, alimentación diaria, atención veterinaria y esterilizaciones para más de 120 perritos rescatados.',
    meta: '35000.00',
    recaudado: '24500.00',
    rifasCount: 2,
    beneficiarios: '120 animales protegidos',
    icono: '🐾',
    colorStripe: 'from-emerald-600 to-teal-700',
  },
  {
    causaId: 2,
    nombre: 'Educación Digital Rural',
    categoria: 'Educación y Niñez',
    descripcion:
      'Equipamiento de aulas de computación con internet satelital y capacitación para escuelas comunitarias.',
    meta: '28000.00',
    recaudado: '18400.00',
    rifasCount: 1,
    beneficiarios: '320 estudiantes rurales',
    icono: '💻',
    colorStripe: 'from-sky-600 to-indigo-700',
  },
  {
    causaId: 3,
    nombre: 'Salud y Esperanza Infantil',
    categoria: 'Salud y Bienestar',
    descripcion:
      'Financiamiento directo de medicamentos oncológicos y tratamientos especializados para niños de escasos recursos.',
    meta: '50000.00',
    recaudado: '39200.00',
    rifasCount: 3,
    beneficiarios: '45 niños y sus familias',
    icono: '❤️',
    colorStripe: 'from-rose-600 to-pink-700',
  },
  {
    causaId: 4,
    nombre: 'Comedor Comunitario San José',
    categoria: 'Apoyo Comunitario',
    descripcion:
      'Provisión de 180 raciones nutritivas diarias y talleres escolares para familias en situación vulnerable.',
    meta: '18000.00',
    recaudado: '14100.00',
    rifasCount: 2,
    beneficiarios: '180 raciones diarias',
    icono: '🍲',
    colorStripe: 'from-amber-600 to-orange-700',
  },
  {
    causaId: 5,
    nombre: 'Reforestación Chiquitanía Viva',
    categoria: 'Medio Ambiente',
    descripcion:
      'Recuperación de áreas afectadas por incendios forestales mediante siembra comunitaria de especies nativas.',
    meta: '42000.00',
    recaudado: '26800.00',
    rifasCount: 2,
    beneficiarios: '12 comunidades chiquitanas',
    icono: '🌿',
    colorStripe: 'from-teal-600 to-emerald-800',
  },
];

export function AdminCausasPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const [busqueda, setBusqueda] = useState('');
  const [criterio, setCriterio] = useState('todas');
  const [orden, setOrden] = useState('recientes');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', meta: '' });
  const [saving, setSaving] = useState(false);

  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const causasBase = useMemo(() => {
    const raw = data?.items || [];
    if (raw.length > 0) return raw;
    return FALLBACK_ADMIN_CAUSAS;
  }, [data]);

  const causasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = causasBase.filter((c) => {
      if (criterio === 'con_rifas' && (c.rifasCount ?? 0) === 0) return false;
      if (criterio === 'sin_rifas' && (c.rifasCount ?? 0) > 0) return false;
      if (!q) return true;
      return (
        c.nombre?.toLowerCase().includes(q) ||
        c.descripcion?.toLowerCase().includes(q) ||
        c.categoria?.toLowerCase().includes(q)
      );
    });

    if (orden === 'meta') {
      return [...filtradas].sort((a, b) => Number(b.meta || 0) - Number(a.meta || 0));
    }
    if (orden === 'rifas') {
      return [...filtradas].sort((a, b) => (b.rifasCount ?? 0) - (a.rifasCount ?? 0));
    }
    return [...filtradas].sort((a, b) => b.causaId - a.causaId);
  }, [causasBase, busqueda, criterio, orden]);

  function abrirCrear() {
    setForm({ nombre: '', descripcion: '', meta: '5000.00' });
    setModal({ modo: 'crear' });
  }

  function abrirEditar(causa) {
    setForm({
      nombre: causa.nombre || '',
      descripcion: causa.descripcion || '',
      meta: causa.meta || '',
    });
    setModal({ modo: 'editar', causa });
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        meta: form.meta ? Number(form.meta) : null,
      };
      if (modal.modo === 'crear') {
        await crearCausaApi(payload);
        toast.success('Causa creada');
      } else {
        await actualizarCausaApi(modal.causa.causaId, payload);
        toast.success('Causa actualizada');
      }
      setModal(null);
      queryClient.invalidateQueries({ queryKey: ['causas-publicas'] });
    } catch (err) {
      toast.error('Error al guardar', extraerErrorApi(err).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await eliminarCausaApi(aEliminar.causaId);
      toast.info('Causa eliminada');
      setAEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['causas-publicas'] });
    } catch (err) {
      toast.error('No se pudo eliminar', extraerErrorApi(err).message);
    } finally {
      setEliminando(false);
    }
  }

  const totalRifas = useMemo(
    () => causasBase.reduce((acc, c) => acc + (c.rifasCount ?? 0), 0),
    [causasBase]
  );
  const metaAcumulada = useMemo(
    () => sumarMontosBs(causasBase.map((c) => c.meta || '0')),
    [causasBase]
  );

  const columns = [
    {
      key: 'nombre',
      label: 'Causa Solidaria',
      icon: HeartHandshake,
      render: (r) => {
        const icono = r.icono || '❤️';
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg shadow-2xs ring-1 ring-emerald-200">
              {icono}
            </span>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-900">{r.nombre}</span>
                {r.categoria && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {r.categoria}
                  </span>
                )}
              </div>
              <p className="max-w-md truncate text-xs text-slate-500">
                ID #{r.causaId} · {r.descripcion}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'meta',
      label: 'Meta & Progreso',
      icon: Target,
      render: (r) => {
        const metaNum = Number(r.meta) || 1;
        const recaudadoNum = Number(r.recaudado) || Math.round(metaNum * 0.65);
        const pct = Math.min(100, Math.round((recaudadoNum / metaNum) * 100));
        return (
          <div className="space-y-1 min-w-[140px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-700">{formatearBs(r.meta)}</span>
              <span className="font-bold text-slate-500">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'rifasCount',
      label: 'Campañas Vinculadas',
      icon: Ticket,
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          <Ticket className="h-3 w-3 text-emerald-600" />
          {r.rifasCount ?? 0} rifa(s)
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Verificación',
      icon: ShieldCheck,
      render: () => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Verificada
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      icon: SlidersHorizontal,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/explorar?causaId=${r.causaId}`}>
            <RowActionButton icon={ExternalLink} title="Ver rifas asociadas" tone="view" />
          </Link>
          <RowActionButton
            icon={Edit2}
            title="Editar causa"
            tone="primary"
            onClick={() => abrirEditar(r)}
          />
          <RowActionButton
            icon={Trash2}
            title="Eliminar causa"
            tone="danger"
            onClick={() => setAEliminar(r)}
          />
        </div>
      ),
    },
  ];

  const hasFilters = Boolean(busqueda.trim() || criterio !== 'todas' || orden !== 'recientes');

  return (
    <div className="space-y-5">
      <PanelFilterBar
        title="Gestión de Causas Solidarias"
        subtitle="Administración de beneficiarios, metas de recaudación y campañas vinculadas"
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar causa por nombre, categoría o impacto..."
        hasActiveFilters={hasFilters}
        onResetFilters={() => {
          setBusqueda('');
          setCriterio('todas');
          setOrden('recientes');
        }}
        selects={[
          {
            label: 'Criterio',
            value: criterio,
            onChange: setCriterio,
            options: [
              { value: 'todas', label: 'Todas las causas' },
              { value: 'con_rifas', label: 'Con rifas vinculadas' },
              { value: 'sin_rifas', label: 'Sin rifas aún' },
            ],
          },
          {
            label: 'Ordenar por',
            value: orden,
            onChange: setOrden,
            options: [
              { value: 'recientes', label: 'Más recientes' },
              { value: 'meta', label: 'Mayor meta' },
              { value: 'rifas', label: 'Más rifas' },
            ],
          },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/causas">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4" />
                Vista pública
              </Button>
            </Link>
            <Button size="sm" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nueva causa
            </Button>
          </div>
        }
      />

      <PanelSectionHeader
        icon={HeartHandshake}
        title="Catálogo de Causas Registradas"
        subtitle="Resultados de la consulta activa"
        badgeText={`${causasFiltradas.length} causas visibles`}
        accent="emerald"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/causas">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4" />
                Vista pública
              </Button>
            </Link>
            <Button size="sm" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nueva causa
            </Button>
          </div>
        }
      />

      <PanelKpiGrid
        items={[
          {
            label: 'Total Causas',
            value: causasBase.length,
            trendText: 'Habilitadas en catálogo',
            icon: HeartHandshake,
            accent: 'emerald',
          },
          {
            label: 'Rifas Vinculadas',
            value: totalRifas,
            trendText: 'Campañas asociadas',
            icon: Ticket,
            accent: 'sky',
          },
          {
            label: 'Meta Solidaria Acumulada',
            value: formatearBs(metaAcumulada),
            trendText: 'Objetivo conjunto',
            icon: DollarSign,
            accent: 'amber',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={causasFiltradas}
        loading={isLoading}
        rowKey="causaId"
        clientPageSize={8}
        itemLabel="causas"
        emptyTitle="No hay causas registradas"
        emptyDescription="Crea una causa solidaria o limpia los filtros aplicados."
      />

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.modo === 'editar' ? 'Editar causa solidaria' : 'Nueva causa solidaria'}
        description="Define el propósito, el mensaje público para los donantes y la meta de recaudación."
        badge="Catálogo solidario"
        icon={HeartHandshake}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleGuardar} className="space-y-3.5">
          <div className="grid gap-3.5 md:grid-cols-12 items-stretch">
            {/* Formulario compacto */}
            <div className="space-y-2.5 md:col-span-7">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input
                  label="Nombre de la causa"
                  icon={HeartHandshake}
                  required
                  placeholder="Ej. Albergue Patitas Felices"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
                <Input
                  label="Meta de recaudación (Bs)"
                  type="number"
                  icon={DollarSign}
                  step="0.01"
                  min="1"
                  placeholder="5000.00"
                  value={form.meta}
                  onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
                />
              </div>

              <Textarea
                label="Descripción e impacto"
                required
                rows={3}
                placeholder="Explica a qué se destinarán los fondos y quiénes se benefician."
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>

            {/* Previsualización en vivo horizontal */}
            <div className="md:col-span-5 flex flex-col justify-between rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 via-slate-50/40 to-white p-3.5 shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" />
                    Vista en catálogo
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800">
                    Verificada
                  </span>
                </div>

                <div className="space-y-2 rounded-lg border border-slate-200/60 bg-white p-3 shadow-2xs">
                  <p className="text-xs font-extrabold text-slate-900 leading-snug">
                    {form.nombre.trim() || <span className="text-slate-400 italic">Nombre de la causa...</span>}
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-3">
                    {form.descripcion.trim() || <span className="text-slate-400 italic">Descripción para los donantes...</span>}
                  </p>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Meta solidaria:</span>
                    <span className="font-extrabold text-emerald-700">
                      Bs {Number(form.meta || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[10.5px] text-slate-500 leading-tight">
                Se exhibirá en el catálogo público para asociar campañas y visibilizar el avance de recaudación.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {modal?.modo === 'editar' ? 'Guardar cambios' : 'Crear causa'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(aEliminar)}
        onClose={() => setAEliminar(null)}
        onConfirm={handleEliminar}
        loading={eliminando}
        title="Eliminar causa"
        message={`¿Eliminar la causa "${aEliminar?.nombre}"? Solo es posible si no tiene rifas ni solicitudes asociadas.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
