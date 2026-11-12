const VARIANTES_POR_COLOR = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

const MAPA_ESTADOS = {
  ACTIVA: 'emerald',
  APROBADA: 'emerald',
  CONFIRMADO: 'emerald',
  DISPONIBLE: 'emerald',
  ENTREGADO: 'emerald',
  PENDIENTE: 'amber',
  RESERVADO: 'amber',
  EN_REVISION: 'sky',
  SOLICITADO: 'amber',
  RECHAZADA: 'rose',
  RECHAZADO: 'rose',
  CANCELADA: 'rose',
  DESIERTA: 'rose',
  VENDIDO: 'indigo',
  FINALIZADA: 'indigo',
  COMPLETADA: 'indigo',
  ANULADO: 'slate',
  INACTIVA: 'slate',
};

export function Badge({ children, color, estado, className = '' }) {
  const colorFinal = color || MAPA_ESTADOS[estado] || 'slate';
  const estilos = VARIANTES_POR_COLOR[colorFinal] || VARIANTES_POR_COLOR.slate;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilos} ${className}`}
    >
      {children || estado}
    </span>
  );
}

