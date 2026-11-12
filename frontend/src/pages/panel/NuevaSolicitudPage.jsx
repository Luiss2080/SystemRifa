import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilePlus2 } from 'lucide-react';
import { getCausasPublicas } from '../../features/rifas/publicApi.js';
import { crearSolicitudApi } from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import { deDatetimeLocalLaPazAUtcIso } from '../../utils/format.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function NuevaSolicitudPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data: causasData } = useQuery({
    queryKey: ['causas-publicas'],
    queryFn: getCausasPublicas,
  });

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precioTicket: '10.00',
    cantidadTickets: '100',
    fechaInicio: '',
    fechaFin: '',
    causaId: '',
  });
  const [saving, setSaving] = useState(false);

  const causasOpciones = (causasData?.items || []).map((c) => ({
    value: String(c.causaId),
    label: c.nombre,
  }));

  async function handleSubmit(e) {
    e.preventDefault();
    const inicioIso = deDatetimeLocalLaPazAUtcIso(form.fechaInicio);
    const finIso = deDatetimeLocalLaPazAUtcIso(form.fechaFin);
    if (!inicioIso || !finIso) {
      toast.error('Fechas inválidas', 'Debes seleccionar fecha de inicio y finalización.');
      return;
    }

    setSaving(true);
    try {
      await crearSolicitudApi({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precioTicket: Number(form.precioTicket),
        cantidadTickets: Number(form.cantidadTickets),
        fechaInicio: inicioIso,
        fechaFin: finIso,
        causaId: form.causaId ? Number(form.causaId) : null,
      });
      toast.success('Solicitud enviada', 'Tu solicitud pasó a revisión administrativa.');
      navigate('/solicitudes/mias');
    } catch (err) {
      toast.error('No se pudo enviar', extraerErrorApi(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solicitar nueva rifa</h1>
          <p className="text-sm text-slate-500">
            Envía tu propuesta para revisión. Una vez aprobada podrás cargar los premios.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <Input
          label="Nombre de la rifa"
          required
          minLength={3}
          placeholder="Ej. Rifa Solidaria Pro Salud"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
        />

        <Textarea
          label="Descripción"
          placeholder="Describe el objetivo de la rifa, condiciones de entrega, etc."
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
        />

        <Select
          label="Causa solidaria"
          placeholder="Sin causa específica (o elige una)"
          options={causasOpciones}
          value={form.causaId}
          onChange={(e) => setForm((f) => ({ ...f, causaId: e.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Precio por ticket (Bs)"
            type="number"
            step="0.01"
            min="0.50"
            required
            value={form.precioTicket}
            onChange={(e) => setForm((f) => ({ ...f, precioTicket: e.target.value }))}
          />
          <Input
            label="Cantidad de tickets"
            type="number"
            min="1"
            max="10000"
            required
            value={form.cantidadTickets}
            onChange={(e) => setForm((f) => ({ ...f, cantidadTickets: e.target.value }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Fecha y hora de inicio (La Paz)"
            type="datetime-local"
            required
            value={form.fechaInicio}
            onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
          />
          <Input
            label="Fecha y hora de fin (La Paz)"
            type="datetime-local"
            required
            value={form.fechaFin}
            onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => navigate('/solicitudes/mias')}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Enviar solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}
