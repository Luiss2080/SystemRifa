import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REFRESH_STORAGE_KEY = 'rifas_refresh_token';

/**
 * Decisión de almacenamiento de tokens (documentada por seguridad):
 * - `accessToken` vive exclusivamente en memoria JS (no en localStorage ni sessionStorage)
 *   para reducir el impacto si existiera un vector XSS.
 * - `refreshToken` se persiste en localStorage para permitir renovación silenciosa al recargar la página.
 *   Trade-off: frente a una cookie `HttpOnly + SameSite`, localStorage sigue siendo accesible vía JS ante XSS,
 *   pero evita configuración CSRF entre dominios durante desarrollo y es compatible con clientes stateless.
 */
let accessTokenMemoria = null;
let onSessionLostCallback = null;
let refreshPromiseEnCurso = null;

export function getAccessToken() {
  return accessTokenMemoria;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken !== undefined) {
    accessTokenMemoria = accessToken;
  }
  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
  }
}

export function clearTokens() {
  accessTokenMemoria = null;
  localStorage.removeItem(REFRESH_STORAGE_KEY);
}

export function setOnSessionLost(callback) {
  onSessionLostCallback = callback;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (accessTokenMemoria && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessTokenMemoria}`;
  }
  return config;
});

async function ejecutarRefreshUnico() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  if (!refreshPromiseEnCurso) {
    refreshPromiseEnCurso = axios
      .post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        const nuevos = res.data;
        setTokens({
          accessToken: nuevos.accessToken,
          refreshToken: nuevos.refreshToken,
        });
        return nuevos.accessToken;
      })
      .finally(() => {
        refreshPromiseEnCurso = null;
      });
  }

  return refreshPromiseEnCurso;
}

export async function intentarRefreshInicial() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    return await ejecutarRefreshUnico();
  } catch {
    clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Evita bucles en endpoints públicos de auth o en reintentos previos
    const esRutaAuthSinRefresh =
      url.includes('/auth/login') || url.includes('/auth/registro') || url.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !esRutaAuthSinRefresh) {
      originalRequest._retry = true;

      try {
        const nuevoAccessToken = await ejecutarRefreshUnico();
        originalRequest.headers.Authorization = `Bearer ${nuevoAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        if (onSessionLostCallback) {
          onSessionLostCallback();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
