import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  HeartHandshake,
  HelpCircle,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function ComoFuncionaPage() {
  const pasos = [
    {
      num: '01',
      title: 'Elige tus números en el tablero en vivo',
      tagline: 'Tablero sincronizado en tiempo real',
      icon: Ticket,
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Navega por las rifas activas de tu causa favorita. En el tablero visual puedes ver al instante qué números están disponibles (verde), reservados (amarillo) o vendidos (gris). Puedes elegir manualmente tus números de la suerte o pulsar "+1", "+3" y "+5" para selección rápida al azar.',
      puntos: [
        'Hasta 10 números por reserva simultánea.',
        'Visualización clara de premios y meta solidaria.',
        'Soporte en móviles, tabletas y computadoras.',
      ],
    },
    {
      num: '02',
      title: 'Reserva atómica exclusiva por 15 minutos',
      tagline: 'Garantía anti-colisión en base de datos',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-100 text-amber-800',
      desc: 'Al confirmar tus números, nuestro sistema ejecuta un bloqueo atómico transaccional. Durante exactamente 15 minutos, nadie más en el mundo puede seleccionar, reservar o pagar esos mismos boletos. Tendrás tu tiempo protegido para realizar el pago con total tranquilidad.',
      puntos: [
        'Temporizador visual con cuenta regresiva en pantalla.',
        'Opción de liberar números manualmente si cambias de opinión.',
        'Liberación automática al expirar el tiempo si no se sube comprobante.',
      ],
    },
    {
      num: '03',
      title: 'Paga con QR Simple o Transferencia Bancaria',
      tagline: 'Compatible con todos los bancos de Bolivia',
      icon: CreditCard,
      color: 'from-sky-600 to-indigo-700',
      badgeColor: 'bg-sky-100 text-sky-800',
      desc: 'Escanea el código QR oficial de Simple Pago desde cualquier aplicación bancaria nacional o transfiere a la cuenta bancaria de la causa. Una vez hecho el pago, adjunta la captura del comprobante e indica tu número de referencia para verificación administrativa inmediata.',
      puntos: [
        'Acepta Banco Unión, BCP, BNB, Mercantil, Bisa, Fassil/Banco Sol y cooperativas.',
        'Revisión y aprobación rápida en menos de 10 minutos.',
        'Recibes notificación en vivo cuando tus boletos pasan a estado VENDIDO.',
      ],
    },
    {
      num: '04',
      title: 'Bolillero digital en vivo y acta de entrega',
      tagline: 'Transparencia criptográfica inmutable',
      icon: Trophy,
      color: 'from-rose-600 to-pink-700',
      badgeColor: 'bg-rose-100 text-rose-800',
      desc: 'Al llegar la fecha de cierre de la rifa, el bolillero digital certificado selecciona al ganador de forma 100% aleatoria únicamente entre los boletos debidamente pagados. Se publica el resultado con acta oficial, hash criptográfico de integridad y se contacta al ganador para entregar el premio.',
      puntos: [
        'Certificado público con hash SHA-256 no falsificable.',
        'Protección de datos: se exhibe el alias público del ganador.',
        'Registro fotográfico de entrega de premio verificado.',
      ],
    },
  ];

  const comparaciones = [
    {
      aspecto: 'Selección de números',
      tradicional: 'Dependes del talonario de papel que tiene el vendedor en la calle',
      nosotros: 'Tablero interactivo completo en vivo con números exactos a tu elección',
    },
    {
      aspecto: 'Riesgo de duplicidad',
      tradicional: 'Se pueden vender boletos con numeración duplicada por error humano',
      nosotros: 'Candado atómico transaccional: matemáticamente imposible duplicar',
    },
    {
      aspecto: 'Comprobante y custodia',
      tradicional: 'Si pierdes el talonario de papel, pierdes tu derecho al reclamo',
      nosotros: 'Tu boleto queda guardado para siempre en tu cuenta personal y correo',
    },
    {
      aspecto: 'Sorteo y veracidad',
      tradicional: 'Sorteos a puerta cerrada o bolilleros sin registro público confiable',
      nosotros: 'Bolillero digital auditable en vivo con acta criptográfica y hash público',
    },
    {
      aspecto: 'Destino de los fondos',
      tradicional: 'Poca claridad sobre cuánto dinero llega realmente a la causa benéfica',
      nosotros: 'Causas verificadas con personería, metas públicas y rendición visible',
    },
  ];

  return (
    <div className="space-y-12 py-2 sm:py-4">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-4 text-center py-2 sm:py-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Transparencia Total de Principio a Fin
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          ¿Cómo funciona <span className="text-emerald-700">Rifas Solidarias</span>?
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Un sistema 100% digital, seguro y trazable que une a personas solidarias con causas reales.
          Sin talonarios perdidos, sin dobles ventas y con actas públicas verificables.
        </p>

        {/* Insignias de confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            15 min de reserva atómica
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
            <QrCode className="h-3.5 w-3.5 text-teal-600" />
            Pagos Simple QR y Bancos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            Bolillero digital auditado
          </span>
        </div>
      </section>

      {/* 2. RECORRIDO DE LOS 4 PASOS EN TARJETAS DESTACADAS */}
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {pasos.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg sm:p-8"
              >
                {/* Cabecera del paso */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${p.badgeColor}`}
                    >
                      Paso {p.num}
                    </span>
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {p.tagline}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-900 group-hover:text-emerald-700 transition">
                      {p.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">{p.desc}</p>

                  <ul className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-700">
                    {p.puntos.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. COMPARATIVA: TRADICIONAL VS DIGITAL AUDITADO */}
      <section className="space-y-6 pt-4">
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Seguridad y Modernidad
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Rifas tradicionales vs Rifas Solidarias
          </h2>
          <p className="text-sm text-slate-600">
            Comparamos el método tradicional en papel con nuestra infraestructura tecnológica.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-5 py-4">Aspecto</th>
                  <th className="px-5 py-4 text-rose-700">Rifas Tradicionales en Papel</th>
                  <th className="px-5 py-4 text-emerald-700 bg-emerald-50/50">
                    Plataforma Rifas Solidarias
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {comparaciones.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">{c.aspecto}</td>
                    <td className="px-5 py-4 text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                        <span>{c.tradicional}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-950 bg-emerald-50/30">
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{c.nosotros}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. LLAMADO A LA ACCIÓN FINAL */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          ¡Empieza a Participar Ahora!
        </span>

        <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Elige tus números y sé parte del cambio
        </h3>

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
          Explora las rifas activas, reserva tus boletos favoritos y apoya causas que salvan vidas y
          educan comunidades en toda Bolivia.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/explorar">
            <Button size="lg">
              <Ticket className="h-4 w-4" />
              Explorar Catálogo de Rifas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/causas">
            <Button variant="secondary" size="lg">
              <HeartHandshake className="h-4 w-4 text-emerald-700" />
              Conocer Causas Solidarias
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ComoFuncionaPage;
