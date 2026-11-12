import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  Copy,
  ExternalLink,
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
      title="Asistente RifaBot 24/7"
      className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/35 ring-2 ring-white/95 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:brightness-105 hover:shadow-xl cursor-pointer"
    >
      <Bot className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-80" />
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
      </span>
    </button>
  );

  const botCard = (
    <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-3xl border border-amber-300/80 bg-white shadow-2xl ring-1 ring-slate-900/5">
      {/* Cabecera naranja-amarilla acorde al botón Crear cuenta */}
      <div className="relative bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 px-3.5 py-3 text-slate-950">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-300" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/10 text-slate-950 ring-1 ring-slate-950/15 backdrop-blur-xs">
              <Bot className="h-5 w-5" />
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-extrabold leading-tight tracking-tight">RifaBot</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-950/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900">
                  <Sparkles className="h-2.5 w-2.5" />
                  En línea
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-800/90">
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
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/10 text-slate-900 transition hover:bg-slate-950/20 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setBotOpen(false)}
              title="Cerrar asistente"
              aria-label="Cerrar asistente"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/15 text-slate-950 transition hover:bg-slate-950/25 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Historial limpio con patrón sutil */}
      <div className="bg-dot-matrix h-[280px] space-y-2.5 overflow-y-auto bg-slate-50/90 px-3.5 py-3.5 sm:h-[300px]">
        <div className="flex justify-center">
          <span className="rounded-full border border-amber-200/80 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-2xs">
            Hoy · Soporte 24/7
          </span>
        </div>

        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex flex-col items-end gap-0.5">
              <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-3 py-2 text-xs font-medium leading-relaxed text-slate-950 shadow-xs">
                {msg.texto}
              </div>
              <span className="px-1 text-[10px] text-slate-400">{msg.hora}</span>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 shadow-xs">
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
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-[11px] font-bold text-amber-950 ring-1 ring-amber-300/80 transition hover:from-amber-200 hover:to-orange-200 cursor-pointer"
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

      {/* Input directo sin chips */}
      <div className="border-t border-slate-100 bg-white px-3.5 py-3">
        <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!consulta.trim()}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-slate-950 shadow-xs transition hover:brightness-105 disabled:bg-slate-200 disabled:bg-none disabled:text-slate-400 cursor-pointer disabled:cursor-default"
            aria-label="Consultar asistente"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  const waCard = (
    <div className="animate-modal-in w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5">
      {/* Cabecera mejorada de WhatsApp acorde al diseño del chat */}
      <div className="relative bg-gradient-to-r from-[#075E54] via-[#0d7468] to-[#128C7E] px-3.5 py-3 text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#25D366] via-emerald-300 to-teal-300" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-xs ring-1 ring-white/25">
              <WhatsAppIcon className="h-5 w-5" />
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#075E54] bg-emerald-300" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-extrabold leading-tight tracking-tight">
                  Soporte WhatsApp
                </p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  Directo
                </span>
              </div>
              <p className="text-[11px] font-medium text-emerald-100/90">
                Pagos, reservas y campañas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWaOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
            aria-label="Cerrar WhatsApp"
            title="Cerrar WhatsApp"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cuerpo con patrón sutil y burbuja introductoria */}
      <div className="bg-dot-matrix space-y-3 bg-slate-50/90 p-3.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xs">
            <WhatsAppIcon className="h-3.5 w-3.5" />
          </span>
          <div className="rounded-2xl rounded-tl-xs border border-slate-200/80 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 shadow-2xs">
            ¡Hola! Elige un mensaje rápido o personaliza tu consulta para iniciar chat directo con nuestro equipo.
          </div>
        </div>

        <div className="space-y-1.5">
          {WHATSAPP_PRESETS.map((preset) => {
            const activo = waMensaje === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setWaMensaje(preset)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition cursor-pointer ${
                  activo
                    ? 'border-[#25D366] bg-emerald-50 font-semibold text-emerald-950 shadow-2xs'
                    : 'border-slate-200/90 bg-white text-slate-600 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <span className="leading-snug">{preset}</span>
                {activo && <Check className="h-3.5 w-3.5 shrink-0 text-[#128C7E]" />}
              </button>
            );
          })}
        </div>

        <textarea
          rows={2}
          value={waMensaje}
          onChange={(e) => setWaMensaje(e.target.value)}
          placeholder="Escribe tu mensaje para WhatsApp..."
          aria-label="Mensaje de WhatsApp"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs focus:border-[#25D366] focus:ring-2 focus:ring-emerald-200 focus:outline-none"
        />
      </div>

      {/* Pie de acciones */}
      <div className="space-y-2 border-t border-slate-100 bg-white px-3.5 py-3">
        <div className="flex items-center gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1ebe5d] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm shadow-emerald-600/20 transition hover:brightness-105"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Abrir WhatsApp
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={handleCopyPhone}
            title={`Copiar ${WHATSAPP_DISPLAY}`}
            aria-label={`Copiar ${WHATSAPP_DISPLAY}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">Copiado</span>
              </>
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>
        </div>

        <p className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-400">
          <ShieldCheck className="h-3 w-3 text-[#25D366]" />
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
      title="Soporte WhatsApp directo"
      className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] via-[#20bd5a] to-[#128C7E] text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/95 transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:brightness-105 hover:shadow-xl cursor-pointer"
    >
      <WhatsAppIcon className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#25D366]" />
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
