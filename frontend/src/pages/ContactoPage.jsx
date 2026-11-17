import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  HeartHandshake,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const MOTIVOS_CONTACTO = [
  {
    id: 'consulta_general',
    label: 'Consulta general',
    icon: HelpCircle,
    color: 'emerald',
    badge: 'Plataforma',
  },
  {
    id: 'pago_reserva',
    label: 'Pago o reserva',
    icon: CreditCard,
    color: 'amber',
    badge: 'Comprobantes',
  },
  {
    id: 'organizar_rifa',
    label: 'Organizar rifa',
    icon: HeartHandshake,
    color: 'sky',
    badge: 'Causas',
  },
  {
    id: 'soporte_tecnico',
    label: 'Soporte técnico',
    icon: LifeBuoy,
    color: 'rose',
    badge: 'Acceso / Errores',
  },
];

export function ContactoPage() {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'consulta_general',
    mensaje: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function aplicarSugerencia(texto) {
    setForm((prev) => ({
      ...prev,
      mensaje: prev.mensaje ? `${prev.mensaje}\n${texto}` : texto,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error('Campos obligatorios', 'Por favor completa tu nombre, correo y mensaje.');
      return;
    }

    setEnviando(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setEnviando(false);
    setEnviado(true);
    toast.success(
      'Mensaje recibido',
      'Gracias por comunicarte con nosotros. Un asesor te responderá a la brevedad.'
    );
  }

  function triggerRifaBot() {
    window.dispatchEvent(new window.CustomEvent('open-help-widget'));
  }

  return (
    <div className="space-y-8 sm:space-y-10 py-1 sm:py-2">
      {/* 1. HERO COMERCIAL ABIERTO */}
      <section className="mx-auto max-w-3xl space-y-3.5 text-center py-1 sm:py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <Mail className="h-4 w-4 text-emerald-600" />
          Atención y Canales Directos
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Canales oficiales de <span className="text-emerald-700">atención y soporte</span>
        </h1>

        <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
          Estamos a tu disposición los 7 días de la semana. Transparencia, resolución rápida de
          reservas y asistencia especializada para participantes y organizadores de causas.
        </p>

        {/* Insignias de confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Respuesta promedio &lt; 10 min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <MessageCircle className="h-3.5 w-3.5 text-amber-600" />
            Asistente RifaBot 24/7
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            Validación de pagos oficial
          </span>
        </div>
      </section>

      {/* 2. TARJETAS DE CANALES DIRECTOS (ANCHO COMPLETO) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* WhatsApp Oficial */}
        <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
          <div className="space-y-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <Phone className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Canal Prioritario
            </span>
            <h3 className="text-base font-extrabold text-slate-900">WhatsApp de Soporte</h3>
            <p className="text-xs text-slate-600">
              Atención directa para consultas de tickets y asesoría en vivo.
            </p>
            <p className="text-xs font-bold text-emerald-700">+591 700 20004</p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <a
              href="https://wa.me/59170020004"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-800"
            >
              <Phone className="h-3.5 w-3.5" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="flex flex-col justify-between rounded-3xl border border-sky-200/90 bg-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md">
          <div className="space-y-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 shadow-2xs">
              <Mail className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
              Formal y Auditoría
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Mesa de Entrada Digital</h3>
            <p className="text-xs text-slate-600">
              Consultas institucionales, soporte legal y revisión documental.
            </p>
            <p className="text-xs font-bold text-sky-700">soporte@rifassolidarias.bo</p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <a
              href="mailto:soporte@rifassolidarias.bo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-extrabold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Mail className="h-3.5 w-3.5" />
              Enviar Correo
            </a>
          </div>
        </div>

        {/* Asistente RifaBot */}
        <div className="flex flex-col justify-between rounded-3xl border border-amber-200/90 bg-white p-5 shadow-xs transition hover:border-amber-300 hover:shadow-md">
          <div className="space-y-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              En línea 24/7
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Asistente Virtual RifaBot</h3>
            <p className="text-xs text-slate-600">
              Respuestas instantáneas sobre reservas de 15 minutos, pagos QR y sorteos.
            </p>
            <p className="text-xs font-bold text-emerald-700">Disponible ahora</p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <button
              type="button"
              onClick={triggerRifaBot}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-2 text-xs font-extrabold text-slate-950 transition hover:brightness-105 cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Abrir Chat en Vivo
            </button>
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
          <div className="space-y-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 shadow-2xs">
              <Clock className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
              Horario de Verificación
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Atención Administrativa</h3>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p>
                <strong>Lunes a Viernes:</strong> 08:00 - 19:00
              </p>
              <p>
                <strong>Sábados:</strong> 08:00 - 14:00
              </p>
              <p className="text-slate-500 text-[11px]">Guardias activas en días de sorteo.</p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3.5">
            <span className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Santa Cruz · Bolivia
            </span>
          </div>
        </div>
      </section>

      {/* 3. FORMULARIO DE CONTACTO Y UBICACIÓN (ANCHO TOTAL ALINEADO CON EL RESTO DE SECCIONES) */}
      <section className="w-full grid gap-6 lg:grid-cols-12 items-start">
        {/* Formulario Principal con Iconos e Interfaz Intuitiva */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs lg:col-span-7 xl:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Send className="h-4 w-4" />
                </span>
                <h3 className="text-xl font-black text-slate-900">Envíanos un mensaje directo</h3>
              </div>
              <p className="text-xs text-slate-600">
                Completa el formulario y te responderemos por correo electrónico o WhatsApp.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Respuesta &lt; 15 min
            </span>
          </div>

          {enviado ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">¡Mensaje enviado con éxito!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Hemos recibido tu consulta correctamente. Un agente de soporte se contactará contigo
                en breve.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEnviado(false);
                    setForm({
                      nombre: '',
                      email: '',
                      telefono: '',
                      asunto: 'consulta_general',
                      mensaje: '',
                    });
                  }}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Selector de Motivo Rápido e Intuitivo */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>¿Sobre qué tema es tu consulta?</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">Selección rápida</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {MOTIVOS_CONTACTO.map((m) => {
                    const Icon = m.icon;
                    const seleccionado = form.asunto === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, asunto: m.id }))}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-center transition cursor-pointer ${
                          seleccionado
                            ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-emerald-300 hover:bg-white'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                            seleccionado
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 ring-1 ring-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-[11px] font-extrabold leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre completo con icono */}
              <div className="space-y-1.5">
                <label htmlFor="contacto-nombre" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Nombre completo</span>
                  <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="contacto-nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Carlos Mendoza"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              {/* Correo y Teléfono en dos columnas alineadas con iconos */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="contacto-email" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Correo electrónico</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="contacto-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="carlos@ejemplo.com"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contacto-telefono" className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Teléfono / WhatsApp</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Opcional</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="contacto-telefono"
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+591 7XXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              {/* Mensaje con icono y contador */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="contacto-mensaje" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tu mensaje o requerimiento</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {form.mensaje.length > 0 ? `${form.mensaje.length} caracteres` : 'Mínimo 10 caracteres'}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="contacto-mensaje"
                    name="mensaje"
                    rows={4}
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Detalla tu consulta o requerimiento para poder brindarte una respuesta precisa..."
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                  />
                </div>

                {/* Sugerencias de consulta rápida para mayor intuición */}
                <div className="pt-1 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500">¿Consultas frecuentes? Pulsa para rellenar:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGERENCIAS_MENSAJE.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => aplicarSugerencia(sug)}
                        className="rounded-lg border border-slate-200 bg-slate-100/70 px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer text-left"
                      >
                        &ldquo;{sug}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pie del formulario con botón con icono y nota de seguridad */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 order-2 sm:order-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Tus datos son privados y tratados con total confidencialidad.</span>
                </p>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm shadow-emerald-700/20 transition hover:brightness-105 active:scale-[0.99] cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Enviar mensaje directo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Panel lateral con datos institucionales alineado */}
        <div className="space-y-4 lg:col-span-5 xl:col-span-4">
          <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-6 space-y-3.5 shadow-2xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Sede Central y Operativa
            </span>
            <h4 className="text-lg font-black text-slate-900">Rifas Solidarias Bolivia</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Iniciativa tecnológica orientada a la transparencia en recaudaciones benéficas y
              sorteos comunitarios respaldados con auditoría pública.
            </p>
            <div className="space-y-2.5 pt-1 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-slate-900 font-bold">Oficina Central</strong>
                  <span className="text-slate-600">Santa Cruz de la Sierra · Bolivia</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-slate-900 font-bold">Teléfono & WhatsApp</strong>
                  <span className="text-slate-600">+591 700 20004</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-slate-900 font-bold">Correo de Soporte</strong>
                  <span className="text-slate-600">soporte@rifassolidarias.bo</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-100">
              <a
                href="https://wa.me/59170020004"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white py-2 text-xs font-extrabold text-emerald-800 shadow-2xs transition hover:bg-emerald-50"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                Contactar asesor por WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-3 shadow-2xs">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Trophy className="h-5 w-5" />
            </span>
            <h5 className="text-sm font-extrabold text-slate-900">¿Eres organizador de una causa?</h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conoce nuestro programa especial para fundaciones, albergues y familias que necesitan
              financiar tratamientos médicos o proyectos con una tarifa fija única de Bs 100.
            </p>
            <div className="pt-1">
              <Link
                to="/organizar"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-700"
              >
                <span>Conocer cómo organizar una rifa</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactoPage;
