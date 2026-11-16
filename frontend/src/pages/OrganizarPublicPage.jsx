import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  FileCheck,
  FilePlus2,
  HeartHandshake,
  Lock,
  QrCode,
  Scale,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';

export function OrganizarPublicPage() {
  const { autenticado } = useAuth();
  const navigate = useNavigate();

  function handleComenzar() {
    if (autenticado) {
      navigate('/solicitudes/nueva');
    } else {
      navigate('/registro');
    }
  }

  const beneficios = [
    {
      icon: Ticket,
      title: 'Tablero digital en vivo listo para usar',
      desc: 'Olvídate de imprimir talonarios de papel o llevar planillas manuales en Excel. Tu campaña tendrá un tablero visual que se actualiza en tiempo real.',
    },
    {
      icon: QrCode,
      title: 'Cobros QR Simple y Transferencias Bancarias',
      desc: 'Tus participantes pueden pagar desde cualquier banco o cooperativa de Bolivia. Recibes los comprobantes ordenados con verificación ágil.',
    },
    {
      icon: Lock,
      title: 'Cero colisiones ni boletos duplicados',
      desc: 'Nuestro candado transaccional de 15 minutos asegura que nunca se venda el mismo número a dos personas distintas, protegiendo tu reputación.',
    },
    {
      icon: Award,
      title: 'Bolillero digital y acta de sorteo verificable',
      desc: 'El sorteo se ejecuta ante todos con un algoritmo criptográfico seguro (SHA-256) y acta pública notarial que elimina cualquier duda de favoritismo.',
    },
    {
      icon: Users,
      title: 'Difusión en el Directorio Nacional de Causas',
      desc: 'Tu campaña se promociona ante miles de usuarios solidarios que ya participan activamente en nuestra comunidad.',
    },
    {
      icon: Scale,
      title: 'Tarifa fija y transparente: Bs 100',
      desc: 'No cobramos porcentajes ni comisiones abusivas sobre tus fondos. Pagas una única tarifa administrativa fija de Bs 100 por campaña aprobada.',
    },
  ];

  const pasos = [
    {
      num: '01',
      title: 'Crea tu cuenta gratuita',
      desc: 'Regístrate en menos de dos minutos con tu correo y datos básicos de contacto.',
    },
    {
      num: '02',
      title: 'Registra tu causa y tu propuesta de rifa',
      desc: 'Indica el nombre de la causa beneficiaria, el premio que otorgarás, la cantidad de números y el precio por boleto.',
    },
    {
      num: '03',
      title: 'Revisión y aprobación rápida',
      desc: 'Nuestro equipo valida la documentación de respaldo y activa tu campaña en menos de 24 horas.',
    },
    {
      num: '04',
      title: 'Comparte tu enlace y recauda fondos',
      desc: 'Difunde tu enlace directo en WhatsApp y redes sociales. Sigue las ventas y comprobantes en vivo.',
    },
  ];

  const requisitos = [
    'Personería jurídica, estatutos o carta de aval comunitario / vecinal que respalde la causa.',
    'Descripción clara del objetivo benéfico o presupuesto médico en caso de emergencias de salud.',
    'Fotografía real y comprobante de tenencia o cotización del premio que se rifará.',
    'Cuenta bancaria oficial a nombre de la institución o tutor legal responsable.',
  ];

  return (
    <div className="space-y-12 py-2 sm:py-4">
      {/* 1. HERO COMERCIAL ABIERTO (SIN CONTENEDOR BLANCO INNECESARIO) */}
      <section className="mx-auto max-w-3xl space-y-4 text-center py-2 sm:py-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
          <HeartHandshake className="h-4 w-4 text-emerald-600" />
          Para Fundaciones, ONGs y Comités Solidarios
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Organiza tu rifa solidaria con{' '}
          <span className="text-emerald-700">respaldo tecnológico y legal</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Convierte tu proyecto comunitario, albergue animal o campaña médica de emergencia en una
          recaudación 100% digital, transparente y con entrega auditada.
        </p>

        {/* Insignias de confianza */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Tarifa fija administrativa de Bs 100
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
            <QrCode className="h-3.5 w-3.5 text-teal-600" />
            Recepción automática de pagos QR
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            Aprobación en menos de 24 horas
          </span>
        </div>

        <div className="pt-3">
          <Button size="lg" onClick={handleComenzar}>
            <FilePlus2 className="h-4 w-4" />
            {autenticado ? 'Crear Propuesta de Rifa' : 'Comenzar como Organizador'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* 2. TARJETA DESTACADA DE TARIFA TRANSPARENTE */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <Scale className="h-3.5 w-3.5 text-emerald-700" />
              Modelo Justo y Solidario
            </span>
            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
              Cero comisiones porcentuales sobre lo que recaudes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Sabemos el esfuerzo que cuesta recaudar fondos para una causa. Por eso solo cobramos
              una única tarifa fija de <strong>Bs 100 por campaña</strong> para cubrir los costos
              de servidor y verificación notarial.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Tarifa Administrativa Fija
            </p>
            <p className="text-3xl font-black text-emerald-700">Bs 100.00</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Por campaña aprobada</p>
          </div>
        </div>
      </section>

      {/* 3. BENEFICIOS PARA ORGANIZADORES */}
      <section className="space-y-6">
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Herramientas Profesionales
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Todo lo que necesitas para que tu rifa sea un éxito
          </h2>
          <p className="text-sm text-slate-600">
            Aumenta tus ventas y brinda máxima confianza a tus colaboradores con tecnología de
            vanguardia.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="space-y-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition">
                    {b.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PASO A PASO PARA LANZAR TU CAMPAÑA */}
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <FileCheck className="h-3.5 w-3.5 text-amber-600" />
            Proceso de Acreditación
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            ¿Cómo publicar tu rifa en 4 pasos?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p) => (
            <div
              key={p.num}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                {p.num}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">{p.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. REQUISITOS Y DOCUMENTACIÓN */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Requisitos mínimos de verificación
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Para proteger a los compradores y mantener el estándar de transparencia, solicitamos la
          siguiente documentación antes de habilitar los pagos en vivo:
        </p>

        <ul className="grid gap-3 sm:grid-cols-2 pt-2 text-xs text-slate-700 font-medium">
          {requisitos.map((req, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. LLAMADO A LA ACCIÓN FINAL */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Tu Causa Merece el Mejor Respaldo
        </span>

        <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
          ¿Listo para lanzar tu rifa solidaria?
        </h3>

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
          Inicia tu propuesta hoy mismo y recibe acompañamiento personalizado de nuestro equipo
          técnico y de soporte.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button size="lg" onClick={handleComenzar}>
            <FilePlus2 className="h-4 w-4" />
            {autenticado ? 'Comenzar Solicitud' : 'Crear Cuenta de Organizador'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/contacto">
            <Button variant="secondary" size="lg">
              Hablar con un Asesor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default OrganizarPublicPage;
