import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  '': 'Inicio',
  'explorar': 'Catálogo de Rifas',
  'causas': 'Causas Solidarias',
  'sorteos': 'Sorteos y Ganadores',
  'como-funciona': 'Cómo Funciona',
  'garantias': 'Garantías y Legalidad',
  'preguntas-frecuentes': 'Preguntas Frecuentes',
  'contacto': 'Canales de Contacto',
  'organizar': 'Organizar una Rifa',
  'rifas': 'Catálogo de Rifas',
  'resultado': 'Resultado del Sorteo',
  'mis-tickets': 'Mis Tickets',
  'mis-pagos': 'Mis Pagos',
  'perfil': 'Mi Perfil',
  'notificaciones': 'Notificaciones',
  'login': 'Iniciar Sesión',
  'registro': 'Crear Cuenta',
  'solicitudes': 'Solicitudes',
  'nueva': 'Nueva Solicitud',
  'mias': 'Mis Solicitudes',
  'organizador': 'Panel Organizador',
  'admin': 'Administración',
  'usuarios': 'Usuarios',
  'roles': 'Roles y Permisos',
  'plantillas': 'Plantillas',
  'reportes': 'Reportes',
  'auditoria': 'Auditoría',
  '403': 'Acceso Restringido',
};

function resolverEtiquetaSegmento(segmento, prevSegmento = '') {
  if (ROUTE_LABELS[segmento]) {
    return ROUTE_LABELS[segmento];
  }
  if (!Number.isNaN(Number(segmento))) {
    if (prevSegmento === 'rifas') return `Rifa #${segmento}`;
    if (prevSegmento === 'causas') return `Causa #${segmento}`;
    return `#${segmento}`;
  }
  const decodificado = decodeURIComponent(segmento).replace(/[-_]/g, ' ');
  return decodificado.charAt(0).toUpperCase() + decodificado.slice(1);
}

export function Breadcrumbs({ items, extraItems = [], className = '' }) {
  const location = useLocation();

  // Si no se pasan items explícitos, generamos el rastro según el path actual
  const breadcrumbList = (() => {
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }

    const pathname = location.pathname;
    const segmentos = pathname.split('/').filter(Boolean);

    if (segmentos.length === 0) {
      return [{ label: 'Inicio', href: '/' }];
    }

    const list = [{ label: 'Inicio', href: '/' }];
    let acumulado = '';

    segmentos.forEach((seg, idx) => {
      acumulado += `/${seg}`;
      const esUltimo = idx === segmentos.length - 1;
      const prevSeg = idx > 0 ? segmentos[idx - 1] : '';
      const label = resolverEtiquetaSegmento(seg, prevSeg);

      list.push({
        label,
        href: esUltimo ? undefined : acumulado,
      });
    });

    if (Array.isArray(extraItems) && extraItems.length > 0) {
      extraItems.forEach((extra) => list.push(extra));
    }

    return list;
  })();

  if (!breadcrumbList || (!items && breadcrumbList.length <= 1)) {
    // Si solo hay "Inicio" y no hay hijos en modo automático, no mostramos nada para no saturar
    return null;
  }

  return (
    <nav
      aria-label="Miga de pan"
      className={`flex w-full items-center ${className}`}
    >
      <ol className="flex w-full flex-wrap items-center gap-1.5 py-1 text-xs text-slate-600">
        {breadcrumbList.map((item, idx) => {
          const esPrimero = idx === 0;
          const esUltimo = idx === breadcrumbList.length - 1;

          return (
            <li
              key={`${item.label}-${idx}`}
              className="inline-flex items-center gap-1.5 min-w-0"
            >
              {!esPrimero && (
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
              )}

              {esUltimo || !item.href ? (
                <span
                  className="truncate font-extrabold text-emerald-800 max-w-[200px] sm:max-w-md"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer truncate max-w-[160px] sm:max-w-sm"
                  title={item.label}
                >
                  {esPrimero && <Home className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                  <span>{item.label}</span>
                </button>
              ) : (
                <Link
                  to={item.href}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-700 transition-colors truncate max-w-[160px] sm:max-w-sm"
                  title={item.label}
                >
                  {esPrimero && <Home className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
