import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext.jsx';

const WHATSAPP_NUMBER = '59170020004';
const WHATSAPP_DISPLAY = '+591 700 20004';

const FAQ_TOPICS = [
  {
    id: 'reservar',
    chip: 'Reservar',
    pregunta: '¿Cómo reservo mis números?',
    respuesta:
      'Entra a cualquier rifa activa del catálogo, elige tus números disponibles en tiempo real (o usa "Al azar") y presiona "Reservar". Quedarán bloqueados exclusivamente para ti por 15 minutos.',
    ctaLabel: 'Explorar rifas',
    ctaTo: '/',
  },
  {
    id: 'pagos',
    chip: 'Pagos / QR',
    pregunta: '¿Cómo envío mi comprobante de pago?',
    respuesta:
      'Con tus tickets reservados, abre "Mis pagos" o usa el formulario tras confirmar tu reserva para registrar tu referencia de transferencia o QR. Administración lo verifica y te notifica al instante.',
    ctaLabel: 'Ir a Mis pagos',
    ctaTo: '/mis-pagos',
  },
  {
    id: 'organizar',
    chip: 'Organizar',
    pregunta: '¿Cómo puedo organizar una rifa?',
    respuesta:
      'Crea una cuenta gratuita o inicia sesión, entra a "Solicitar nueva rifa" y envía tu propuesta indicando la causa social, premios, precio y fecha de cierre para revisión.',
    ctaLabel: 'Solicitar rifa',
    ctaTo: '/solicitudes/nueva',
  },
  {
    id: 'sorteo',
    chip: 'Sorteos',
    pregunta: '¿Cómo se garantizan los sorteos?',
    respuesta:
      'Solo participan tickets con pago verificado. Cada sorteo queda registrado en auditoría inmutable y el resultado público muestra únicamente el alias ganador protegiendo tu privacidad.',
    ctaLabel: 'Ver causas verificadas',
    ctaTo: '/causas',
  },
  {
    id: 'cuenta',
    chip: 'Crear cuenta',
    pregunta: '¿Cómo creo mi cuenta para participar?',
    respuesta:
      'Haz clic en "Crear cuenta", completa tu nombre, correo, alias público y contraseña segura. Con tu cuenta podrás reservar boletos, subir comprobantes y recibir alertas de sorteos.',
    ctaLabel: 'Crear cuenta gratis',
    ctaTo: '/registro',
  },
];

const WHATSAPP_PRESETS = [
  'Hola, quiero consultar sobre la verificación de un pago.',
  'Hola, me gustaría organizar una rifa solidaria.',
  'Hola, necesito ayuda con mis tickets reservados.',
];

function horaActual() {
  return new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

function crearMensajeInicial() {
  return [
    {
      id: 'welcome',
      role: 'bot',
      hora: horaActual(),
      texto:
        '¡Hola! Soy RifaBot, asistente de Rifas Solidarias. Puedo ayudarte con reservas de números, pagos por QR/transferencia, creación de cuenta o cómo organizar tu propia campaña. ¿Qué deseas consultar?',
    },
  ];
}

function buscarRespuestaBot(texto) {
  const q = texto.trim().toLowerCase();
  if (!q) return null;

  const exact = FAQ_TOPICS.find(
    (t) =>
      (q.includes('pago') && t.id === 'pagos') ||
      (q.includes('comprob') && t.id === 'pagos') ||
      (q.includes('qr') && t.id === 'pagos') ||
      (q.includes('transfer') && t.id === 'pagos') ||
      (q.includes('reserv') && t.id === 'reservar') ||
      (q.includes('numero') && t.id === 'reservar') ||
      (q.includes('número') && t.id === 'reservar') ||
      (q.includes('ticket') && t.id === 'reservar') ||
      (q.includes('bolet') && t.id === 'reservar') ||
      (q.includes('organiz') && t.id === 'organizar') ||
      (q.includes('solicit') && t.id === 'organizar') ||
      (q.includes('campa') && t.id === 'organizar') ||
      (q.includes('sorteo') && t.id === 'sorteo') ||
      (q.includes('ganador') && t.id === 'sorteo') ||
      (q.includes('auditor') && t.id === 'sorteo') ||
      (q.includes('segur') && t.id === 'sorteo') ||
      (q.includes('causa') && t.id === 'sorteo') ||
      (q.includes('cuenta') && t.id === 'cuenta') ||
      (q.includes('registr') && t.id === 'cuenta') ||
      (q.includes('crear') && t.id === 'cuenta') ||
      t.pregunta.toLowerCase().includes(q)
  );

  if (exact) return exact;

  return {
    id: 'general',
    respuesta:
      'Puedo orientarte con reservas de números (15 min), registro de comprobantes de pago, creación de cuenta, solicitudes para organizar rifas o verificación de sorteos. Selecciona una opción rápida abajo o escríbenos por WhatsApp.',
    ctaLabel: 'Ver catálogo activo',
    ctaTo: '/',
  };
}

function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.49 0 .14 5.34.14 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.29-1.65a11.88 11.88 0 0 0 5.77 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.47-8.42ZM12.06 21.8h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.73.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function FloatingWidgets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { autenticado } = useAuth();
  const [isLgScreen, setIsLgScreen] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  const [botOpen, setBotOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [messages, setMessages] = useState(() => crearMensajeInicial());
  const [consulta, setConsulta] = useState('');
  const [waMensaje, setWaMensaje] = useState(WHATSAPP_PRESETS[0]);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const chatEndRef = useRef(null);

  const tienePanelSidebar =
    autenticado && !['/', '/login', '/registro', '/403'].includes(location.pathname);
  const dockBotRight = tienePanelSidebar && isLgScreen;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    function onMediaChange(e) {
      setIsLgScreen(e.matches);
    }
    function onScroll() {
      setShowTop(window.scrollY > 360);
    }
    function onOpenHelp() {
      setWaOpen(false);
      setBotOpen(true);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setBotOpen(false);
        setWaOpen(false);
      }
    }
    mediaQuery.addEventListener('change', onMediaChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('open-help-widget', onOpenHelp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('open-help-widget', onOpenHelp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (botOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, botOpen]);

  function enviarConsulta(texto, topicOpcional = null) {
    const limpio = texto.trim();
    if (!limpio) return;
    const hora = horaActual();
    const respuesta = topicOpcional || buscarRespuestaBot(limpio);

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', hora, texto: limpio },
      {
        id: `b-${Date.now() + 1}`,
        role: 'bot',
        hora,
        texto: respuesta.respuesta,
        ctaLabel: respuesta.ctaLabel,
        ctaTo: respuesta.ctaTo,
      },
    ]);
    setConsulta('');
  }

  function handleAskSubmit(e) {
    e.preventDefault();
    enviarConsulta(consulta);
  }

  function handleResetChat() {
    setMessages(crearMensajeInicial());
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

  const botTrigger = (
    <button
      type="button"
      onClick={() => {
        setBotOpen(true);
        setWaOpen(false);
      }}
      aria-label="Abrir asistente virtual de ayuda"
      title="Asistente RifaBot"
      className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/95 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl cursor-pointer"
    >
      <Bot className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-400" />
      </span>
    </button>
  );

  const botCard = (
    <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-[336px] overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5">
            {/* Cabecera verde de la web */}
            <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-3.5 py-2.5 text-white">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-300 via-amber-300 to-teal-300" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-xs">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-700 bg-emerald-300" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold leading-tight tracking-tight">RifaBot</p>
                    <p className="text-[11px] font-medium text-emerald-100">
                      Asistente Solidario
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Reiniciar conversación"
                    aria-label="Reiniciar conversación"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBotOpen(false)}
                    title="Cerrar asistente"
                    aria-label="Cerrar asistente"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Historial compacto con patrón sutil */}
            <div className="bg-dot-matrix max-h-[225px] space-y-2.5 overflow-y-auto bg-slate-50/85 px-3 py-3">
              <div className="flex justify-center">
                <span className="rounded-full border border-emerald-100 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-2xs">
                  Hoy
                </span>
              </div>

              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <div key={msg.id} className="flex flex-col items-end gap-0.5">
                    <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-emerald-600 px-3 py-2 text-xs leading-relaxed text-white shadow-xs">
                      {msg.texto}
                    </div>
                    <span className="px-1 text-[10px] text-slate-400">{msg.hora}</span>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="rounded-2xl rounded-tl-xs border border-slate-200/80 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 shadow-2xs">
                        <p>{msg.texto}</p>
                        {msg.ctaLabel && msg.ctaTo && (
                          <button
                            type="button"
                            onClick={() => {
                              setBotOpen(false);
                              const destino =
                                msg.ctaTo === '/' && autenticado ? '/explorar' : msg.ctaTo;
                              navigate(destino);
                            }}
                            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200/80 transition hover:bg-emerald-100 cursor-pointer"
                          >
                            {msg.ctaLabel}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <span className="block px-1 text-[10px] text-slate-400">{msg.hora}</span>
                    </div>
                  </div>
                )
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Accesos rápidos compactos + Input */}
            <div className="space-y-2 border-t border-slate-100 bg-white px-3 py-2.5">
              <div className="flex flex-wrap gap-1">
                {FAQ_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => enviarConsulta(topic.pregunta, topic)}
                    className="rounded-full border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
                  >
                    {topic.chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAskSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!consulta.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs transition hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-default"
                  aria-label="Consultar asistente"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
  );

  const waCard = (
    <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-[320px] overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between bg-[#075E54] px-3.5 py-2.5 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xs">
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">Soporte WhatsApp</p>
                  <p className="text-[11px] text-emerald-100">Atención directa y pagos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white cursor-pointer"
                aria-label="Cerrar WhatsApp"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 p-3.5">
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
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
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
  );

  const showTopButton = showTop ? (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      title="Subir al inicio"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 cursor-pointer"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  ) : null;

  const waTrigger = (
    <button
      type="button"
      onClick={() => {
        setWaOpen(true);
        setBotOpen(false);
      }}
      aria-label="Abrir soporte por WhatsApp"
      title="WhatsApp directo"
      className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/95 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#1ebe5d] cursor-pointer"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
      </span>
    </button>
  );

  return (
    <>
      {!dockBotRight && (
        /* Widget Inferior Izquierdo: Asistente Virtual RifaBot */
        <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start">
          {botOpen ? botCard : botTrigger}
        </div>
      )}

      {/* Widget Inferior Derecho: RifaBot (cuando hay sidebar) + WhatsApp + Volver arriba */}
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2.5">
        {dockBotRight && botOpen ? (
          botCard
        ) : waOpen ? (
          waCard
        ) : (
          <>
            {showTopButton}
            {dockBotRight && botTrigger}
            {waTrigger}
          </>
        )}
      </div>
    </>
  );
}
