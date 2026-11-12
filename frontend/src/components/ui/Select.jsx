export function Select({ label, error, helperText, id, options = [], placeholder, className = '', ...props }) {
  const selectId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-[13px] font-semibold text-slate-700">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-4 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
        } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

