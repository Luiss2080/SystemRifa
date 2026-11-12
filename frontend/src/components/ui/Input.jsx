import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(function Input(
  { label, error, helperText, id, className = '', type, ...props },
  ref
) {
  const inputId = id || props.name;
  const esPassword = type === 'password';
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const tipoEfectivo = esPassword ? (mostrarPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={tipoEfectivo}
          className={`w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition focus:outline-none focus:ring-2 ${
            esPassword ? 'pr-10' : ''
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
          } disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setMostrarPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 transition hover:text-slate-600 cursor-pointer"
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export function Textarea({ label, error, helperText, id, className = '', rows = 3, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
        } disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
