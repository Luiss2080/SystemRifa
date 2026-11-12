import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Eye } from 'lucide-react';
import {
  actualizarTipoNotificacionApi,
  getTiposNotificacionApi,
} from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageSpinner } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const EJEMPLOS_VARIABLES = {
  alias: 'AnaSolidaria',
  nombreRifa: 'Rifa Pro Hogar Infantil',
  estado: 'PAGO_CONFIRMADO',
  observacion: 'Comprobante validado',
  numeros: '12, 24',
  minutos: '15',
  monto: '50.00',
  motivo: 'Referencia bancaria no coincide',
  numeroGanador: '24',
  premio: 'Bicicleta Montañera',
};

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

  const varsAdmitidas = useMemo(
    () => (Array.isArray(editando?.variables) ? editando.variables : []),
    [editando]
  );

  async function handleGuardar(e) {
    e.preventDefault();
    if (!editando) return;
    setSaving(true);
    try {
      await actualizarTipoNotificacionApi(editando.tipoNotificacionId, {
        plantillaTitulo: form.plantillaTitulo,
        plantillaMensaje: form.plantillaMensaje,
        estaActivo: form.estaActivo,
      });
      setEditando(null);
      queryClient.invalidateQueries({ queryKey: ['admin-plantillas'] });
      toast.success('Plantilla actualizada');
    } catch (err) {
      toast.error('Error al actualizar plantilla', extraerErrorApi(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <FullPageSpinner message="Cargando plantillas de notificación..." />;

  const items = data?.items || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plantillas de notificación</h1>
        <p className="text-sm text-slate-500">
          Personaliza títulos y mensajes respetando únicamente las variables admitidas de cada evento
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((tipo) => (
          <div
            key={tipo.tipoNotificacionId}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">{tipo.codigo}</span>
                <Badge color={tipo.estaActivo ? 'emerald' : 'slate'}>
                  {tipo.estaActivo ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-slate-800">{tipo.plantillaTitulo}</p>
              <p className="text-xs text-slate-600">{tipo.plantillaMensaje}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(tipo.variables || []).map((v) => (
                  <span
                    key={v}
                    className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
                  >
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <Button variant="secondary" size="sm" onClick={() => abrirEditar(tipo)}>
                <Edit2 className="h-3.5 w-3.5" />
                Editar y previsualizar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        title={`Editar plantilla · ${editando?.codigo || ''}`}
        maxWidth="max-w-2xl"
      >
        {editando && (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <strong>Variables admitidas:</strong>{' '}
              {varsAdmitidas.length
                ? varsAdmitidas.map((v) => `{${v}}`).join(', ')
                : 'Ninguna'}
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

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1">
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
