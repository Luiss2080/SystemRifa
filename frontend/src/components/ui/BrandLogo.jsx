import { useId } from 'react';

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

/**
 * Isotipo vectorial oficial de Rifas Solidarias:
 * boleto perforado con corazón solidario y destello de sorteo.
 */
export function BrandMark({ size = 'md', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const bgId = `rs-bg-${uid}`;
  const ticketId = `rs-tk-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`${SIZES[size] || SIZES.md} shrink-0 drop-shadow-xs transition-transform duration-200 ${className}`}
    >
      <defs>
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="55%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={ticketId} x1="11" y1="17" x2="53" y2="47" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ecfdf5" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bgId})`} />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      <path
        d="M16 17H48C50.761 17 53 19.239 53 22V27.5C50.515 27.5 48.5 29.515 48.5 32C48.5 34.485 50.515 36.5 53 36.5V42C53 44.761 50.761 47 48 47H16C13.239 47 11 44.761 11 42V36.5C13.485 36.5 15.5 34.485 15.5 32C15.5 29.515 13.485 27.5 11 27.5V22C11 19.239 13.239 17 16 17Z"
        fill={`url(#${ticketId})`}
      />

      <path
        d="M26 38.8C26 38.8 18.5 34.2 18.5 29.2C18.5 26.8 20.3 25 22.6 25C24.1 25 25.3 25.8 26 27C26.7 25.8 27.9 25 29.4 25C31.7 25 33.5 26.8 33.5 29.2C33.5 34.2 26 38.8 26 38.8Z"
        fill="#059669"
      />

      <circle cx="38.5" cy="23.5" r="1.4" fill="#0d9488" fillOpacity="0.45" />
      <circle cx="38.5" cy="32" r="1.4" fill="#0d9488" fill-opacity="0.45" />
      <circle cx="38.5" cy="40.5" r="1.4" fill="#0d9488" fillOpacity="0.45" />

      <path
        d="M45 27.5L46.2 30.8L49.5 32L46.2 33.2L45 36.5L43.8 33.2L40.5 32L43.8 30.8L45 27.5Z"
        fill="#f59e0b"
      />
    </svg>
  );
}

/**
 * Imagotipo completo (isotipo + tipografía) adaptable a fondos claros u oscuros.
 */
export function BrandLogo({
  dark = false,
  size = 'md',
  showSubtitle = false,
  subtitle = 'Transparencia solidaria',
  className = '',
}) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} className="group-hover:scale-105" />
      <span className="leading-tight">
        <span
          className={`block font-extrabold tracking-tight ${
            size === 'lg' || size === 'xl' ? 'text-lg' : 'text-base'
          } ${dark ? 'text-white' : 'text-slate-900'}`}
        >
          Rifas <span className={dark ? 'text-emerald-400' : 'text-emerald-600'}>Solidarias</span>
        </span>
        {showSubtitle && (
          <span
            className={`block text-[11px] font-medium ${
              dark ? 'text-emerald-400/90' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
