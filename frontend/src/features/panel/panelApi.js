import { apiClient } from '../../api/client.js';

// Solicitudes (Organizador y Admin)
export async function crearSolicitudApi(payload) {
  const { data } = await apiClient.post('/solicitudes', payload);
  return data;
}

export async function getMisSolicitudesApi(params) {
  const { data } = await apiClient.get('/solicitudes/mias', { params });
  return data;
}

export async function getSolicitudesAdminApi(params) {
  const { data } = await apiClient.get('/solicitudes', { params });
  return data;
}

export async function cambiarEstadoSolicitudApi(id, payload) {
  const { data } = await apiClient.patch(`/solicitudes/${id}/estado`, payload);
  return data;
}

export async function aprobarSolicitudApi(id, payload) {
  const { data } = await apiClient.post(`/solicitudes/${id}/aprobar`, payload);
  return data;
}

// Rifas, Premios y Sorteo (Organizador / Admin)
export async function getMisRifasApi(params) {
  const { data } = await apiClient.get('/rifas/mias', { params });
  return data;
}

export async function extenderRifaApi(rifaId, fechaFin) {
  const { data } = await apiClient.patch(`/rifas/${rifaId}/extender`, { fechaFin });
  return data;
}

export async function crearPremioApi(rifaId, payload) {
  const { data } = await apiClient.post(`/rifas/${rifaId}/premios`, payload);
  return data;
}

export async function actualizarPremioApi(premioId, payload) {
  const { data } = await apiClient.patch(`/premios/${premioId}`, payload);
  return data;
}

export async function desactivarPremioApi(premioId) {
  const { data } = await apiClient.delete(`/premios/${premioId}`);
  return data;
}

export async function realizarSorteoApi(rifaId, payload) {
  const { data } = await apiClient.post(`/rifas/${rifaId}/sorteo`, payload);
  return data;
}

export async function finalizarRifaSinVentasApi(rifaId, motivo) {
  const { data } = await apiClient.post(`/rifas/${rifaId}/finalizar`, { motivo });
  return data;
}

export async function registrarEntregaPremioApi(premioId, payload) {
  const { data } = await apiClient.patch(`/premios/${premioId}/entrega`, payload);
  return data;
}

export async function getReporteRifaApi(rifaId) {
  const { data } = await apiClient.get(`/reportes/rifas/${rifaId}`);
  return data;
}

// Admin Pagos
export async function getPagosAdminApi(params) {
  const { data } = await apiClient.get('/pagos', { params });
  return data;
}

export async function verificarPagoAdminApi(pagoId, payload) {
  const { data } = await apiClient.patch(`/pagos/${pagoId}/verificar`, payload);
  return data;
}

// Admin Causas
export async function crearCausaApi(payload) {
  const { data } = await apiClient.post('/causas', payload);
  return data;
}

export async function actualizarCausaApi(id, payload) {
  const { data } = await apiClient.patch(`/causas/${id}`, payload);
  return data;
}

export async function eliminarCausaApi(id) {
  const { data } = await apiClient.delete(`/causas/${id}`);
  return data;
}

// Admin Usuarios, Roles, Permisos y Historial
export async function getUsuariosAdminApi(params) {
  const { data } = await apiClient.get('/usuarios', { params });
  return data;
}

export async function getUsuarioDetalleApi(id) {
  const { data } = await apiClient.get(`/usuarios/${id}`);
  return data;
}

export async function cambiarActivoUsuarioApi(id, activo) {
  const { data } = await apiClient.patch(`/usuarios/${id}/activo`, { activo });
  return data;
}

export async function asignarRolUsuarioApi(usuarioId, rolId) {
  const { data } = await apiClient.put(`/usuarios/${usuarioId}/roles/${rolId}`);
  return data;
}

export async function quitarRolUsuarioApi(usuarioId, rolId) {
  const { data } = await apiClient.delete(`/usuarios/${usuarioId}/roles/${rolId}`);
  return data;
}

export async function asignarPermisoUsuarioApi(usuarioId, permisoId) {
  const { data } = await apiClient.put(`/usuarios/${usuarioId}/permisos/${permisoId}`);
  return data;
}

export async function quitarPermisoUsuarioApi(usuarioId, permisoId) {
  const { data } = await apiClient.delete(`/usuarios/${usuarioId}/permisos/${permisoId}`);
  return data;
}

export async function getRolesApi() {
  const { data } = await apiClient.get('/roles');
  return data;
}

export async function crearRolApi(payload) {
  const { data } = await apiClient.post('/roles', payload);
  return data;
}

export async function asignarPermisoRolApi(rolId, permisoId) {
  const { data } = await apiClient.put(`/roles/${rolId}/permisos/${permisoId}`);
  return data;
}

export async function quitarPermisoRolApi(rolId, permisoId) {
  const { data } = await apiClient.delete(`/roles/${rolId}/permisos/${permisoId}`);
  return data;
}

export async function getPermisosApi(params) {
  const { data } = await apiClient.get('/permisos', { params });
  return data;
}

export async function getHistorialPermisosApi(params) {
  const { data } = await apiClient.get('/historial-permisos', { params });
  return data;
}

// Plantillas de notificación
export async function getTiposNotificacionApi() {
  const { data } = await apiClient.get('/tipos-notificacion');
  return data;
}

export async function actualizarTipoNotificacionApi(id, payload) {
  const { data } = await apiClient.patch(`/tipos-notificacion/${id}`, payload);
  return data;
}

// Reportes globales y Auditoría
export async function getReporteResumenApi() {
  const { data } = await apiClient.get('/reportes/resumen');
  return data;
}

export async function getReporteCausasApi() {
  const { data } = await apiClient.get('/reportes/causas');
  return data;
}

export async function getAuditoriaApi(params) {
  const { data } = await apiClient.get('/auditoria', { params });
  return data;
}

