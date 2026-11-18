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

export function Breadcrumbs() {
  return null;
}
}

export default Breadcrumbs;
