import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileCheck2,
  Fingerprint,
  HeartHandshake,
  History,
  Lock,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function GarantiasPublicPage() {
  const pilares = [
    {
      icon: Clock,
      title: 'Candado de Concurrencia Atómica',
      subtitle: 'Aislamiento transaccional estricto',
      badge: '15 Minutos Protegidos',
      badgeColor: 'bg-amber-100 text-amber-800',
      color: 'from-amber-500 to-orange-600',
      desc: 'Cuando seleccionas tus boletos y confirmas la reserva, se activa un bloqueo atómico a nivel de motor de base de datos relacional. Ningún otro usuario en el mundo puede reservar, comprar o modificar esos números durante 15 minutos, garantizando cero colisiones y cero duplicidades.',
    },
    {
      icon: Fingerprint,
      title: 'Bolillero Digital Criptográfico Inmutable',
      subtitle: 'Semilla auditable y hash SHA-256',
      badge: 'Criptográficamente Seguro',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      color: 'from-emerald-600 to-teal-700',
      desc: 'El sorteo oficial no depende de azar manual o físico manipulable. Se ejecuta mediante un algoritmo generador de números pseudoaleatorios criptográficamente seguro (CSPRNG). Cada sorteo genera un acta con hash SHA-256 inmutable que cualquier auditor o participante puede verificar.',
    },
    {
      icon: FileCheck2,
      title: 'Validación Legal de Causas y Organizadores',
      subtitle: 'Personería jurídica y aval social',
      badge: 'Causas Verificadas',
      badgeColor: 'bg-sky-100 text-sky-800',
      color: 'from-sky-600 to-indigo-700',
      desc: 'Ninguna rifa se publica sin revisión previa. Los organizadores deben demostrar personería jurídica, convenios de cooperación o avales comunitarios formales. Verificamos la identidad de los representantes para asegurar que cada centavo recaudado llegue al objetivo solidario prometido.',
    },
    {
      icon: Scale,
      title: 'Custodia y Liquidación Transparente',
      subtitle: 'Tarifa fija sin porcentajes abusivos',
      badge: 'Tarifa Fija Bs 100',
      badgeColor: 'bg-teal-100 text-teal-800',
      color: 'from-teal-600 to-emerald-800',
      desc: 'A diferencia de otras plataformas que retienen hasta el 20% de lo recaudado, Rifas Solidarias cobra una única tarifa administrativa de Bs 100 por campaña aprobada. El 100% restante del fondo recaudado es transferido íntegramente a la causa beneficiaria con comprobante bancario público.',
    },
    {
      icon: Eye,
      title: 'Protección de Privacidad por Alias Público',
      subtitle: 'Seguridad personal frente a fraudes',
      badge: 'Privacidad Garantizada',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      color: 'from-indigo-600 to-purple-700',
      desc: 'Para proteger a los ganadores de extorsiones o fraudes, en los tableros de resultados públicos y actas digitales únicamente se exhibe su alias de usuario (ejemplo: @carlos_bo) y su departamento de residencia. Su nombre completo, teléfono y correo se mantienen estrictamente confidenciales.',
    },
    {
      icon: History,
      title: 'Bitácora de Auditoría en Tiempo Real',
      subtitle: 'Trazabilidad segundo a segundo',
      badge: 'Logs Inmutables',
      badgeColor: 'bg-rose-100 text-rose-800',
      color: 'from-rose-600 to-pink-700',
      desc: 'Cada acción sensible en la plataforma (creación de rifas, reserva de boletos, aprobación de pagos bancarios, ejecución de sorteos y entrega de premios) queda registrada en una bitácora inmutable con marca de tiempo, dirección IP y firma digital del operador.',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-3.5 text-center py-1 sm:py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Compromiso de Integridad y Trazabilidad
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Garantías y respaldo <span className="text-emerald-700">técnico del sistema</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Conoce los principios arquitectónicos, criptográficos y legales que aseguran equidad
          matemática, protección de pagos y transparencia absoluta en cada sorteo solidario.
        </p>

        {/* Insignias de confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            Transacciones ACID MySQL
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-teal-600" />
            Cifrado de extremo a extremo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
            Actas notariales auditables
          </span>
        </div>
      </section>

      {/* 2. LOS 6 PILARES DE SEGURIDAD Y CONFIANZA */}
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pilares.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg sm:p-7"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${p.badgeColor}`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition">
                      {p.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700">{p.subtitle}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ARQUITECTURA TÉCNICA Y PROTOCOLO DE SORTEO */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <Server className="h-3.5 w-3.5 text-emerald-600" />
              Arquitectura del Bolillero Digital
            </span>
            <h3 className="text-xl font-black text-slate-900">
              ¿Cómo garantizamos que el sorteo sea 100% inalterable?
            </h3>
          </div>
          <Link to="/sorteos">
            <Button size="sm" variant="secondary">
              <Trophy className="h-4 w-4" />
              Ver sorteos auditados
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
              1
            </span>
            <p className="font-extrabold text-slate-900">Piscina Cerrada de Números</p>
            <p className="text-slate-600">
              Solo participan los números con pago debidamente aprobado y verificado. Boletos
              disponibles o no pagados quedan excluidos automáticamente.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-black">
              2
            </span>
            <p className="font-extrabold text-slate-900">Semilla Aleatoria Criptográfica</p>
            <p className="text-slate-600">
              Se utiliza la entropía del sistema operativo (CSPRNG) combinada con la marca de tiempo
              precisa en milisegundos para calcular el índice ganador.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black">
              3
            </span>
            <p className="font-extrabold text-slate-900">Sello Criptográfico Inmutable</p>
            <p className="text-slate-600">
              El resultado se sella con un hash SHA-256 no revocable que vincula el número ganador,
              la causa y el timestamp oficial en la base de datos.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LLAMADO A LA ACCIÓN */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-8 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Participación Segura y Transparente
        </span>
        <h3 className="text-2xl font-black text-slate-900">
          ¿Tienes dudas sobre la seguridad de tus pagos o reservas?
        </h3>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
          Nuestro equipo de soporte y nuestro asistente inteligente RifaBot están disponibles las 24
          horas para responder tus consultas.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/preguntas-frecuentes">
            <Button size="md">
              <CheckCircle2 className="h-4 w-4" />
              Ver Preguntas Frecuentes
            </Button>
          </Link>
          <Link to="/contacto">
            <Button variant="secondary" size="md">
              Contáctanos por WhatsApp
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default GarantiasPublicPage;
