export function UnderlineHighlight({ children, className = '' }) {
  return (
    <span className={`relative inline-block text-emerald-700 ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 220 18"
        className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full text-amber-400 pointer-events-none overflow-visible"
        fill="none"
      >
        <path
          d="M3 12C55 4 148 3 217 11"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default UnderlineHighlight;
