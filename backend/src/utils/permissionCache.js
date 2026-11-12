const DEFAULT_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

/**
 * Obtiene permisos y roles cacheados para un usuario si no han expirado.
 * @param {number} usuarioId
 * @returns {{ roles: string[], permisos: Set<string> } | null}
 */
export function getCachedPermissions(usuarioId) {
  const entry = cache.get(usuarioId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(usuarioId);
    return null;
  }

  return entry.value;
}

/**
 * Guarda en caché los roles y permisos efectivos de un usuario.
 * @param {number} usuarioId
 * @param {{ roles: string[], permisos: Set<string> }} value
 * @param {number} [ttlMs]
 */
export function setCachedPermissions(usuarioId, value, ttlMs = DEFAULT_TTL_MS) {
  cache.set(usuarioId, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export function invalidateUserPermissions(usuarioId) {
  cache.delete(usuarioId);
}

export function invalidateAllPermissions() {
  cache.clear();
}
