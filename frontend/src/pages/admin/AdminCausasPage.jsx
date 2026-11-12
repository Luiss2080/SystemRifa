import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, Edit2, ExternalLink, HeartHandshake, Plus, Search, Trash2, X } from 'lucide-react';
import { getCausasPublicas } from '../../features/rifas/publicApi.js';
import {
  actualizarCausaApi,
  crearCausaApi,
  eliminarCausaApi,
} from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { formatearBs } from '../../utils/format.js';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { ConfirmModal, Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function AdminCausasPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [modal, setModal] = useState(null); // { modo: 'crear'|'editar', causa? }
  const [form, setForm] = useState({ nombre: '', descripcion: '', meta: '' });
  const [saving, setSaving] = useState(false);

  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const causasFiltradas = useMemo(() => {
    const items = data?.items || [];
    const q = busqueda.trim().toLowerCase();
    const filtradas = q
      ? items.filter(
          (c) => c.nombre?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q)
        )
      : [...items];

    if (orden === 'meta') {
      return [...filtradas].sort((a, b) => Number(b.meta || 0) - Number(a.meta || 0));
    }
    if (orden === 'rifas') {
      return [...filtradas].sort((a, b) => (b.rifasCount ?? 0) - (a.rifasCount ?? 0));
    }
    return filtradas;
  }, [data, busqueda, orden]);

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

  const columns = [
    { key: 'causaId', label: 'ID', render: (r) => <span className="font-mono">#{r.causaId}</span> },
    {
      key: 'nombre',
      label: 'Causa',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.nombre}</p>
          <p className="max-w-md truncate text-xs text-slate-500">{r.descripcion}</p>
        </div>
      ),
    },
    {
      key: 'meta',
      label: 'Meta',
      render: (r) => <span className="font-bold text-emerald-700">{formatearBs(r.meta)}</span>,
    },
    { key: 'rifasCount', label: 'Rifas', render: (r) => r.rifasCount ?? 0 },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (r) => (
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" title="Editar causa" onClick={() => abrirEditar(r)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" title="Eliminar causa" onClick={() => setAEliminar(r)}>
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <HeartHandshake className="h-3.5 w-3.5" />
            Catálogo solidario ({data?.items?.length ?? 0} registradas)
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Causas solidarias</h1>
          <p className="text-sm text-slate-600">
            Crea, edita y define metas financieras para las causas beneficiarias vinculadas a las rifas.
          </p>
        </div>
        <Link to="/causas">
          <Button variant="secondary" size="sm">
            <ExternalLink className="h-4 w-4" />
            Vista pública
          </Button>
        </Link>
      </div>

      {/* Buscador y botones en la misma fila */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar causa por nombre o descripción..."
            aria-label="Buscar causas"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-9 pl-9 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={orden === 'meta' ? 'emeraldSoft' : 'secondary'}
            size="sm"
            onClick={() => setOrden((o) => (o === 'meta' ? 'recientes' : 'meta'))}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {orden === 'meta' ? 'Mayor meta' : 'Ordenar por meta'}
          </Button>
          <Button
            variant={orden === 'rifas' ? 'emeraldSoft' : 'secondary'}
            size="sm"
            onClick={() => setOrden((o) => (o === 'rifas' ? 'recientes' : 'rifas'))}
          >
            Más rifas
          </Button>
          <Button size="sm" onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nueva causa
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={causasFiltradas}
        loading={isLoading}
        rowKey="causaId"
        emptyTitle="No hay causas registradas"
      />

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.modo === 'editar' ? 'Editar causa solidaria' : 'Nueva causa solidaria'}
      >
        <form onSubmit={handleGuardar} className="space-y-4">
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
          <Textarea
            label="Descripción"
            required
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          />
          <Input
            label="Meta de recaudación (Bs)"
            type="number"
            step="0.01"
            min="1"
            value={form.meta}
            onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
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
