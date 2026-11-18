const VARIANTES_POR_COLOR = {
  emerald: 'border border-emerald-200/90 bg-emerald-50/90 text-emerald-800 font-semibold',
  amber: 'border border-amber-200/90 bg-amber-50/90 text-amber-800 font-semibold',
  rose: 'border border-rose-200/90 bg-rose-50/90 text-rose-800 font-semibold',
  sky: 'border border-sky-200/90 bg-sky-50/90 text-sky-800 font-semibold',
  indigo: 'border border-slate-200 bg-slate-100 text-slate-700 font-semibold',
  slate: 'border border-slate-200 bg-slate-100 text-slate-700 font-semibold',
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${estilos} ${className}`}
    >
      {children || estado}
    </span>
  );
}

