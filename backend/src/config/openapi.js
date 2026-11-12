export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Sistema de Rifas Solidarias',
    version: '1.0.0',
    description:
      'API REST para gestión de rifas solidarias, reservas atómicas de tickets, verificación de pagos, sorteos criptográficos y auditoría.'
  },
  servers: [{ url: '/api', description: 'Servidor local' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': { get: { summary: 'Estado de salud del servicio y BD', tags: ['Sistema'] } },
    '/auth/registro': { post: { summary: 'Registrar nueva cuenta participante', tags: ['Auth'] } },
    '/auth/login': { post: { summary: 'Iniciar sesión (access + refresh token)', tags: ['Auth'] } },
    '/auth/refresh': { post: { summary: 'Rotar refresh token y emitir nuevo access token', tags: ['Auth'] } },
    '/auth/logout': { post: { summary: 'Cerrar sesión revocando refresh token', security: [{ bearerAuth: [] }], tags: ['Auth'] } },
    '/auth/me': { get: { summary: 'Obtener perfil, roles y permisos efectivos', security: [{ bearerAuth: [] }], tags: ['Auth'] } },
    '/usuarios/me': { patch: { summary: 'Actualizar datos propios', security: [{ bearerAuth: [] }], tags: ['Usuarios'] } },
    '/usuarios/me/password': { patch: { summary: 'Cambiar contraseña propia', security: [{ bearerAuth: [] }], tags: ['Usuarios'] } },
    '/usuarios': { get: { summary: 'Listar usuarios (Admin)', security: [{ bearerAuth: [] }], tags: ['Usuarios'] } },
    '/roles': { get: { summary: 'Listar roles y permisos', security: [{ bearerAuth: [] }], tags: ['RBAC'] } },
    '/causas': {
      get: { summary: 'Listar causas solidarias (Público)', tags: ['Causas'] },
      post: { summary: 'Crear causa solidaria (Admin)', security: [{ bearerAuth: [] }], tags: ['Causas'] }
    },
    '/solicitudes': {
      post: { summary: 'Crear solicitud de rifa', security: [{ bearerAuth: [] }], tags: ['Solicitudes'] },
      get: { summary: 'Listar solicitudes (Admin)', security: [{ bearerAuth: [] }], tags: ['Solicitudes'] }
    },
    '/solicitudes/mias': { get: { summary: 'Listar mis solicitudes', security: [{ bearerAuth: [] }], tags: ['Solicitudes'] } },
    '/solicitudes/{id}/aprobar': { post: { summary: 'Ajustar y aprobar solicitud generando rifa y tickets', security: [{ bearerAuth: [] }], tags: ['Solicitudes'] } },
    '/rifas': { get: { summary: 'Catálogo público de rifas activas', tags: ['Rifas'] } },
    '/rifas/mias': { get: { summary: 'Listar rifas propias del organizador', security: [{ bearerAuth: [] }], tags: ['Rifas'] } },
    '/rifas/{id}': { get: { summary: 'Detalle público de rifa y premios', tags: ['Rifas'] } },
    '/rifas/{id}/tickets': { get: { summary: 'Mapa público de estados de tickets', tags: ['Rifas'] } },
    '/rifas/{id}/reservas': {
      post: { summary: 'Reservar números atómicamente', security: [{ bearerAuth: [] }], tags: ['Tickets'] },
      delete: { summary: 'Liberar reservas propias', security: [{ bearerAuth: [] }], tags: ['Tickets'] }
    },
    '/rifas/{id}/sorteo': { post: { summary: 'Realizar sorteo criptográfico entre tickets vendidos', security: [{ bearerAuth: [] }], tags: ['Sorteos'] } },
    '/rifas/{id}/resultado': { get: { summary: 'Resultado público sin PII del sorteo', tags: ['Sorteos'] } },
    '/pagos': {
      post: { summary: 'Registrar pago de reserva', security: [{ bearerAuth: [] }], tags: ['Pagos'] },
      get: { summary: 'Listar pagos para verificación (Admin)', security: [{ bearerAuth: [] }], tags: ['Pagos'] }
    },
    '/pagos/{id}/verificar': { patch: { summary: 'Confirmar o rechazar pago', security: [{ bearerAuth: [] }], tags: ['Pagos'] } },
    '/reportes/resumen': { get: { summary: 'Resumen global (Admin)', security: [{ bearerAuth: [] }], tags: ['Reportes'] } },
    '/reportes/causas': { get: { summary: 'Consolidado por causas (Admin)', security: [{ bearerAuth: [] }], tags: ['Reportes'] } },
    '/reportes/rifas/{id}': { get: { summary: 'Reporte de una rifa', security: [{ bearerAuth: [] }], tags: ['Reportes'] } },
    '/auditoria': { get: { summary: 'Bitácora de auditoría (Admin)', security: [{ bearerAuth: [] }], tags: ['Reportes'] } }
  }
};

