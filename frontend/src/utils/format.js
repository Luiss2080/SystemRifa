/**
 * Convierte un string decimal (ej. "25.50") o entero a centavos exactos sin aritmética flotante.
 */
export function aCentavos(valor) {
  if (valor === null || valor === undefined || valor === '') return 0;
  const texto = String(valor).trim().replace(',', '.');
  const negativo = texto.startsWith('-');
  const limpio = negativo ? texto.slice(1) : texto;
  const [enteros = '0', decimales = ''] = limpio.split('.');
  const decPadded = `${decimales}00`.slice(0, 2);
  const centavos = Number.parseInt(enteros || '0', 10) * 100 + Number.parseInt(decPadded, 10);
  if (Number.isNaN(centavos)) return 0;
  return negativo ? -centavos : centavos;
}

export function deCentavos(centavos) {
  const n = Math.trunc(Number(centavos) || 0);
  const negativo = n < 0;
  const abs = Math.abs(n);
  const enteros = Math.floor(abs / 100);
  const dec = String(abs % 100).padStart(2, '0');
  return `${negativo ? '-' : ''}${enteros}.${dec}`;
}

export function formatearBs(valor) {
  const texto = deCentavos(aCentavos(valor));
  const [enteros, dec] = texto.split('.');
  const conMiles = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Bs ${conMiles}.${dec}`;
}

export function multiplicarMontoBs(precioDecimal, cantidad) {
  return deCentavos(aCentavos(precioDecimal) * Math.max(0, Math.trunc(Number(cantidad) || 0)));
}

export function sumarMontosBs(listaValores) {
  const totalCentavos = (listaValores || []).reduce((acc, v) => acc + aCentavos(v), 0);
  return deCentavos(totalCentavos);
}

const fmtFechaHora = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'America/La_Paz',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const fmtFechaCorta = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'America/La_Paz',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatearFecha(isoUtc) {
  if (!isoUtc) return '—';
  const fecha = new Date(isoUtc);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fmtFechaHora.format(fecha);
}

export function formatearFechaCorta(isoUtc) {
  if (!isoUtc) return '—';
  const fecha = new Date(isoUtc);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fmtFechaCorta.format(fecha);
}

/**
 * Convierte una fecha ISO UTC al formato requerido por `<input type="datetime-local">` en America/La_Paz (UTC-4).
 */
export function aDatetimeLocalLaPaz(isoUtc) {
  if (!isoUtc) return '';
  const fecha = new Date(isoUtc);
  if (Number.isNaN(fecha.getTime())) return '';
  // America/La_Paz no usa horario de verano (siempre UTC-4)
  const localMs = fecha.getTime() - 4 * 60 * 60 * 1000;
  return new Date(localMs).toISOString().slice(0, 16);
}

export function deDatetimeLocalLaPazAUtcIso(valorLocal) {
  if (!valorLocal) return null;
  // Interpreta explícitamente en -04:00
  const fecha = new Date(`${valorLocal}:00-04:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toISOString();
}
