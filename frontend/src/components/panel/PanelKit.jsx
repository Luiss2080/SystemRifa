import { Filter, RotateCcw, Search, SlidersHorizontal, TrendingUp } from 'lucide-react';

const SPARKLINE_PATHS = [
  'M2 18 L12 14 L22 16 L32 9 L42 12 L52 4',
  'M2 16 L12 18 L22 10 L32 13 L42 6 L52 8',
  'M2 19 L12 13 L22 15 L32 7 L42 10 L52 3',
  'M2 15 L12 11 L22 14 L32 8 L42 5 L52 2',
];

const ACCENT_MAP = {
  emerald: {
    iconBox: 'bg-emerald-600 text-white shadow-emerald-600/20',
    softIcon: 'bg-emerald-50 text-emerald-600 ring-emerald-200/70',
    value: 'text-slate-900',
    trend: 'bg-emerald-50 text-emerald-700',
    spark: '#10b981',
    dot: 'bg-emerald-500',
  },
  amber: {
    iconBox: 'bg-amber-500 text-white shadow-amber-500/20',
    softIcon: 'bg-amber-50 text-amber-600 ring-amber-200/70',
    value: 'text-slate-900',
    trend: 'bg-amber-50 text-amber-700',
    spark: '#f59e0b',
    dot: 'bg-amber-500',
  },
  sky: {
    iconBox: 'bg-sky-600 text-white shadow-sky-600/20',
    softIcon: 'bg-sky-50 text-sky-600 ring-sky-200/70',
    value: 'text-slate-900',
    trend: 'bg-sky-50 text-sky-700',
    spark: '#0ea5e9',
    dot: 'bg-sky-500',
  },
  indigo: {
    iconBox: 'bg-indigo-600 text-white shadow-indigo-600/20',
    softIcon: 'bg-indigo-50 text-indigo-600 ring-indigo-200/70',
    value: 'text-slate-900',
    trend: 'bg-indigo-50 text-indigo-700',
    spark: '#6366f1',
    dot: 'bg-indigo-500',
  },
  rose: {
    iconBox: 'bg-rose-600 text-white shadow-rose-600/20',
    softIcon: 'bg-rose-50 text-rose-600 ring-rose-200/70',
    value: 'text-slate-900',
    trend: 'bg-rose-50 text-rose-700',
    spark: '#e11d48',
    dot: 'bg-rose-500',
  },
};

export function PanelFilterBar({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar de forma inteligente...',
  hasActiveFilters = false,
  onResetFilters,
  selects = [],
  extraContent,
  rightActions,
}) {
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/20">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 sm:text-base">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rightActions}
          {onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition ${
                hasActiveFilters
                  ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-default'
              }`}
            >
              {hasActiveFilters ? (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Limpiar filtros
                </>
              ) : (
                <>
                  <Filter className="h-3 w-3" />
                  Sin filtros
                </>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Filter className="h-3 w-3" />
              {hasActiveFilters ? 'Filtro activo' : 'Sin filtros'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-12 md:items-end">
        {onSearchChange && (
          <div className={selects.length >= 2 ? 'md:col-span-5' : selects.length === 1 ? 'md:col-span-7' : 'md:col-span-11'}>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
              Filtrar registros
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
        )}

        {selects.map((sel, idx) => (
          <div
            key={sel.label || idx}
            className={
              selects.length === 1
                ? 'md:col-span-4'
                : selects.length === 2
                  ? 'md:col-span-3'
                  : 'md:col-span-2'
            }
          >
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {sel.label}
            </label>
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
            >
              {sel.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onSearchChange && (
          <div className="hidden md:col-span-1 md:flex md:justify-end">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xs"
            >
              <Filter className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>

      {extraContent && <div className="mt-3 border-t border-slate-100 pt-3">{extraContent}</div>}
    </section>
  );
}

export function PanelSectionHeader({
  icon: Icon = SlidersHorizontal,
  title,
  subtitle = 'Resultados de la consulta activa',
  badgeText,
  actions,
  accent = 'emerald',
}) {
  const palette = ACCENT_MAP[accent] || ACCENT_MAP.emerald;

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3.5 shadow-2xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${palette.iconBox}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {title}
            </h2>
            <span className={`h-2 w-2 rounded-full ${palette.dot}`} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            &rsaquo; {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {badgeText && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            {badgeText}
          </span>
        )}
        {actions}
      </div>
    </section>
  );
}

export function PanelKpiCard({
  label,
  value,
  trendText,
  icon: Icon,
  accent = 'emerald',
  sparkIndex = 0,
}) {
  const palette = ACCENT_MAP[accent] || ACCENT_MAP.emerald;
  const path = SPARKLINE_PATHS[sparkIndex % SPARKLINE_PATHS.length];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xs backdrop-blur-md transition hover:border-emerald-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${palette.softIcon}`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className={`mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl ${palette.value}`}>
        {value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        {trendText ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${palette.trend}`}
          >
            <TrendingUp className="h-3 w-3" />
            {trendText}
          </span>
        ) : (
          <span />
        )}

        <svg viewBox="0 0 54 22" className="h-6 w-14 shrink-0" fill="none" aria-hidden="true">
          <path
            d={path}
            stroke={palette.spark}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function PanelKpiGrid({ items = [] }) {
  const cols =
    items.length >= 4
      ? 'sm:grid-cols-2 xl:grid-cols-4'
      : items.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2';

  return (
    <section className={`grid gap-4 ${cols}`}>
      {items.map((item, idx) => (
        <PanelKpiCard key={item.label} {...item} sparkIndex={idx} />
      ))}
    </section>
  );
}

export function RowActionButton({
  icon: Icon,
  label,
  title,
  onClick,
  tone = 'neutral',
  disabled = false,
}) {
  const tones = {
    view: 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs',
    amber: 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs',
    danger:
      'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white',
    neutral:
      'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={title || label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
        tones[tone] || tones.neutral
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {label && <span>{label}</span>}
    </button>
  );
}

