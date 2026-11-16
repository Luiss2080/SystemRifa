import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error('Campos obligatorios', 'Por favor completa tu nombre, correo y mensaje.');
      return;
    }

    setEnviando(true);
    // Simulación de envío con confirmación
    await new Promise((resolve) => setTimeout(resolve, 800));
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
    <div className="space-y-12 py-2 sm:py-4">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-4 text-center py-2 sm:py-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <Mail className="h-4 w-4 text-emerald-600" />
          Atención y Canales Directos
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Canales oficiales de <span className="text-emerald-700">atención y soporte</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Estamos a tu disposición los 7 días de la semana. Transparencia, resolución rápida de
          reservas y asistencia especializada para participantes y organizadores de causas.
        </p>

        {/* Insignias de confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
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

      {/* 2. TARJETAS DE CANALES DIRECTOS */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* WhatsApp Oficial */}
        <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
          <div className="space-y-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <Phone className="h-6 w-6" />
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Respuesta Rápida
            </span>
            <h3 className="text-base font-extrabold text-slate-900">WhatsApp de Soporte</h3>
            <p className="text-xs text-slate-600">
              Validación de comprobantes, consultas de tickets y asesoría en vivo.
            </p>
            <p className="font-mono text-sm font-black text-slate-900">+591 700 20004</p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <a
              href="https://wa.me/59170020004?text=Hola%20Rifas%20Solidarias,%20deseo%20hacer%20una%20consulta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-800"
            >
              <Phone className="h-3.5 w-3.5" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
          <div className="space-y-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 shadow-2xs">
              <Mail className="h-6 w-6" />
            </span>
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
              Consultas y Convenios
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Correo Electrónico</h3>
            <p className="text-xs text-slate-600">
              Para acuerdos institucionales, soporte legal y revisión documental.
            </p>
            <p className="text-xs font-bold text-slate-900 truncate">soporte@rifassolidarias.bo</p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <a
              href="mailto:soporte@rifassolidarias.bo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              Enviar Correo
            </a>
          </div>
        </div>

        {/* Asistente RifaBot */}
        <div className="flex flex-col justify-between rounded-3xl border border-amber-200/90 bg-white p-6 shadow-xs transition hover:border-amber-300 hover:shadow-md">
          <div className="space-y-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs">
              <MessageCircle className="h-6 w-6" />
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
          <div className="mt-5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={triggerRifaBot}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-2.5 text-xs font-extrabold text-slate-950 transition hover:brightness-105 cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Abrir Chat en Vivo
            </button>
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
          <div className="space-y-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 shadow-2xs">
              <Clock className="h-6 w-6" />
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
              Horario de Verificación
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Atención Administrativa</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Lunes a Viernes:</strong> 08:00 - 19:00
              </p>
              <p>
                <strong>Sábados:</strong> 08:00 - 14:00
              </p>
              <p className="text-slate-500">Guardias activas en días de sorteo.</p>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <span className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Santa Cruz · Bolivia
            </span>
          </div>
        </div>
      </section>

      {/* 3. FORMULARIO DE CONTACTO Y UBICACIÓN */}
      <section className="mx-auto max-w-4xl grid gap-8 md:grid-cols-12 items-start">
        {/* Formulario */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs md:col-span-7">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900">Envíanos un mensaje directo</h3>
            <p className="text-xs text-slate-600">
              Completa el formulario y te responderemos por correo o WhatsApp.
            </p>
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Carlos Mendoza"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Correo electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="carlos@ejemplo.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+591 7XXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Motivo de contacto</label>
                <select
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-bold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="consulta_general">Consulta general sobre la plataforma</option>
                  <option value="pago_reserva">Duda sobre un pago o comprobante</option>
                  <option value="organizar_rifa">Deseo organizar una rifa para mi causa</option>
                  <option value="soporte_tecnico">Problema técnico o de acceso</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tu mensaje *</label>
                <textarea
                  name="mensaje"
                  rows={4}
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Detalla tu consulta o requerimiento para poder brindarte una respuesta precisa..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-medium text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{enviando ? 'Enviando mensaje...' : 'Enviar mensaje'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Panel lateral con datos institucionales */}
        <div className="space-y-6 md:col-span-5">
          <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Sede Central y Operativa
            </span>
            <h4 className="text-lg font-black text-slate-900">Rifas Solidarias Bolivia</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Iniciativa tecnológica orientada a la transparencia en recaudaciones benéficas y
              sorteos comunitarios respaldados con auditoría pública.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Santa Cruz de la Sierra · Estado Plurinacional de Bolivia</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Línea directa y WhatsApp: +591 700 20004</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>soporte@rifassolidarias.bo</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-3">
            <h5 className="text-sm font-extrabold text-slate-900">¿Eres organizador de una causa?</h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conoce nuestro programa especial para fundaciones, albergues y familias que necesitan
              financiar tratamientos médicos de emergencia con una tarifa fija de Bs 100.
            </p>
            <Link
              to="/organizar"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Conocer cómo organizar una rifa
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactoPage;
