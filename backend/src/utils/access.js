/**
 * Extrae el conjunto de permisos efectivos activos ("recurso:accion") a partir
 * de los roles del usuario y sus permisos directos.
 * @param {{ roles: Array<{ rol: { permisos: Array<{ permiso: { recurso: string, accion: string, estaActivo: boolean } }> } }>, permisosDirectos: Array<{ permiso: { recurso: string, accion: string, estaActivo: boolean } }> }} userWithAccess
 * @returns {string[]}
 */
export function extractEffectivePermissions(userWithAccess) {
  const permisosSet = new Set();

  for (const rolUsuario of userWithAccess.roles || []) {
    for (const pr of rolUsuario.rol.permisos || []) {
      if (pr.permiso.estaActivo) {
        permisosSet.add(`${pr.permiso.recurso}:${pr.permiso.accion}`);
      }
    }
  }

  for (const pu of userWithAccess.permisosDirectos || []) {
    if (pu.permiso.estaActivo) {
      permisosSet.add(`${pu.permiso.recurso}:${pu.permiso.accion}`);
    }
  }

  return Array.from(permisosSet).sort();
}

/**
 * Indica si el usuario autenticado posee el rol ADMINISTRADOR.
 * @param {{ roles?: string[] } | undefined | null} user
 * @returns {boolean}
 */
export function esAdmin(user) {
  return Boolean(user?.roles?.includes('ADMINISTRADOR'));
}
