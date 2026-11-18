import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function Select({
  label,
  error,
  helperText,
  id,
  options = [],
  placeholder,
  value,
  onChange,
  onValueChange,
  className = '',
  disabled = false,
  size = 'md',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectId = id || props.name;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Resolver etiqueta activa
  const valorActual = value !== undefined ? String(value) : '';
  const opcionSeleccionada = options.find((opt) => String(opt.value) === valorActual);
  const textoMostrado = opcionSeleccionada
    ? opcionSeleccionada.label
    : placeholder || (options[0]?.label ?? 'Seleccionar...');

  function handleSelect(optValue) {
    if (disabled) return;
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(optValue);
    }
    if (onChange) {
      const syntheticEvent = {
        target: { name: props.name || id, value: optValue },
        currentTarget: { name: props.name || id, value: optValue },
        value: optValue,
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent, optValue);
    }
  }

  const heightClass = size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2.5 px-3.5 text-sm';

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
        >
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between gap-2 rounded-2xl border font-semibold transition cursor-pointer select-none text-left ${heightClass} ${
            error
              ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
              : isOpen
                ? 'border-emerald-500 bg-white text-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200/90 bg-white text-slate-800 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50'
          } ${disabled ? 'cursor-not-allowed opacity-50 bg-slate-100' : ''}`}
        >
          <span className={`truncate ${!opcionSeleccionada && placeholder ? 'text-slate-400 font-normal' : ''}`}>
            {textoMostrado}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Menú desplegable flotante con el estilo visual del sistema */}
        {isOpen && !disabled && (
          <div
            role="listbox"
            tabIndex={-1}
            className="animate-modal-in absolute top-full left-0 z-50 mt-1.5 max-h-60 w-full min-w-[180px] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/98 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md ring-1 ring-slate-900/5"
          >
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer text-left ${
                  valorActual === ''
                    ? 'bg-emerald-50 text-emerald-950 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>{placeholder}</span>
                {valorActual === '' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
            )}

            {options.map((opt) => {
              const isSelected = String(opt.value) === valorActual;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-500/30'
                      : 'text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                </button>
              );
            })}

            {options.length === 0 && !placeholder && (
              <div className="px-3 py-2 text-center text-xs text-slate-400">
                Sin opciones disponibles
              </div>
            )}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
