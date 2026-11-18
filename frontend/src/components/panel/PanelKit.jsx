import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Filter,
  ListFilter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Select } from '../ui/Select.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

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
  modalFiltersContent,
}) {
  const [modalMasFiltros, setModalMasFiltros] = useState(false);

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
          <div
            className={
              selects.length >= 2
                ? 'md:col-span-5'
                : selects.length === 1
                  ? 'md:col-span-7'
                  : 'md:col-span-11'
            }
          >
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
            <Select
              label={sel.label}
              value={sel.value}
              options={sel.options}
              onValueChange={sel.onChange}
              onChange={(e) => sel.onChange(e?.target ? e.target.value : e)}
            />
          </div>
        ))}

        {onSearchChange && (
          <div className="hidden md:col-span-1 md:flex md:justify-end">
            <button
              type="button"
              onClick={() => setModalMasFiltros(true)}
              title="Más filtros avanzados"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 hover:scale-105 active:scale-95 transition cursor-pointer"
              aria-label="Abrir modal de más filtros"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 ring-2 ring-white" />
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {extraContent && <div className="mt-3 border-t border-slate-100 pt-3">{extraContent}</div>}

      {/* Modal de más filtros para todos los módulos */}
      <Modal
        open={modalMasFiltros}
        onClose={() => setModalMasFiltros(false)}
        title={`Filtros avanzados · ${title || 'Módulo'}`}
        description="Ajusta criterios de ordenamiento, filtros rápidos y parámetros de consulta para afinar los registros."
        badge="Filtros avanzados"
        icon={SlidersHorizontal}
        tone="emerald"
        maxWidth="max-w-3xl sm:max-w-4xl"
        footer={
          <div className="flex w-full items-center justify-between">
            {onResetFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onResetFilters();
                  setModalMasFiltros(false);
                }}
                disabled={!hasActiveFilters}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Limpiar todo
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="secondary" size="sm" onClick={() => setModalMasFiltros(false)}>
                Cerrar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setModalMasFiltros(false)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {modalFiltersContent ? (
            modalFiltersContent
          ) : (
            <div className="grid gap-4 md:grid-cols-12 items-start">
              {/* Columna izquierda: Filtros principales de selección */}
              <div className="md:col-span-7 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ListFilter className="h-3.5 w-3.5 text-emerald-600" />
                  Criterios de filtrado rápido
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {selects.map((sel, idx) => (
                    <div key={sel.label || idx} className="space-y-1.5">
                      <Select
                        label={sel.label}
                        value={sel.value}
                        options={sel.options}
                        onValueChange={sel.onChange}
                        onChange={(e) => sel.onChange(e?.target ? e.target.value : e)}
                      />
                    </div>
                  ))}
                </div>

                {onSearchChange && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Búsqueda textual específica
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-3 pl-8 text-xs text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha: Resumen de filtros activos y atajos */}
              <div className="md:col-span-5 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-slate-50/50 p-3.5 text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-900">
                    Estado de filtros
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      hasActiveFilters
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {hasActiveFilters ? 'Filtros aplicados' : 'Sin filtros'}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 text-[11.5px]">
                  <p>
                    <strong>Búsqueda:</strong>{' '}
                    {searchValue ? `"${searchValue}"` : <span className="text-slate-400">Ninguna</span>}
                  </p>
                  {selects.map((sel, idx) => {
                    const optActiva = sel.options.find((o) => String(o.value) === String(sel.value));
                    return (
                      <p key={sel.label || idx} className="truncate">
                        <strong>{sel.label}:</strong>{' '}
                        <span className="text-emerald-700 font-bold">{optActiva?.label || sel.value || 'Predeterminado'}</span>
                      </p>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-emerald-100/40 p-2 text-[10.5px] text-emerald-900 leading-tight">
                  ✨ Los cambios seleccionados se aplican y sincronizan automáticamente con la tabla y catálogo de datos.
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}

export function PanelSectionHeader({
  icon = SlidersHorizontal,
  title,
  subtitle = 'Resultados de la consulta activa',
  badgeText,
  actions,
  accent = 'emerald',
}) {
  const IconComp = icon;
  const palette = ACCENT_MAP[accent] || ACCENT_MAP.emerald;

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3.5 shadow-2xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${palette.iconBox}`}
        >
          <IconComp className="h-4.5 w-4.5" />
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
    view: 'border-sky-200/90 bg-sky-50/80 text-sky-800 hover:bg-sky-100 hover:border-sky-300 hover:text-sky-900',
    edit: 'border-teal-200/90 bg-teal-50/80 text-teal-800 hover:bg-teal-100 hover:border-teal-300 hover:text-teal-900',
    primary:
      'border-emerald-200/90 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-900',
    amber:
      'border-amber-200/90 bg-amber-50/80 text-amber-800 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-900',
    danger:
      'border-rose-200/90 bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800',
    neutral:
      'border-slate-200/90 bg-slate-50/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={title || label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border h-8 ${label ? 'px-2.5' : 'w-8'} text-xs font-bold shadow-2xs transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
        tones[tone] || tones.neutral
      }`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {label && <span>{label}</span>}
    </button>
  );
}

