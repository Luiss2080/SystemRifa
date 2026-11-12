/**
 * Serializa un valor Decimal de Prisma (o string/número) a string con 2 decimales.
 * @param {import('@prisma/client').Prisma.Decimal | string | number | null | undefined} value
 * @returns {string | null}
 */
export function formatDecimal(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && typeof value.toFixed === 'function') {
    return value.toFixed(2);
  }
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : String(value);
}
