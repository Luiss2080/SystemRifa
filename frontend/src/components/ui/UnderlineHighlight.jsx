export function UnderlineHighlight({ children, className = '' }) {
  return (
    <span className={`relative inline-block text-emerald-700 pb-1.5 sm:pb-2 ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 220 18"
        preserveAspectRatio="none"
        className="absolute -bottom-0.5 sm:-bottom-1 left-0 w-full h-[7px] sm:h-[9px] text-amber-400 pointer-events-none z-0"
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
