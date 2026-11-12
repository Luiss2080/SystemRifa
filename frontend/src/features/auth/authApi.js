import { apiClient } from '../../api/client.js';

export async function loginRequest(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function registroRequest(payload) {
  const { data } = await apiClient.post('/auth/registro', payload);
  return data;
}

export async function logoutRequest(refreshToken) {
  const { data } = await apiClient.post('/auth/logout', { refreshToken });
  return data;
}

export async function getMeRequest() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function updateMiPerfilRequest(payload) {
  const { data } = await apiClient.patch('/usuarios/me', payload);
  return data;
}

export async function cambiarMiPasswordRequest(payload) {
  const { data } = await apiClient.patch('/usuarios/me/password', payload);
  return data;
}
