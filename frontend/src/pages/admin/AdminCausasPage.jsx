import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Trash2 } from 'lucide-react';
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

  const [modal, setModal] = useState(null); // { modo: 'crear'|'editar', causa? }
  const [form, setForm] = useState({ nombre: '', descripcion: '', meta: '' });
  const [saving, setSaving] = useState(false);

  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

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
    { key: 'causaId', label: 'ID', render: (r) => `#${r.causaId}` },
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
    { key: 'meta', label: 'Meta', render: (r) => <span className="font-bold">{formatearBs(r.meta)}</span> },
    { key: 'rifasCount', label: 'Rifas', render: (r) => r.rifasCount ?? 0 },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (r) => (
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => abrirEditar(r)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAEliminar(r)}>
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Causas solidarias</h1>
          <p className="text-sm text-slate-500">Administra las causas sociales del sistema</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nueva causa
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
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
