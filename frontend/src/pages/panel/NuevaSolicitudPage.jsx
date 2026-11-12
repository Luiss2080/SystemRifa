import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calculator, CalendarClock, FilePlus2 } from 'lucide-react';
import { getCausasPublicas } from '../../features/rifas/publicApi.js';
import { crearSolicitudApi } from '../../features/panel/panelApi.js';
import { extraerErrorApi } from '../../utils/apiError.js';
import {
  deDatetimeLocalLaPazAUtcIso,
  formatearBs,
  multiplicarMontoBs,
} from '../../utils/format.js';
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

  const resumenEstimado = useMemo(() => {
    const cantidad = Math.max(0, parseInt(form.cantidadTickets || '0', 10) || 0);
    const total = multiplicarMontoBs(form.precioTicket || '0', cantidad);

    let duracionTexto = 'Selecciona inicio y fin';
    let fechasInvalidas = false;
    if (form.fechaInicio && form.fechaFin) {
      const inicioMs = new Date(deDatetimeLocalLaPazAUtcIso(form.fechaInicio)).getTime();
      const finMs = new Date(deDatetimeLocalLaPazAUtcIso(form.fechaFin)).getTime();
      const diffHoras = Math.round((finMs - inicioMs) / (1000 * 60 * 60));
      if (diffHoras <= 0) {
        fechasInvalidas = true;
        duracionTexto = 'La fecha fin debe ser posterior al inicio';
      } else if (diffHoras < 24) {
        duracionTexto = `${diffHoras} hora(s)`;
      } else {
        const dias = Math.floor(diffHoras / 24);
        const remH = diffHoras % 24;
        duracionTexto = remH ? `${dias} día(s) y ${remH}h` : `${dias} día(s)`;
      }
    }
    return { cantidad, total, duracionTexto, fechasInvalidas };
  }, [form.cantidadTickets, form.precioTicket, form.fechaInicio, form.fechaFin]);

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

  const nombreCausaSeleccionada =
    causasOpciones.find((c) => c.value === form.causaId)?.label || 'Causa solidaria abierta';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Estudio de nueva campaña
          </h1>
          <p className="text-sm text-slate-600">
            Configura tu propuesta de rifa solidaria y previsualiza su alcance antes de enviarla a revisión.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md lg:col-span-7"
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

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => navigate('/solicitudes/mias')}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Enviar solicitud a revisión
            </Button>
          </div>
        </form>

        {/* Vista previa en tiempo real */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 px-5 py-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                Vista previa en vivo
              </p>
              <h2 className="mt-1 text-lg font-extrabold">
                {form.nombre.trim() || 'Tu próxima rifa solidaria'}
              </h2>
              <p className="mt-0.5 text-xs text-emerald-50">{nombreCausaSeleccionada}</p>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-xs leading-relaxed text-slate-600">
                {form.descripcion.trim() ||
                  'Aquí aparecerá la descripción pública de tu campaña junto a las condiciones y premios que cargues tras la aprobación.'}
              </p>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3.5 text-xs">
                <div>
                  <p className="text-slate-500">Ticket individual</p>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                    {formatearBs(form.precioTicket || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Emisión total</p>
                  <p className="mt-0.5 text-base font-extrabold text-slate-900">
                    {resumenEstimado.cantidad} nros
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calculator className="h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-emerald-800">Potencial de recaudación (100%)</p>
                    <p className="text-lg font-extrabold text-emerald-900">
                      {formatearBs(resumenEstimado.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 border-t border-emerald-200/70 pt-2.5">
                  <CalendarClock
                    className={`h-4 w-4 shrink-0 ${
                      resumenEstimado.fechasInvalidas ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  />
                  <div>
                    <p className="text-emerald-800">Duración de campaña</p>
                    <p
                      className={`text-sm font-bold ${
                        resumenEstimado.fechasInvalidas ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {resumenEstimado.duracionTexto}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
