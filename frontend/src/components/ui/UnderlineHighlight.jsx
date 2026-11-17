export function UnderlineHighlight({ children, className = '' }) {
  return (
    <span className={`relative inline-block text-emerald-700 ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 220 18"
        preserveAspectRatio="none"
        className="absolute -bottom-1 sm:-bottom-1.5 left-0 h-[6px] sm:h-[8px] w-full text-amber-400 pointer-events-none"
        fill="none"
      >
        <path
          d="M3 12C55 4 148 3 217 11"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default UnderlineHighlight;
