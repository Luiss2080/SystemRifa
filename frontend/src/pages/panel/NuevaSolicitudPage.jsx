import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calculator,
  CalendarClock,
  CheckCircle2,
  Coins,
  FilePlus2,
  Hash,
  HeartHandshake,
  Sparkles,
  Ticket,
} from 'lucide-react';
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

  const listoParaEnviar =
    form.nombre.trim().length >= 3 &&
    Number(form.precioTicket) >= 0.5 &&
    Number(form.cantidadTickets) >= 1 &&
    Boolean(form.fechaInicio && form.fechaFin) &&
    !resumenEstimado.fechasInvalidas;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-white/95 px-6 py-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
            <FilePlus2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Crear nueva campaña
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200/80">
                <Sparkles className="h-3 w-3" />
                Propuesta de rifa
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Define los detalles de tu rifa solidaria y previsualiza su alcance antes de enviarla a revisión.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/solicitudes/mias')}
        >
          <ArrowLeft className="h-4 w-4" />
          Mis solicitudes
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[26px] border border-slate-200/80 bg-white/95 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md lg:col-span-7"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-700">
                1
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                Identidad de la campaña
              </h2>
            </div>

            <Input
              label="Nombre de la rifa"
              icon={Ticket}
              required
              minLength={3}
              placeholder="Ej. Rifa Solidaria Pro Salud"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />

            <Textarea
              label="Descripción pública"
              rows={3}
              placeholder="Describe el objetivo de la rifa, condiciones de entrega, etc."
              helperText="Este resumen orientará a los participantes y revisores sobre el fin solidario."
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />

            <Select
              label="Causa solidaria asociada"
              placeholder="Sin causa específica (o elige una)"
              options={causasOpciones}
              value={form.causaId}
              onChange={(e) => setForm((f) => ({ ...f, causaId: e.target.value }))}
            />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-extrabold text-sky-700">
                2
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                Emisión, precio y vigencia (Hora Bolivia)
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Precio por ticket (Bs)"
                type="number"
                icon={Coins}
                step="0.01"
                min="0.50"
                required
                value={form.precioTicket}
                onChange={(e) => setForm((f) => ({ ...f, precioTicket: e.target.value }))}
              />
              <Input
                label="Cantidad de tickets"
                type="number"
                icon={Hash}
                min="1"
                max="10000"
                required
                helperText="Máximo 10,000 números por emisión"
                value={form.cantidadTickets}
                onChange={(e) => setForm((f) => ({ ...f, cantidadTickets: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Fecha y hora de inicio"
                type="datetime-local"
                required
                value={form.fechaInicio}
                onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
              />
              <Input
                label="Fecha y hora de fin"
                type="datetime-local"
                required
                value={form.fechaFin}
                onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                listoParaEnviar ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {listoParaEnviar ? 'Propuesta completa y lista para revisión' : 'Completa los campos obligatorios'}
            </span>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="secondary"
                className="flex-1 sm:flex-initial"
                onClick={() => navigate('/solicitudes/mias')}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving} className="flex-1 sm:flex-initial">
                Enviar solicitud a revisión
              </Button>
            </div>
          </div>
        </form>

        {/* Vista previa en tiempo real */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5 backdrop-blur-md lg:sticky lg:top-24">
            <div className="relative bg-gradient-to-br from-emerald-800 via-teal-700 to-slate-900 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">
                  <Sparkles className="h-3 w-3" />
                  Vista previa en vivo
                </p>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-200 ring-1 ring-amber-300/30">
                  EN REVISIÓN
                </span>
              </div>
              <h2 className="mt-3 text-lg font-extrabold leading-snug">
                {form.nombre.trim() || 'Tu próxima rifa solidaria'}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-emerald-100">
                <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
                {nombreCausaSeleccionada}
              </p>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-xs leading-relaxed text-slate-600">
                {form.descripcion.trim() ||
                  'Aquí aparecerá la descripción pública de tu campaña junto a las condiciones y premios que cargues tras la aprobación.'}
              </p>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-xs">
                <div>
                  <p className="text-slate-500">Ticket individual</p>
                  <p className="mt-0.5 text-lg font-extrabold text-emerald-700">
                    {formatearBs(form.precioTicket || '0')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Emisión total</p>
                  <p className="mt-0.5 text-lg font-extrabold text-slate-900">
                    {resumenEstimado.cantidad} nros
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Calculator className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-medium text-emerald-800">Potencial de recaudación (100%)</p>
                    <p className="text-lg font-extrabold text-emerald-950">
                      {formatearBs(resumenEstimado.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-emerald-200/70 pt-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      resumenEstimado.fechasInvalidas
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <CalendarClock className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-medium text-emerald-800">Duración de campaña</p>
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
