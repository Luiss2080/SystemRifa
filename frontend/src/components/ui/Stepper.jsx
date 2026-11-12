import { Check } from 'lucide-react';

/**
 * Indicador visual interactivo de progreso paso a paso.
 * @param {{ steps: Array<{ label: string, hint?: string }>, currentStep: number }} props
 */
export function StepIndicator({ steps = [], currentStep = 0 }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-3" aria-label="Progreso del proceso">
      {steps.map((step, idx) => {
        const completado = idx < currentStep;
        const activo = idx === currentStep;
        return (
          <li
            key={step.label}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
              completado
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : activo
                  ? 'border-emerald-500 bg-white shadow-xs ring-2 ring-emerald-100 text-slate-900'
                  : 'border-slate-200 bg-slate-50/70 text-slate-400'
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                completado
                  ? 'bg-emerald-600 text-white'
                  : activo
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {completado ? <Check className="h-4 w-4" /> : idx + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{step.label}</p>
              {step.hint && <p className="truncate text-[11px] opacity-80">{step.hint}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
