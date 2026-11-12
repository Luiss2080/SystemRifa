import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  FilePlus2,
  Headphones,
  HeartHandshake,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { BrandMark } from '../components/ui/BrandLogo.jsx';

const LEGAL_MODALS = {
  privacidad: {
    title: 'Política de Privacidad',
    description: 'Cómo protegemos tus datos personales y alias en Rifas Solidarias.',
    paragraphs: [
      'Tus datos personales (nombre, correo electrónico y teléfono) se utilizan exclusivamente para gestionar tus reservas de tickets, validar comprobantes de pago y notificarte sobre el resultado de los sorteos en los que participas.',
      'En los resultados públicos y tableros visibles para otros usuarios únicamente se muestra tu alias público, preservando tu privacidad.',
      'No compartimos ni comercializamos tu información con terceros ajenos a la verificación operativa de las campañas solidarias.',
    ],
  },
  terminos: {
    title: 'Términos de Servicio',
    description: 'Reglas de participación, reservas temporales y ejecución de sorteos.',
    paragraphs: [
      'Cada reserva temporal bloquea los números seleccionados durante 15 minutos continuos para evitar colisiones mientras registras tu comprobante de pago.',
      'Únicamente los tickets cuyo pago haya sido verificado y aprobado por administración participan en el sorteo oficial de la rifa.',
      'Las campañas creadas por organizadores pasan por revisión previa y quedan registradas bajo auditoría inmutable.',
    ],
  },
  cookies: {
    title: 'Uso de Cookies y Almacenamiento Local',
    description: 'Preferencias técnicas necesarias para tu sesión segura.',
    paragraphs: [
      'Utilizamos almacenamiento técnico indispensable para mantener tu sesión autenticada, recordar tu token de acceso de forma segura y garantizar la continuidad de tus reservas.',
      'No empleamos cookies publicitarias ni rastreadores invasivos de terceros.',
    ],
  },
  auditoria: {
    title: 'Verificación y Auditoría de Sorteos',
    description: 'Transparencia técnica respaldada en base de datos relacional.',
    paragraphs: [
      'Las reservas utilizan bloqueo atómico en MySQL ACID para garantizar que dos personas nunca puedan comprar o reservar el mismo número simultáneamente.',
      'Cada acción crítica (aprobación de solicitudes, verificación de pagos, publicación de ganadores y cambios de roles) queda registrada con marca de tiempo y actor en el historial de auditoría.',
    ],
  },
};

function SocialLinks() {
  const socials = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.5v3h2.6v8h3.4Z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5A2 2 0 1 0 5.25 7.5A2 2 0 1 0 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.16 8.22C14.37 8.22 13.48 9.21 13.02 9.93V8.5H9.65C9.7 9.48 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.78 14.03 11.09 15.07 11.09C16.41 11.09 17.06 12.11 17.06 13.6V19.5H20.44V13.02Z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.78 12 4.78 12 4.78s-5.93 0-7.64.46A2.75 2.75 0 0 0 2.42 7.2 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.46 7.64.46 7.64.46s5.93 0 7.64-.46a2.75 2.75 0 0 0 1.94-1.95A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.42-4.81ZM10 15.1V8.9L15.4 12 10 15.1Z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.14 15.7 6.34 6.34 0 0 0 9.48 22a6.34 6.34 0 0 0 6.34-6.34V8.81a8.26 8.26 0 0 0 4.77 1.5V6.86c-.34 0-.68-.06-1-.17Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-1">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          title={s.name}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-600 hover:text-white"
        >
          {s.svg}
        </a>
      ))}
    </div>
  );
}

export function AppFooter() {
  const { autenticado, tieneAlgunPermiso, esAdmin } = useAuth();
  const [modalActivo, setModalActivo] = useState(null);

  const puedeVerOrganizador =
    tieneAlgunPermiso([
      ['rifas', 'leer'],
      ['rifas', 'administrar'],
      ['premios', 'crud'],
      ['sorteos', 'realizar'],
    ]) || esAdmin;

  const year = new Date().getFullYear();

  function openHelpWidget() {
    window.dispatchEvent(new window.CustomEvent('open-help-widget'));
  }

  const servicios = [
    {
      label: 'Catálogo de Rifas',
      to: '/',
      icon: Ticket,
      highlight: true,
    },
    {
      label: 'Causas Solidarias',
      to: '/causas',
      icon: HeartHandshake,
      highlight: true,
    },
    {
      label: 'Organizar una Rifa',
      to: '/solicitudes/nueva',
      icon: FilePlus2,
      highlight: false,
    },
    {
      label: puedeVerOrganizador ? 'Panel de Gestión' : 'Acceso Organizadores',
      to: puedeVerOrganizador ? '/organizador/rifas' : '/login',
      icon: LayoutDashboard,
      highlight: true,
    },
    {
      label: 'Soporte Técnico 24/7',
      action: openHelpWidget,
      icon: Headphones,
      highlight: false,
    },
  ];

  const guias = [
    {
      label: 'Cómo Participar',
      to: '/#como-funciona',
      icon: Lightbulb,
      highlight: false,
    },
    {
      label: 'Garantías y Auditoría',
      action: () => setModalActivo('auditoria'),
      icon: ShieldCheck,
      highlight: true,
    },
    {
      label: autenticado ? 'Mis Tickets y Reservas' : 'Consultar Mis Tickets',
      to: autenticado ? '/mis-tickets' : '/login',
      icon: BookOpen,
      highlight: false,
    },
    {
      label: autenticado ? 'Mis Pagos y Comprobantes' : 'Registrar Comprobante',
      to: autenticado ? '/mis-pagos' : '/login',
      icon: CreditCard,
      highlight: false,
    },
    {
      label: 'Transparencia de Sorteos',
      to: '/#garantias',
      icon: CheckCircle2,
      highlight: false,
    },
    {
      label: 'Preguntas Frecuentes',
      action: openHelpWidget,
      icon: HelpCircle,
      highlight: false,
    },
  ];

  const modalContent = modalActivo ? LEGAL_MODALS[modalActivo] : null;

  return (
    <footer
      id="contacto-footer"
      className="relative z-10 mt-10 overflow-hidden border-t border-slate-200/90 bg-gradient-to-b from-white/95 via-emerald-50/35 to-slate-100/95 text-slate-700 backdrop-blur-md"
    >
      {/* Franja superior luminosa acorde a la identidad de la web */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

      <div className="relative w-full px-4 pt-11 pb-7 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-0">
          {/* Columna 1: Identidad comercial y redes sociales */}
          <div className="space-y-5 lg:col-span-4 lg:pr-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs transition hover:border-emerald-300 hover:shadow-sm"
            >
              <BrandMark size="xl" className="shadow-sm shadow-emerald-600/20 group-hover:scale-105" />
              <span>
                <span className="block text-lg font-extrabold tracking-tight text-slate-900">
                  RIFAS <span className="text-emerald-600">SOLIDARIAS</span>
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Plataforma Verificada
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              Campañas solidarias y sorteos digitales de vanguardia, impulsando la recaudación
              transparente con reservas atómicas, pagos validados y resultados trazables en tiempo
              real.
            </p>

            <SocialLinks />

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Pagos auditados
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-700">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                ACID · Zona La Paz
              </span>
            </div>
          </div>

          {/* Columna 2: SERVICIOS */}
          <div className="space-y-4 lg:col-span-3 lg:border-l lg:border-slate-200/80 lg:px-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Servicios
            </h3>
            <ul className="space-y-3 text-sm">
              {servicios.map((item) => {
                const Icon = item.icon;
                const badgeCls = item.highlight
                  ? 'bg-emerald-600 text-white shadow-xs group-hover:bg-emerald-700'
                  : 'border border-slate-200 bg-white text-slate-600 shadow-2xs group-hover:border-emerald-300 group-hover:text-emerald-700';
                const textCls = item.highlight
                  ? 'font-bold text-emerald-800 group-hover:text-emerald-600'
                  : 'font-medium text-slate-700 group-hover:text-slate-950';

                const inner = (
                  <>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${badgeCls}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className={`transition ${textCls}`}>{item.label}</span>
                  </>
                );

                return (
                  <li key={item.label}>
                    {item.action ? (
                      <button
                        type="button"
                        onClick={item.action}
                        className="group flex w-full items-center gap-3 text-left cursor-pointer"
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link to={item.to} className="group flex items-center gap-3">
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Columna 3: APRENDE Y PARTICIPA */}
          <div className="space-y-4 lg:col-span-2 lg:border-l lg:border-slate-200/80 lg:px-7">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Aprende y Participa
            </h3>
            <ul className="space-y-3 text-sm">
              {guias.map((item) => {
                const Icon = item.icon;
                const badgeCls = item.highlight
                  ? 'bg-amber-400 text-slate-950 shadow-xs group-hover:bg-amber-500'
                  : 'border border-slate-200 bg-white text-slate-600 shadow-2xs group-hover:border-emerald-300 group-hover:text-emerald-700';
                const textCls = item.highlight
                  ? 'font-bold text-amber-700 group-hover:text-amber-800'
                  : 'font-medium text-slate-700 group-hover:text-slate-950';

                const inner = (
                  <>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${badgeCls}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className={`transition ${textCls}`}>{item.label}</span>
                  </>
                );

                return (
                  <li key={item.label}>
                    {item.action ? (
                      <button
                        type="button"
                        onClick={item.action}
                        className="group flex w-full items-center gap-3 text-left cursor-pointer"
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link to={item.to} className="group flex items-center gap-3">
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Columna 4: CONTACTO */}
          <div className="space-y-4 lg:col-span-3 lg:border-l lg:border-slate-200/80 lg:pl-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Contacto
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Ubicación</p>
                  <p className="text-xs text-slate-600">Santa Cruz de la Sierra · Bolivia</p>
                </div>
              </div>

              <a
                href="mailto:soporte@rifassolidarias.bo"
                className="group flex items-start gap-3 transition"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition group-hover:border-emerald-300 group-hover:text-emerald-700">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Email</p>
                  <p className="text-xs text-slate-600 transition group-hover:text-emerald-700">
                    soporte@rifassolidarias.bo
                  </p>
                </div>
              </a>

              <a href="tel:+59170020004" className="group flex items-start gap-3 transition">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition group-hover:bg-amber-100">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-800">Teléfono / WhatsApp</p>
                  <p className="text-xs font-medium text-slate-700 transition group-hover:text-slate-950">
                    +591 700 20004
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Horarios de verificación</p>
                  <p className="text-xs text-slate-600">Lun - Vie: 08:00 - 19:00</p>
                  <p className="text-xs text-slate-600">Sáb: 08:00 - 14:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior legal */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row">
          <p className="flex items-center gap-2 text-center sm:text-left">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>© {year} Rifas Solidarias. Todos los derechos reservados.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
            <button
              type="button"
              onClick={() => setModalActivo('privacidad')}
              className="transition hover:text-emerald-700 cursor-pointer"
            >
              Política de Privacidad
            </button>
            <button
              type="button"
              onClick={() => setModalActivo('terminos')}
              className="transition hover:text-emerald-700 cursor-pointer"
            >
              Términos de Servicio
            </button>
            <button
              type="button"
              onClick={() => setModalActivo('cookies')}
              className="transition hover:text-emerald-700 cursor-pointer"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>

      {/* Modal informativo para enlaces legales y auditoría */}
      <Modal
        open={Boolean(modalContent)}
        onClose={() => setModalActivo(null)}
        title={modalContent?.title}
        description={modalContent?.description}
        maxWidth="max-w-lg"
        footer={
          <Button variant="primary" size="sm" onClick={() => setModalActivo(null)}>
            Entendido
          </Button>
        }
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          {modalContent?.paragraphs.map((text, idx) => (
            <p key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              {text}
            </p>
          ))}
        </div>
      </Modal>
    </footer>
  );
}
