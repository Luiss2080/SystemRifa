import { apiClient } from '../../api/client.js';

export async function getCausasPublicas() {
  const { data } = await apiClient.get('/causas');
  return data;
}

export async function getResumenPublico() {
  const { data } = await apiClient.get('/rifas/resumen-publico');
  return data;
}

export async function getCatalogoRifas(params) {
  const { data } = await apiClient.get('/rifas', { params });
  return data;
}

export async function getDetalleRifa(id) {
  const { data } = await apiClient.get(`/rifas/${id}`);
  return data;
}

export async function getTicketsRifa(id) {
  const { data } = await apiClient.get(`/rifas/${id}/tickets`);
  return data;
}

export async function getResultadoRifa(id) {
  const { data } = await apiClient.get(`/rifas/${id}/resultado`);
  return data;
}

export async function reservarTicketsRifa(rifaId, numeros) {
  const { data } = await apiClient.post(`/rifas/${rifaId}/reservas`, { numeros });
  return data;
}

export async function liberarReservasRifa(rifaId, numeros) {
  const { data } = await apiClient.delete(`/rifas/${rifaId}/reservas`, {
    data: numeros && numeros.length > 0 ? { numeros } : {},
  });
  return data;
}

export async function getMisTickets() {
  const { data } = await apiClient.get('/tickets/mios');
  return data;
}

export async function registrarPago(payload) {
  const { data } = await apiClient.post('/pagos', payload);
  return data;
}

export async function getMisPagos(params) {
  const { data } = await apiClient.get('/pagos/mios', { params });
  return data;
}

export async function getMisNotificaciones(params) {
  const { data } = await apiClient.get('/notificaciones', { params });
  return data;
}

export async function marcarNotificacionLeida(id) {
  const { data } = await apiClient.patch(`/notificaciones/${id}/leida`);
  return data;
}

export async function marcarTodasNotificacionesLeidas() {
  const { data } = await apiClient.patch('/notificaciones/leidas');
  return data;
}

export async function eliminarNotificacion(id) {
  const { data } = await apiClient.delete(`/notificaciones/${id}`);
  return data;
}

