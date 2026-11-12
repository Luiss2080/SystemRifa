import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Bot,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const WHATSAPP_NUMBER = '59170020004';
const WHATSAPP_DISPLAY = '+591 700 20004';

const FAQ_TOPICS = [
  {
    id: 'reservar',
    pregunta: '¿Cómo reservo mis números?',
    respuesta:
      'Entra a cualquier rifa activa del catálogo, selecciona tus números disponibles en el tablero en tiempo real y presiona "Reservar". Quedarán bloqueados solo para ti durante 15 minutos.',
    ctaLabel: 'Explorar rifas',
    ctaTo: '/',
  },
  {
    id: 'pagos',
    pregunta: '¿Cómo envío mi comprobante de pago?',
    respuesta:
      'Una vez reservados tus tickets, ve a "Mis pagos" o usa el botón de pago directo en la rifa para adjuntar tu comprobante y referencia. Nuestro equipo lo verificará en minutos.',
    ctaLabel: 'Ir a Mis pagos',
    ctaTo: '/mis-pagos',
  },
  {
    id: 'organizar',
    pregunta: '¿Cómo puedo organizar una rifa?',
    respuesta:
      'Inicia sesión o crea una cuenta gratuita, ingresa a "Organizar rifa" y envía tu solicitud indicando la causa solidaria, premios y cantidad de tickets.',
    ctaLabel: 'Solicitar rifa',
    ctaTo: '/solicitudes/nueva',
  },
  {
    id: 'sorteo',
    pregunta: '¿Cómo se garantizan los sorteos?',
    respuesta:
      'Solo participan tickets con pago verificado y aprobado. Cada sorteo queda registrado en auditoría inmutable y el resultado público muestra únicamente el alias del ganador.',
    ctaLabel: 'Ver causas verificadas',
    ctaTo: '/causas',
  },
];

const WHATSAPP_PRESETS = [
  'Hola, quiero consultar sobre la verificación de un pago.',
  'Hola, me gustaría organizar una rifa solidaria.',
  'Hola, necesito ayuda con mis tickets reservados.',
];

function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.49 0 .14 5.34.14 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.29-1.65a11.88 11.88 0 0 0 5.77 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.47-8.42ZM12.06 21.8h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.73.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function FloatingWidgets() {
  const navigate = useNavigate();
  const [botOpen, setBotOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(FAQ_TOPICS[0]);
  const [consulta, setConsulta] = useState('');
  const [waMensaje, setWaMensaje] = useState(WHATSAPP_PRESETS[0]);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 360);
    }
    function onOpenHelp() {
      setWaOpen(false);
      setBotOpen(true);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('open-help-widget', onOpenHelp);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('open-help-widget', onOpenHelp);
    };
  }, []);

  function handleAskSubmit(e) {
    e.preventDefault();
    const q = consulta.trim().toLowerCase();
    if (!q) return;
    const match =
      FAQ_TOPICS.find(
        (t) =>
          t.pregunta.toLowerCase().includes(q) ||
          t.respuesta.toLowerCase().includes(q) ||
          (q.includes('pago') && t.id === 'pagos') ||
          (q.includes('reserv') && t.id === 'reservar') ||
          (q.includes('numero') && t.id === 'reservar') ||
          (q.includes('organiz') && t.id === 'organizar') ||
          (q.includes('sorteo') && t.id === 'sorteo') ||
          (q.includes('ganador') && t.id === 'sorteo')
      ) || FAQ_TOPICS[0];
    setSelectedTopic(match);
    setConsulta('');
  }

  async function handleCopyPhone() {
    try {
      await navigator.clipboard.writeText(WHATSAPP_DISPLAY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso si el navegador bloquea portapapeles
    }
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMensaje)}`;

  return (
    <>
      {/* Widget Inferior Izquierdo: Asistente Virtual / Centro de Ayuda */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-3">
        {botOpen && (
          <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">RifaBot · Ayuda Rápida</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Respuestas instantáneas 24/7
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBotOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Cerrar asistente"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-1.5">
                {FAQ_TOPICS.map((topic) => {
                  const active = selectedTopic.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      {topic.pregunta}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-slate-700">
                <p className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
                  {selectedTopic.pregunta}
                </p>
                <p className="mt-1.5 leading-relaxed text-slate-600">{selectedTopic.respuesta}</p>
                <button
                  type="button"
                  onClick={() => {
                    setBotOpen(false);
                    navigate(selectedTopic.ctaTo);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-800 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  {selectedTopic.ctaLabel}
                </button>
              </div>

              <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  placeholder="Escribe una duda (ej. pagos, reserva)..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 cursor-pointer"
                  aria-label="Consultar asistente"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setBotOpen((v) => !v);
            setWaOpen(false);
          }}
          aria-label="Abrir asistente virtual de ayuda"
          aria-expanded={botOpen}
          title="Asistente RifaBot"
          className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-900/25 ring-2 ring-white/90 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl cursor-pointer"
        >
          {botOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
          {!botOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" />
            </span>
          )}
        </button>
      </div>

      {/* Widget Inferior Derecho: WhatsApp Directo + Volver arriba */}
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2.5">
        {waOpen && (
          <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xs">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">Soporte WhatsApp</p>
                  <p className="text-[11px] text-emerald-100">Atención comercial y pagos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaOpen(false)}
                className="rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Cerrar WhatsApp"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-100">
                <p className="font-semibold text-slate-800">¡Hola! ¿En qué podemos ayudarte?</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Elige un mensaje rápido o escribe tu consulta antes de abrir el chat.
                </p>
              </div>

              <div className="space-y-1.5">
                {WHATSAPP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWaMensaje(preset)}
                    className={`w-full rounded-xl border px-3 py-1.5 text-left text-[11px] transition cursor-pointer ${
                      waMensaje === preset
                        ? 'border-emerald-400 bg-emerald-50 font-semibold text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={waMensaje}
                onChange={(e) => setWaMensaje(e.target.value)}
                aria-label="Mensaje de WhatsApp"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1ebe5d]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Abrir WhatsApp
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  title={`Copiar ${WHATSAPP_DISPLAY}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </button>
              </div>

              <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Canal oficial · {WHATSAPP_DISPLAY}
              </p>
            </div>
          </div>
        )}

        {showTop && !waOpen && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
            title="Subir al inicio"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setWaOpen((v) => !v);
            setBotOpen(false);
          }}
          aria-label="Abrir soporte por WhatsApp"
          aria-expanded={waOpen}
          title="WhatsApp directo"
          className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/90 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#1ebe5d] cursor-pointer"
        >
          {waOpen ? <X className="h-5 w-5" /> : <WhatsAppIcon className="h-7 w-7" />}
          {!waOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}
