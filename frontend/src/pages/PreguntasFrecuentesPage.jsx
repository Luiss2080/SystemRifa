import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  HeartHandshake,
  HelpCircle,
  LayoutGrid,
  MessageCircle,
  RotateCcw,
  Search,
  Sparkles,
  Ticket,
  Trophy,
  X,
} from 'lucide-react';
import { PaginationCard } from '../components/ui/DataTable.jsx';
import { UnderlineHighlight } from '../components/ui/UnderlineHighlight.jsx';

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
    a: 'Fundaciones, asociaciones benéficas, albergues de rescate animal, comités de salud para tratamientos médicos de emergencia y proyectos comunitarios debidamente avalados con personería jurídica o convenios comprobables.',
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
  {
    id: 'todas',
    label: 'Todas las preguntas',
    icon: LayoutGrid,
    desc: 'Visión general del sistema',
  },
  {
    id: 'participantes',
    label: 'Participantes y Boletos',
    icon: Ticket,
    desc: 'Reservas, 15 min y selección',
  },
  {
    id: 'pagos',
    label: 'Pagos, QR y Comprobantes',
    icon: CreditCard,
    desc: 'Simple QR y aprobación rápida',
  },
  {
    id: 'sorteos',
    label: 'Sorteos y Ganadores',
    icon: Trophy,
    desc: 'Bolillero digital y actas SHA-256',
  },
  {
    id: 'organizadores',
    label: 'Organizadores y Causas',
    icon: HeartHandshake,
    desc: 'Requisitos y tarifa fija Bs 100',
  },
];

const CAT_INFO = {
  participantes: {
    label: 'Participantes & Boletos',
    icon: Ticket,
    iconBg: 'bg-emerald-100 text-emerald-800',
  },
  pagos: {
    label: 'Pagos & Comprobantes',
    icon: CreditCard,
    iconBg: 'bg-amber-100 text-amber-800',
  },
  sorteos: {
    label: 'Sorteos & Ganadores',
    icon: Trophy,
    iconBg: 'bg-indigo-100 text-indigo-800',
  },
  organizadores: {
    label: 'Organizadores & Causas',
    icon: HeartHandshake,
    iconBg: 'bg-sky-100 text-sky-800',
  },
};

const PAGE_SIZE = 5;

export function PreguntasFrecuentesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [page, setPage] = useState(1);
  const [abiertos, setAbiertos] = useState(new Set());

  const faqsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return FAQS_DATA.filter((item) => {
      const matchCat = categoria === 'todas' || item.cat === categoria;
      const matchText = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [busqueda, categoria]);

  const totalPages = Math.max(1, Math.ceil(faqsFiltradas.length / PAGE_SIZE));
  const faqsPaginadas = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return faqsFiltradas.slice(start, start + PAGE_SIZE);
  }, [faqsFiltradas, page]);

  useEffect(() => {
    setPage(1);
  }, [categoria, busqueda]);

  useEffect(() => {
    if (faqsPaginadas.length > 0) {
      setAbiertos(new Set([faqsPaginadas[0].q]));
    } else {
      setAbiertos(new Set());
    }
  }, [page, categoria, busqueda]);

  function toggleItem(q) {
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(q)) {
        next.delete(q);
      } else {
        next.add(q);
      }
      return next;
    });
  }

  function expandirTodos() {
    setAbiertos(new Set(faqsPaginadas.map((item) => item.q)));
  }

  function contraerTodos() {
    setAbiertos(new Set());
  }

  function triggerRifaBot() {
    window.dispatchEvent(new window.CustomEvent('open-help-widget'));
  }

  const categoriaActualObj = CATEGORIAS.find((c) => c.id === categoria);

  return (
    <div className="space-y-8 sm:space-y-10 py-1 sm:py-2">
      {/* 1. HERO COMERCIAL ABIERTO */}
      <section className="mx-auto max-w-3xl space-y-3.5 text-center py-1 sm:py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-2xs">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          Centro de Ayuda y Preguntas Frecuentes
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Preguntas <UnderlineHighlight>frecuentes</UnderlineHighlight>
        </h1>

        <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
          Encuentra respuestas transparentes sobre reservas atómicas de 15 minutos, pagos Simple QR,
          bolillero digital auditado y organización de rifas benéficas.
        </p>

        {/* Buscador inteligente */}
        <div className="mx-auto max-w-xl pt-1">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por palabra clave: QR, 15 minutos, premio, comisión..."
              aria-label="Buscar preguntas frecuentes"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-10 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. LAYOUT MASTER-DETAIL CON ANCHO COMPLETO ALINEADO */}
      <section className="w-full grid gap-6 lg:grid-cols-12 items-start">
        {/* Columna Izquierda: Temas con Iconos y Tarjeta de Ayuda Directa */}
        <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">
          {/* Navegación por Categorías */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-1.5">
            <div className="px-2 py-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Temas de consulta
              </span>
            </div>

            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              const activo = categoria === cat.id;
              const count =
                cat.id === 'todas'
                  ? FAQS_DATA.length
                  : FAQS_DATA.filter((f) => f.cat === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 text-left transition cursor-pointer ${
                    activo
                      ? 'border border-emerald-300 bg-emerald-50/90 text-emerald-950 font-bold shadow-2xs'
                      : 'border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        activo
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold leading-snug">{cat.label}</p>
                      <p className="truncate text-[10px] font-medium text-slate-400">{cat.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                      activo ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tarjeta de Soporte Directo / Ayuda personalizada */}
          <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">¿No encuentras respuesta?</h4>
                <p className="text-[11px] text-slate-500">Estamos en vivo para asistirte</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              Conversa al instante con nuestro asistente virtual RifaBot o contacta por WhatsApp para soporte con pagos.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={triggerRifaBot}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-2.5 text-xs font-extrabold text-slate-950 transition hover:brightness-105 cursor-pointer shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-900" />
                <span>Abrir RifaBot 24/7</span>
              </button>

              <Link
                to="/contacto"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                <span>Ver Canales de Contacto</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Columna Derecha: Acordeón Moderno con Iconos de Categoría */}
        <div className="space-y-3.5 lg:col-span-8">
          {/* Filtros rápidos horizontales (chips) para alternar al instante */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              const activo = categoria === cat.id;
              const count =
                cat.id === 'todas'
                  ? FAQS_DATA.length
                  : FAQS_DATA.filter((f) => f.cat === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    activo
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                      activo ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Barra superior de control */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                {categoriaActualObj?.label || 'Preguntas frecuentes'}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {faqsFiltradas.length} {faqsFiltradas.length === 1 ? 'pregunta' : 'preguntas'}
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-slate-400">
                  · Página {page} de {totalPages} (5 por página)
                </span>
              )}
            </div>

            {faqsFiltradas.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={expandirTodos}
                  className="font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  Expandir todas
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={contraerTodos}
                  className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Contraer todas
                </button>
              </div>
            )}
          </div>

          {/* Lista de Preguntas: exactamente 5 preguntas por pantalla */}
          {faqsFiltradas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No encontramos coincidencias</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay preguntas que coincidan con &ldquo;{busqueda}&rdquo;. Prueba con términos como QR, 15 minutos, sorteo o consulta a nuestro asistente.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    setCategoria('todas');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restablecer filtros
                </button>
                <button
                  type="button"
                  onClick={triggerRifaBot}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Preguntar a RifaBot
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {faqsPaginadas.map((item) => {
                const isOpen = abiertos.has(item.q);
                const catInfo = CAT_INFO[item.cat] || CAT_INFO.participantes;
                const CatIcon = catInfo.icon;

                return (
                  <article
                    key={item.q}
                    className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                      isOpen
                        ? 'border-emerald-300 bg-white shadow-xs ring-1 ring-emerald-200/50'
                        : 'border-slate-200/90 bg-white hover:border-emerald-200 hover:shadow-2xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.q)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 p-3.5 sm:p-4 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                            isOpen
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : `${catInfo.iconBg} ring-1 ring-emerald-200/50 group-hover:scale-105`
                          }`}
                        >
                          <CatIcon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            {catInfo.label}
                          </span>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {item.q}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          isOpen
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 rotate-180'
                            : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-emerald-300 group-hover:text-emerald-700'
                        }`}
                      >
                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-700">
                        <div className="border-l-2 border-emerald-500 pl-3.5 py-0.5">
                          {item.a}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación a ancho completo cuando hay más de 5 preguntas */}
          {faqsFiltradas.length > PAGE_SIZE && (
            <div className="pt-2">
              <PaginationCard
                page={page}
                totalPages={totalPages}
                total={faqsFiltradas.length}
                showingFrom={(page - 1) * PAGE_SIZE + 1}
                showingTo={Math.min(faqsFiltradas.length, page * PAGE_SIZE)}
                onPageChange={setPage}
                itemLabel="preguntas"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PreguntasFrecuentesPage;
