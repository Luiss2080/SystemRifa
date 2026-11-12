export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 hover:shadow-md hover:shadow-emerald-600/30 focus:ring-emerald-500',
    secondary:
      'bg-white text-slate-800 border border-slate-300 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-800 focus:ring-emerald-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-600/25 hover:from-rose-700 hover:to-red-700 hover:shadow-md focus:ring-rose-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    amber:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 hover:shadow-md focus:ring-amber-500',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
