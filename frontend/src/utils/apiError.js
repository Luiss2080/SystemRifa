const MENSAJES_POR_CODIGO = {
  VALIDATION_ERROR: 'Revisa los datos ingresados en el formulario.',
  UNAUTHORIZED: 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  USER_INACTIVE: 'Tu cuenta está desactivada. Contacta al administrador.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no existe o ya no está disponible.',
  CONFLICT: 'La operación no se puede completar en el estado actual.',
  INVALID_STATE_TRANSITION: 'Transición de estado no permitida.',
  TICKETS_UNAVAILABLE: 'Uno o más números seleccionados ya no están disponibles.',
  RESERVATION_LIMIT_EXCEEDED: 'Superaste el límite máximo de números permitidos.',
  RATE_LIMIT_EXCEEDED: 'Demasiados intentos en poco tiempo. Espera unos segundos e intenta de nuevo.',
  DUPLICATE_ENTRY: 'Ya existe un registro con esos datos.',
};

export function extraerErrorApi(error) {
  if (!error) {
    return { code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.', details: null };
  }

  const data = error.response?.data;
  if (data?.error) {
    const code = data.error.code || 'API_ERROR';
    const message = data.error.message || MENSAJES_POR_CODIGO[code] || 'Error al procesar la solicitud.';
    return {
      code,
      message,
      details: data.error.details || null,
      status: error.response?.status,
    };
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión o si el backend está activo.',
      details: null,
      status: 0,
    };
  }

  return {
    code: 'HTTP_ERROR',
    message: MENSAJES_POR_CODIGO[error.response?.status] || `Error del servidor (${error.response?.status}).`,
    details: null,
    status: error.response?.status,
  };
}

