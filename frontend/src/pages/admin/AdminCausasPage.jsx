import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  Edit2,
  ExternalLink,
  HeartHandshake,
  Plus,
  SlidersHorizontal,
  Target,
  Ticket,
  Trash2,
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

  const causasBase = useMemo(() => data?.items || [], [data]);

  const causasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = causasBase.filter((c) => {
      if (criterio === 'con_rifas' && (c.rifasCount ?? 0) === 0) return false;
      if (criterio === 'sin_rifas' && (c.rifasCount ?? 0) > 0) return false;
      if (!q) return true;
      return c.nombre?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q);
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
      toast.error('Error al guardar causa', extraerErrorApi(err).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await eliminarCausaApi(aEliminar.causaId);
      setAEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['causas-publicas'] });
      toast.success('Causa eliminada');
    } catch (err) {
      toast.error('No se pudo eliminar', extraerErrorApi(err).message);
    } finally {
      setEliminando(false);
    }
  }

  const totalRifas = causasBase.reduce((acc, c) => acc + (c.rifasCount ?? 0), 0);
  const metaAcumulada = sumarMontosBs(causasBase.map((c) => c.meta || '0'));

  const columns = [
    {
      key: 'nombre',
      label: 'Causa Solidaria',
      icon: HeartHandshake,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.nombre}</p>
          <p className="max-w-md truncate text-xs text-slate-500">
            ID #{r.causaId} · {r.descripcion}
          </p>
        </div>
      ),
    },
    {
      key: 'meta',
      label: 'Meta Objetivo',
      icon: Target,
      render: (r) => (
        <span className="text-base font-extrabold text-emerald-700">{formatearBs(r.meta)}</span>
      ),
    },
    {
      key: 'rifasCount',
      label: 'Rifas Vinculadas',
      icon: Ticket,
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {r.rifasCount ?? 0} campaña(s)
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
        searchPlaceholder="Buscar causa por nombre o impacto..."
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
      />

      <PanelSectionHeader
        icon={HeartHandshake}
        title="Catálogo de Causas Registradas"
        subtitle="Resultados de la consulta activa"
        badgeText={`${causasFiltradas.length} causas visibles`}
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
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleGuardar} className="space-y-4">
          <Input
            label="Nombre de la causa"
            icon={HeartHandshake}
            required
            placeholder="Ej. Albergue Patitas Felices"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
          <Textarea
            label="Descripción e impacto"
            required
            rows={4}
            placeholder="Explica a qué se destinarán los fondos y quiénes se benefician."
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          />
          <Input
            label="Meta de recaudación (Bs)"
            type="number"
            icon={DollarSign}
            step="0.01"
            min="1"
            placeholder="5000.00"
            helperText="Se mostrará como referencia de progreso para las campañas vinculadas."
            value={form.meta}
            onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
          />
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
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
