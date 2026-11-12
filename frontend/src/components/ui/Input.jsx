import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(function Input(
  { label, labelRight, error, helperText, id, className = '', type, icon = null, ...props },
  ref
) {
  const inputId = id || props.name;
  const esPassword = type === 'password';
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const tipoEfectivo = esPassword ? (mostrarPassword ? 'text' : 'password') : type;
  const Icon = icon;

  return (
    <div className="space-y-1.5">
      {(label || labelRight) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label htmlFor={inputId} className="block text-[13px] font-semibold text-slate-700">
              {label}
              {props.required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          ) : (
            <span />
          )}
          {labelRight}
        </div>
      )}
      <div className="group relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-600" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={tipoEfectivo}
          className={`w-full rounded-xl border bg-slate-50/70 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-4 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${esPassword ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
          } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setMostrarPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-emerald-700 cursor-pointer"
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export function Textarea({ label, error, helperText, id, className = '', rows = 3, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-slate-700">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-4 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
        } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
