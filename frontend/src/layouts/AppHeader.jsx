import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  FilePlus2,
  FolderKanban,
  HeartHandshake,
  HelpCircle,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../features/rifas/publicApi.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { formatearFechaCorta } from '../utils/format.js';
import { Button } from '../components/ui/Button.jsx';
import { BrandMark } from '../components/ui/BrandLogo.jsx';

export function AppHeader({ variant = 'public' }) {
  const { usuario, autenticado, esAdmin, esOrganizador, logout, tienePermiso, tieneAlgunPermiso } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const [mobileGroupAbierto, setMobileGroupAbierto] = useState(null);

  const popoverRef = useRef(null);
  const cuentaRef = useRef(null);
  const navRef = useRef(null);

  const esPanel = variant === 'panel';

  const { data: notifResumen } = useQuery({
    queryKey: ['notificaciones-badge'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notificaciones', { params: { page: 1, limit: 1 } });
      return data;
    },
    enabled: autenticado,
    refetchInterval: 30000,
  });

  const { data: notifRecientes, isLoading: loadingPopover } = useQuery({
    queryKey: ['notificaciones-popover'],
    queryFn: () => getMisNotificaciones({ page: 1, limit: 5 }),
    enabled: autenticado && notifAbierto,
  });

  const invalidarNotificaciones = () => {
    queryClient.invalidateQueries({ queryKey: ['notificaciones-badge'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-popover'] });
    queryClient.invalidateQueries({ queryKey: ['mis-notificaciones'] });
  };

  const marcarLeidaMut = useMutation({
    mutationFn: (id) => marcarNotificacionLeida(id),
    onSuccess: invalidarNotificaciones,
  });

  const marcarTodasMut = useMutation({
    mutationFn: () => marcarTodasNotificacionesLeidas(),
    onSuccess: invalidarNotificaciones,
  });

  useEffect(() => {
    setDropdownAbierto(null);
    setMenuAbierto(false);
    setNotifAbierto(false);
    setCuentaAbierta(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (notifAbierto && popoverRef.current && !popoverRef.current.contains(e.target)) {
        setNotifAbierto(false);
      }
      if (cuentaAbierta && cuentaRef.current && !cuentaRef.current.contains(e.target)) {
        setCuentaAbierta(false);
      }
      if (dropdownAbierto && navRef.current && !navRef.current.contains(e.target)) {
        setDropdownAbierto(null);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setNotifAbierto(false);
        setCuentaAbierta(false);
        setDropdownAbierto(null);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifAbierto, cuentaAbierta, dropdownAbierto]);

  const noLeidas = notifResumen?.noLeidasCount || 0;
  const recientes = notifRecientes?.items || [];

  const tieneAdminPanel =
    esAdmin ||
    tieneAlgunPermiso([
      ['solicitudes', 'revisar'],
      ['pagos', 'verificar'],
      ['causas', 'crud'],
      ['usuarios', 'leer'],
      ['roles', 'administrar'],
      ['permisos', 'administrar'],
      ['plantillas', 'administrar'],
    ]);

  const tieneOrganizadorPanel =
    esOrganizador ||
    tieneAlgunPermiso([
      ['rifas', 'administrar'],
      ['premios', 'crud'],
      ['sorteos', 'realizar'],
      ['ganadores', 'publicar'],
    ]);

  const primerAdminDestino =
    esAdmin || tienePermiso('reportes', 'leer')
      ? '/admin/reportes'
      : tienePermiso('solicitudes', 'revisar')
        ? '/admin/solicitudes'
        : '/admin/pagos';

  function scrollToSection(id) {
    setDropdownAbierto(null);
    setMenuAbierto(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  }

  function openHelpWidget() {
    setDropdownAbierto(null);
    setMenuAbierto(false);
    window.dispatchEvent(new window.CustomEvent('open-help-widget'));
  }

  // Construcción de navegación completa con desplegables por perfil
  let navItems = [];

  if (!autenticado) {
    navItems = [
      {
        id: 'explorar',
        type: 'dropdown',
        label: 'Explorar',
        items: [
          {
            to: '/',
            label: 'Catálogo de rifas',
            desc: 'Rifas activas con tablero en tiempo real',
            icon: Ticket,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/?urgente=1',
            label: 'Cierra pronto (≤ 48h)',
            desc: 'Últimas oportunidades antes del sorteo',
            icon: Clock,
            color: 'bg-amber-100 text-amber-700',
          },
          {
            to: '/causas',
            label: 'Causas solidarias',
            desc: 'Proyectos sociales verificados',
            icon: HeartHandshake,
            color: 'bg-rose-100 text-rose-700',
          },
          {
            action: () => scrollToSection('como-funciona'),
            label: 'Cómo funciona',
            desc: 'Paso a paso para reservar y pagar',
            icon: Sparkles,
            color: 'bg-sky-100 text-sky-700',
          },
        ],
      },
      { to: '/causas', label: 'Causas', end: false },
      {
        id: 'organizar',
        type: 'dropdown',
        label: 'Organizar',
        items: [
          {
            to: '/solicitudes/nueva',
            label: 'Solicitar nueva rifa',
            desc: 'Crea tu campaña y envíala a revisión',
            icon: FilePlus2,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            action: () => scrollToSection('garantias'),
            label: 'Garantías del sistema',
            desc: 'Reservas atómicas de 15 min sin colisiones',
            icon: ShieldCheck,
            color: 'bg-teal-100 text-teal-700',
          },
          {
            action: () => scrollToSection('beneficios-plataforma'),
            label: 'Beneficios para causas',
            desc: 'Por qué elegir Rifas Solidarias',
            icon: Trophy,
            color: 'bg-amber-100 text-amber-700',
          },
        ],
      },
      {
        id: 'soluciones',
        type: 'dropdown',
        label: 'Ayuda y Soluciones',
        items: [
          {
            action: () => scrollToSection('preguntas-frecuentes'),
            label: 'Preguntas frecuentes',
            desc: 'Dudas sobre tickets, pagos y sorteos',
            icon: HelpCircle,
            color: 'bg-indigo-100 text-indigo-700',
          },
          {
            action: openHelpWidget,
            label: 'Asistente RifaBot 24/7',
            desc: 'Guía interactiva al instante',
            icon: MessageCircle,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            action: () => scrollToSection('contacto-footer'),
            label: 'Canales de contacto',
            desc: 'WhatsApp, correo y horarios de atención',
            icon: Mail,
            color: 'bg-sky-100 text-sky-700',
          },
        ],
      },
      { action: () => scrollToSection('contacto-footer'), label: 'Contáctanos' },
    ];
  } else if (tieneAdminPanel) {
    navItems = [
      {
        id: 'admin-ops',
        type: 'dropdown',
        label: 'Administración',
        items: [
          (esAdmin || tienePermiso('reportes', 'leer')) && {
            to: '/admin/reportes',
            label: 'Reportes y estadísticas',
            desc: 'Métricas financieras y cumplimiento de metas',
            icon: BarChart3,
            color: 'bg-emerald-100 text-emerald-700',
          },
          tienePermiso('solicitudes', 'revisar') && {
            to: '/admin/solicitudes',
            label: 'Revisar solicitudes',
            desc: 'Aprobar o rechazar nuevas rifas',
            icon: FolderKanban,
            color: 'bg-sky-100 text-sky-700',
          },
          tienePermiso('pagos', 'verificar') && {
            to: '/admin/pagos',
            label: 'Verificar pagos',
            desc: 'Validar comprobantes y liberar tickets',
            icon: CheckSquare,
            color: 'bg-amber-100 text-amber-700',
          },
          tienePermiso('causas', 'crud') && {
            to: '/admin/causas',
            label: 'Gestionar causas',
            desc: 'Crear y editar causas solidarias',
            icon: HeartHandshake,
            color: 'bg-rose-100 text-rose-700',
          },
        ].filter(Boolean),
      },
      {
        id: 'admin-sec',
        type: 'dropdown',
        label: 'Seguridad y Sistema',
        items: [
          tienePermiso('usuarios', 'leer') && {
            to: '/admin/usuarios',
            label: 'Usuarios del sistema',
            desc: 'Cuentas, estados y asignación de roles',
            icon: Users,
            color: 'bg-indigo-100 text-indigo-700',
          },
          (tienePermiso('roles', 'administrar') || tienePermiso('permisos', 'administrar')) && {
            to: '/admin/roles',
            label: 'Roles y permisos RBAC',
            desc: 'Control granular de acceso por recurso',
            icon: KeyRound,
            color: 'bg-teal-100 text-teal-700',
          },
          tienePermiso('plantillas', 'administrar') && {
            to: '/admin/plantillas',
            label: 'Plantillas de notificación',
            desc: 'Mensajes automáticos del sistema',
            icon: Mail,
            color: 'bg-amber-100 text-amber-700',
          },
          (esAdmin || tienePermiso('reportes', 'leer')) && {
            to: '/admin/auditoria',
            label: 'Auditoría inmutable',
            desc: 'Bitácora de eventos y trazabilidad',
            icon: History,
            color: 'bg-slate-200 text-slate-700',
          },
        ].filter(Boolean),
      },
      {
        id: 'admin-camp',
        type: 'dropdown',
        label: 'Campañas',
        items: [
          {
            to: '/organizador/rifas',
            label: 'Gestionar mis rifas',
            desc: 'Premios, cierres y sorteos oficiales',
            icon: Sparkles,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/solicitudes/nueva',
            label: 'Nueva solicitud',
            desc: 'Registrar nueva campaña solidaria',
            icon: FilePlus2,
            color: 'bg-sky-100 text-sky-700',
          },
          {
            to: '/solicitudes/mias',
            label: 'Mis solicitudes',
            desc: 'Estado de campañas enviadas',
            icon: FolderKanban,
            color: 'bg-amber-100 text-amber-700',
          },
        ],
      },
      {
        id: 'admin-pub',
        type: 'dropdown',
        label: 'Explorar Web',
        items: [
          {
            to: '/',
            label: 'Catálogo público',
            desc: 'Vista de participante en vivo',
            icon: Ticket,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/causas',
            label: 'Causas públicas',
            desc: 'Directorio de impacto social',
            icon: HeartHandshake,
            color: 'bg-rose-100 text-rose-700',
          },
          {
            to: '/mis-tickets',
            label: 'Mis tickets',
            desc: 'Boletos reservados y pagados',
            icon: Ticket,
            color: 'bg-teal-100 text-teal-700',
          },
          {
            to: '/mis-pagos',
            label: 'Mis pagos',
            desc: 'Historial de comprobantes',
            icon: CreditCard,
            color: 'bg-sky-100 text-sky-700',
          },
        ],
      },
    ];
  } else if (tieneOrganizadorPanel) {
    navItems = [
      {
        id: 'org-camp',
        type: 'dropdown',
        label: 'Mis Campañas',
        items: [
          {
            to: '/organizador/rifas',
            label: 'Gestionar mis rifas',
            desc: 'Premios, fechas y ejecución de sorteos',
            icon: Sparkles,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/solicitudes/nueva',
            label: 'Solicitar nueva rifa',
            desc: 'Enviar nueva campaña a revisión',
            icon: FilePlus2,
            color: 'bg-sky-100 text-sky-700',
          },
          {
            to: '/solicitudes/mias',
            label: 'Mis solicitudes',
            desc: 'Seguimiento de aprobaciones',
            icon: FolderKanban,
            color: 'bg-amber-100 text-amber-700',
          },
        ],
      },
      {
        id: 'org-explorar',
        type: 'dropdown',
        label: 'Explorar',
        items: [
          {
            to: '/',
            label: 'Catálogo de rifas',
            desc: 'Campañas activas en la plataforma',
            icon: Ticket,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/causas',
            label: 'Causas solidarias',
            desc: 'Iniciativas comunitarias verificadas',
            icon: HeartHandshake,
            color: 'bg-rose-100 text-rose-700',
          },
        ],
      },
      {
        id: 'org-cuenta',
        type: 'dropdown',
        label: 'Mi Espacio',
        items: [
          {
            to: '/mis-tickets',
            label: 'Mis tickets',
            desc: 'Tus números reservados y confirmados',
            icon: Ticket,
            color: 'bg-teal-100 text-teal-700',
          },
          {
            to: '/mis-pagos',
            label: 'Mis pagos',
            desc: 'Estado de verificación de comprobantes',
            icon: CreditCard,
            color: 'bg-sky-100 text-sky-700',
          },
          {
            to: '/notificaciones',
            label: 'Notificaciones',
            desc: 'Avisos de sorteos y aprobaciones',
            icon: Bell,
            color: 'bg-amber-100 text-amber-700',
          },
        ],
      },
      { action: openHelpWidget, label: 'Ayuda 24/7' },
    ];
  } else {
    navItems = [
      {
        id: 'user-explorar',
        type: 'dropdown',
        label: 'Explorar',
        items: [
          {
            to: '/',
            label: 'Catálogo de rifas',
            desc: 'Elige tus números en tiempo real',
            icon: Ticket,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/causas',
            label: 'Causas solidarias',
            desc: 'Conoce a quién apoya cada sorteo',
            icon: HeartHandshake,
            color: 'bg-rose-100 text-rose-700',
          },
          {
            action: () => scrollToSection('como-funciona'),
            label: 'Cómo funciona',
            desc: 'Guía rápida de reserva y pago',
            icon: Sparkles,
            color: 'bg-amber-100 text-amber-700',
          },
        ],
      },
      {
        id: 'user-espacio',
        type: 'dropdown',
        label: 'Mi Espacio',
        items: [
          {
            to: '/mis-tickets',
            label: 'Mis tickets',
            desc: 'Boletos reservados y confirmados',
            icon: Ticket,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/mis-pagos',
            label: 'Mis pagos',
            desc: 'Subir y consultar comprobantes',
            icon: CreditCard,
            color: 'bg-sky-100 text-sky-700',
          },
          {
            to: '/notificaciones',
            label: 'Notificaciones',
            desc: 'Alertas en tiempo real',
            icon: Bell,
            color: 'bg-amber-100 text-amber-700',
          },
          {
            to: '/perfil',
            label: 'Mi perfil',
            desc: 'Datos personales y contraseña',
            icon: User,
            color: 'bg-slate-100 text-slate-700',
          },
        ],
      },
      {
        id: 'user-org',
        type: 'dropdown',
        label: 'Organizar Rifa',
        items: [
          {
            to: '/solicitudes/nueva',
            label: 'Solicitar nueva rifa',
            desc: 'Propón una campaña para una causa',
            icon: FilePlus2,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            to: '/solicitudes/mias',
            label: 'Mis solicitudes',
            desc: 'Revisa el estado de tus solicitudes',
            icon: FolderKanban,
            color: 'bg-teal-100 text-teal-700',
          },
        ],
      },
      { action: openHelpWidget, label: 'Ayuda 24/7' },
    ];
  }

  const cuentaLinks = autenticado
    ? [
        { to: '/perfil', label: 'Mi perfil y contraseña', icon: User },
        { to: '/mis-tickets', label: 'Mis tickets', icon: Ticket },
        { to: '/mis-pagos', label: 'Mis pagos', icon: CreditCard },
        ...(tienePermiso('solicitudes', 'crear')
          ? [{ to: '/solicitudes/mias', label: 'Mis solicitudes', icon: FolderKanban }]
          : []),
        ...(tieneOrganizadorPanel || tienePermiso('rifas', 'leer')
          ? [{ to: '/organizador/rifas', label: 'Gestionar rifas', icon: Sparkles }]
          : []),
        ...(tieneAdminPanel
          ? [{ to: primerAdminDestino, label: 'Panel Administración', icon: LayoutDashboard }]
          : []),
      ]
    : [];

  const rolEtiqueta = !autenticado
    ? null
    : esAdmin
      ? { label: 'Administrador', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300/80' }
      : esOrganizador
        ? { label: 'Organizador', cls: 'bg-teal-100 text-teal-800 ring-teal-300/80' }
        : { label: 'Participante', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };

  async function handleLogout() {
    setNotifAbierto(false);
    setCuentaAbierta(false);
    await logout();
    setMenuAbierto(false);
    navigate('/');
  }

  const pillItemClass = ({ isActive }) =>
    `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide transition ${
      isActive
        ? 'bg-emerald-700 text-white shadow-xs'
        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  const pillPlainClass =
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer';

  const homeDestino = !autenticado
    ? '/'
    : tieneAdminPanel
      ? primerAdminDestino
      : tieneOrganizadorPanel
        ? '/organizador/rifas'
        : '/';

  return (
    <header
      className={`sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 text-slate-900 shadow-2xs backdrop-blur-md ${
        esPanel ? 'border-t-[3px] border-t-emerald-600' : ''
      }`}
    >
      <div className="flex h-18 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Marca / Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <Link to={homeDestino} className="group flex items-center gap-2.5">
            <BrandMark size="lg" className="shadow-md shadow-emerald-600/20 group-hover:scale-105" />
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight text-slate-900">
                RIFAS <span className="text-emerald-600">SOLIDARIAS</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {esPanel ? 'Consola de Gestión' : 'Sorteos Auditados'}
              </span>
            </span>
          </Link>

          {rolEtiqueta && (
            <span
              className={`hidden shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 xl:inline-flex ${rolEtiqueta.cls}`}
            >
              {rolEtiqueta.label}
            </span>
          )}
        </div>

        {/* Barra Central Ordenada con Desplegables */}
        <nav
          ref={navRef}
          aria-label="Navegación principal"
          className="hidden items-center gap-1 rounded-full border border-slate-200/90 bg-slate-50/75 px-2 py-1.5 shadow-2xs lg:flex"
        >
          {navItems
            .filter((item) => item.type !== 'dropdown' || (item.items && item.items.length > 0))
            .map((item) => {
            if (item.type === 'dropdown') {
              const isOpen = dropdownAbierto === item.id;
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownAbierto((cur) => (cur === item.id ? null : item.id))}
                    aria-expanded={isOpen}
                    className={`${pillPlainClass} ${
                      isOpen ? 'bg-emerald-700 text-white hover:bg-emerald-700 hover:text-white' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="animate-modal-in absolute left-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl ring-1 ring-slate-900/5">
                      {item.items.map((sub) => {
                        const SubIcon = sub.icon;
                        const inner = (
                          <>
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${sub.color}`}
                            >
                              <SubIcon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-bold text-slate-900">
                                {sub.label}
                              </span>
                              {sub.desc && (
                                <span className="block text-[11px] leading-snug text-slate-500">
                                  {sub.desc}
                                </span>
                              )}
                            </span>
                          </>
                        );

                        if (sub.action) {
                          return (
                            <button
                              key={sub.label}
                              type="button"
                              onClick={sub.action}
                              className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-emerald-50/70 cursor-pointer"
                            >
                              {inner}
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setDropdownAbierto(null)}
                            className="flex items-start gap-2.5 rounded-xl px-3 py-2 transition hover:bg-emerald-50/70"
                          >
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.action) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={pillPlainClass}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <NavLink key={item.to} to={item.to} className={pillItemClass} end={Boolean(item.end)}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Acciones Derecha */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {autenticado ? (
            <>
              {tienePermiso('solicitudes', 'crear') && (
                <Link
                  to="/solicitudes/nueva"
                  className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100 xl:inline-flex"
                >
                  <FilePlus2 className="h-3.5 w-3.5 text-emerald-600" />
                  Nueva rifa
                </Link>
              )}

              <div className="relative" ref={popoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifAbierto((v) => !v);
                    setCuentaAbierta(false);
                    setDropdownAbierto(null);
                  }}
                  className={`relative rounded-full border p-2.5 transition cursor-pointer ${
                    notifAbierto
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-label="Abrir notificaciones recientes"
                  aria-expanded={notifAbierto}
                  title="Notificaciones"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                  )}
                </button>

                {notifAbierto && (
                  <div className="animate-modal-in absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Notificaciones</p>
                        <p className="text-xs text-slate-500">
                          {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
                        </p>
                      </div>
                      {noLeidas > 0 && (
                        <button
                          type="button"
                          onClick={() => marcarTodasMut.mutate()}
                          disabled={marcarTodasMut.isPending}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                      {loadingPopover ? (
                        <div className="space-y-2 p-4">
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                          <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                      ) : recientes.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-500">
                          No tienes notificaciones registradas aún.
                        </div>
                      ) : (
                        recientes.map((n) => (
                          <div
                            key={n.notificacionId}
                            className={`flex items-start justify-between gap-2 px-4 py-3 text-xs transition ${
                              n.leida ? 'bg-white' : 'bg-emerald-50/45'
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <p
                                className={`text-slate-800 ${
                                  n.leida ? 'font-normal' : 'font-semibold'
                                }`}
                              >
                                {n.mensaje}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {formatearFechaCorta(n.fechaEnvio || n.createdAt)}
                              </p>
                            </div>
                            {!n.leida && (
                              <button
                                type="button"
                                onClick={() => marcarLeidaMut.mutate(n.notificacionId)}
                                title="Marcar como leída"
                                className="shrink-0 rounded-md p-1 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center">
                      <Link
                        to="/notificaciones"
                        onClick={() => setNotifAbierto(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Ver centro de notificaciones
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={cuentaRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCuentaAbierta((v) => !v);
                    setNotifAbierto(false);
                    setDropdownAbierto(null);
                  }}
                  aria-expanded={cuentaAbierta}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    {usuario?.alias?.slice(0, 1).toUpperCase() || <User className="h-3.5 w-3.5" />}
                  </span>
                  <span className="max-w-[115px] truncate">{usuario?.alias}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${cuentaAbierta ? 'rotate-180' : ''}`}
                  />
                </button>

                {cuentaAbierta && (
                  <div className="animate-modal-in absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {usuario?.nombres} {usuario?.apellidos}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{usuario?.email}</p>
                    </div>

                    <div className="my-1 space-y-0.5">
                      {cuentaLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setCuentaAbierta(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <Icon className="h-4 w-4 text-emerald-600" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800 hover:shadow-md"
              >
                <Users className="h-3.5 w-3.5" />
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-sm shadow-amber-500/20 transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Crear cuenta
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menú móvil desplegable con grupos */}
      {menuAbierto && (
        <div className="animate-slide-up max-h-[82vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 text-slate-800 lg:hidden">
          <nav className="flex flex-col gap-1.5">
            {navItems
            .filter((item) => item.type !== 'dropdown' || (item.items && item.items.length > 0))
            .map((item) => {
              if (item.type === 'dropdown') {
                const expanded = mobileGroupAbierto === item.id;
                return (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70">
                    <button
                      type="button"
                      onClick={() => setMobileGroupAbierto(expanded ? null : item.id)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-bold text-slate-800 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expanded && (
                      <div className="space-y-1 border-t border-slate-200/70 bg-white p-2">
                        {item.items.map((sub) => {
                          const SubIcon = sub.icon;
                          if (sub.action) {
                            return (
                              <button
                                key={sub.label}
                                type="button"
                                onClick={sub.action}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 cursor-pointer"
                              >
                                <SubIcon className="h-4 w-4 text-emerald-600" />
                                {sub.label}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              onClick={() => setMenuAbierto(false)}
                              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50"
                            >
                              <SubIcon className="h-4 w-4 text-emerald-600" />
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.action) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  end={Boolean(item.end)}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {autenticado ? (
              <div className="flex flex-col gap-1.5">
                {cuentaLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`mob-${item.to}`}
                      to={item.to}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Icon className="h-4 w-4 text-emerald-600" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/notificaciones"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    Notificaciones
                  </span>
                  {noLeidas > 0 && (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                      {noLeidas}
                    </span>
                  )}
                </Link>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white"
                >
                  <Users className="h-4 w-4" />
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
