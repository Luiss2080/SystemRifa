/**
 * Resuelve el rol principal del usuario autenticado y las rutas/paneles
 * habilitados para separar la landing pública de los espacios del sistema.
 */
export function resolverAccesoRol({
  autenticado,
  esAdmin,
  esOrganizador,
  tienePermiso,
  tieneAlgunPermiso,
}) {
  if (!autenticado) {
    return {
      rolPrincipal: 'INVITADO',
      tieneAdminPanel: false,
      tieneOrganizadorPanel: false,
      primerAdminDestino: '/admin/reportes',
      homeDestino: '/',
    };
  }

  // 'reportes:leer' también lo posee ORGANIZADOR en el seed, por lo que no define panel admin por sí solo.
  const tieneAdminPanel =
    esAdmin ||
    tieneAlgunPermiso([
      ['solicitudes', 'revisar'],
      ['pagos', 'verificar'],
      ['causas', 'crud'],
      ['usuarios', 'leer'],
      ['roles', 'administrar'],
      ['permisos', 'administrar'],
      ['plantillas', 'administrar'],
    ]);

  const tieneOrganizadorPanel =
    !tieneAdminPanel &&
    (esOrganizador ||
      tieneAlgunPermiso([
        ['rifas', 'administrar'],
        ['premios', 'crud'],
        ['sorteos', 'realizar'],
        ['ganadores', 'publicar'],
      ]));

  const primerAdminDestino =
    esAdmin || tienePermiso('reportes', 'leer')
      ? '/admin/reportes'
      : tienePermiso('solicitudes', 'revisar')
        ? '/admin/solicitudes'
        : tienePermiso('pagos', 'verificar')
          ? '/admin/pagos'
          : tienePermiso('causas', 'crud')
            ? '/admin/causas'
            : tienePermiso('usuarios', 'leer')
              ? '/admin/usuarios'
              : tienePermiso('roles', 'administrar') || tienePermiso('permisos', 'administrar')
                ? '/admin/roles'
                : '/admin/plantillas';

  const rolPrincipal = tieneAdminPanel
    ? 'ADMINISTRADOR'
    : tieneOrganizadorPanel
      ? 'ORGANIZADOR'
      : 'PARTICIPANTE';

  const homeDestino =
    rolPrincipal === 'ADMINISTRADOR'
      ? primerAdminDestino
      : rolPrincipal === 'ORGANIZADOR'
        ? '/organizador/rifas'
        : '/explorar';

  return {
    rolPrincipal,
    tieneAdminPanel,
    tieneOrganizadorPanel,
    primerAdminDestino,
    homeDestino,
  };
}
