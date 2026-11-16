import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  HeartHandshake,
  HelpCircle,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

const FAQS_DATA = [
  // 1. Participantes y Boletos
  {
    cat: 'participantes',
    q: '¿Cómo elijo y reservo mis números en una rifa?',
    a: 'Ingresa al catálogo o a la página de la rifa que deseas apoyar. Verás el tablero con todos los números: los disponibles están en color verde. Haz clic sobre hasta 10 números favoritos o usa los botones "+1", "+3" y "+5" para elegir al azar. Al pulsar "Confirmar selección", se activará tu reserva atómica exclusiva de 15 minutos.',
  },
  {
    cat: 'participantes',
    q: '¿Qué sucede si expiran los 15 minutos de mi reserva?',
    a: 'El sistema cuenta con un candado de concurrencia. Si pasados los 15 minutos no registraste tu comprobante de pago en el sistema, los boletos se liberan automáticamente y vuelven a quedar disponibles para cualquier otra persona.',
  },
  {
    cat: 'participantes',
    q: '¿Puedo liberar mis números si me equivoco o cambio de opinión?',
    a: 'Sí, totalmente. Mientras dure tu reserva de 15 minutos puedes hacer clic en el botón "Liberar reserva" en el modal de pago o desde "Mis tickets", y los números volverán a estar inmediatamente disponibles para todos.',
  },
  {
    cat: 'participantes',
    q: '¿Dónde puedo ver los tickets que he adquirido?',
    a: 'Inicia sesión con tu cuenta y dirígete a "Mis tickets" desde el menú superior. Allí verás el listado completo de tus números reservados y vendidos, con el nombre de la rifa, el premio en juego y el enlace directo al sorteo oficial.',
  },

  // 2. Pagos, QR y Comprobantes
  {
    cat: 'pagos',
    q: '¿Qué medios de pago se aceptan en la plataforma?',
    a: 'Aceptamos código QR Simple (interoperable con todos los bancos y cooperativas de Bolivia como Banco Unión, BCP, BNB, Mercantil Santa Cruz, Banco Sol, Bisa, etc.) y transferencias bancarias directas a la cuenta oficial de la campaña.',
  },
  {
    cat: 'pagos',
    q: '¿Cuánto tiempo tarda la verificación y aprobación de mi pago?',
    a: 'Nuestro equipo administrativo revisa los comprobantes en un tiempo promedio menor a 10 minutos dentro del horario de atención (08:00 a 19:00). Una vez validado el número de referencia bancaria, tus boletos pasan inmediatamente a estado VENDIDO.',
  },
  {
    cat: 'pagos',
    q: '¿Qué pasa si subí el comprobante justo cuando se vencía el tiempo?',
    a: 'Si registras el comprobante y el número de referencia antes de que el temporizador llegue a cero, la reserva queda congelada en estado PENDIENTE DE REVISIÓN y nadie podrá quitarte tus números mientras un administrador confirma el abono.',
  },
  {
    cat: 'pagos',
    q: '¿Puedo pagar varios números en una sola transferencia o QR?',
    a: 'Sí. Puedes seleccionar hasta 10 números en una misma reserva. El sistema calculará el monto total acumulado y podrás hacer un único pago por el total con un solo comprobante.',
  },

  // 3. Sorteos y Ganadores
  {
    cat: 'sorteos',
    q: '¿Cómo garantizan que el sorteo sea 100% transparente y no manipulado?',
    a: 'El sorteo se ejecuta mediante un bolillero digital con algoritmo criptográfico seguro (CSPRNG). La selección se realiza exclusivamente entre los boletos debidamente pagados y aprobados. Además, se genera un acta pública inmutable con hash SHA-256 que vincula la fecha, hora exacta y número ganador.',
  },
  {
    cat: 'sorteos',
    q: '¿Cómo me entero si gané un sorteo?',
    a: 'Recibirás una notificación instantánea en la plataforma y nuestro equipo se contactará contigo vía llamada telefónica y WhatsApp al número registrado en tu cuenta para coordinar la entrega oficial del premio.',
  },
  {
    cat: 'sorteos',
    q: '¿Por qué se muestra un alias en lugar de mi nombre completo en los resultados?',
    a: 'Por seguridad y privacidad del ganador. Mostramos únicamente tu alias público (por ejemplo: @carlos_bo) para proteger tu identidad y número telefónico de posibles fraudes o personas malintencionadas.',
  },
  {
    cat: 'sorteos',
    q: '¿Dónde puedo consultar el historial de sorteos anteriores?',
    a: 'Puedes ingresar a la sección "Sorteos & Ganadores" (/sorteos) donde encontrarás todas las actas de sorteos pasados, las fotografías de entrega de premios y los certificados públicos de cada campaña.',
  },

  // 4. Organizadores y Causas
  {
    cat: 'organizadores',
    q: '¿Quiénes pueden organizar una rifa en la plataforma?',
    a: 'Fundaciones, asociaciones benéficas, albergues de rescate animal, comités de salud para tratamientos médicos de emergencia y proyectos comunitarios debidamente avalados.',
  },
  {
    cat: 'organizadores',
    q: '¿Cuáles son las comisiones o costos para los organizadores?',
    a: 'Cobramos únicamente una tarifa administrativa fija y única de Bs 100 por campaña aprobada. No retenemos porcentajes abusivos de lo recaudado, garantizando que el dinero llegue directamente a la causa solidaria.',
  },
  {
    cat: 'organizadores',
    q: '¿Cómo solicito una rifa para mi institución o causa?',
    a: 'Regístrate en la plataforma, accede a "Organizar una Rifa" (/organizar) o a tu espacio personal, pulsa en "Nueva Solicitud" y completa los datos de tu causa, el premio ofrecido y los números a emitir. La revisaremos en menos de 24 horas.',
  },
];

const CATEGORIAS = [
  { id: 'todas', label: 'Todas las preguntas' },
  { id: 'participantes', label: 'Participantes & Boletos' },
  { id: 'pagos', label: 'Pagos, QR & Comprobantes' },
  { id: 'sorteos', label: 'Sorteos & Ganadores' },
  { id: 'organizadores', label: 'Organizadores & Causas' },
];

export function PreguntasFrecuentesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [abiertoIdx, setAbiertoIdx] = useState(0);

  const faqsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return FAQS_DATA.filter((item) => {
      const matchCat = categoria === 'todas' || item.cat === categoria;
      const matchText = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [busqueda, categoria]);

  function triggerRifaBot() {
    window.dispatchEvent(new window.CustomEvent('open-help-widget'));
  }

  return (
    <div className="space-y-10 py-2 sm:py-4">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-4 text-center py-2 sm:py-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-2xs">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          Centro de Ayuda y Soporte
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Preguntas <span className="text-emerald-700">frecuentes</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Resolvemos tus dudas sobre cómo comprar números, métodos de pago, reservas de 15 minutos,
          bolillero digital y organización de campañas.
        </p>

        {/* Buscador en vivo integrado */}
        <div className="mx-auto max-w-xl pt-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por palabra clave: QR, 15 minutos, premio, comisión..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-emerald-500 focus:bg-white focus:outline-none sm:text-sm"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. CHIPS DE CATEGORÍAS */}
      <section className="space-y-4">
        <div className="no-scrollbar flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1">
          {CATEGORIAS.map((cat) => {
            const activa = categoria === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activa
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. LISTA ACORDEÓN DE PREGUNTAS */}
      <section className="mx-auto max-w-3xl space-y-3">
        {faqsFiltradas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 py-12 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-2 text-sm font-bold text-slate-800">No encontramos coincidencias</h3>
            <p className="mt-1 text-xs text-slate-500">
              Prueba con otras palabras o consulta directamente con nuestro asistente virtual RifaBot.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={triggerRifaBot}>
                <MessageCircle className="h-4 w-4" />
                Preguntar a RifaBot
              </Button>
            </div>
          </div>
        ) : (
          faqsFiltradas.map((item, idx) => {
            const isOpen = abiertoIdx === idx;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? 'border-emerald-300 bg-white shadow-sm'
                    : 'border-slate-200/90 bg-white/90 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setAbiertoIdx(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[11px] font-extrabold text-emerald-800">
                      ?
                    </span>
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-emerald-100 bg-slate-50/40 px-5 pt-3.5 pb-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* 4. BANNER DE SOPORTE DIRECTO (RIFABOT & WHATSAPP) */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Atención Inmediata 24/7
        </span>

        <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
          ¿Tienes una consulta específica?
        </h3>

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
          Puedes conversar al instante con nuestro asistente virtual RifaBot o contactar al equipo
          de validación de pagos por WhatsApp.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={triggerRifaBot}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir RifaBot 24/7
          </button>
          <Link to="/contacto">
            <Button variant="secondary" size="lg">
              Ver Canales de Contacto
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default PreguntasFrecuentesPage;
