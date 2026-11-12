import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearTokens,
  getRefreshToken,
  intentarRefreshInicial,
  setOnSessionLost,
  setTokens,
} from '../../api/client.js';
import { getMeRequest, loginRequest, logoutRequest, registroRequest } from './authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const limpiarEstado = useCallback(() => {
    clearTokens();
    setUsuario(null);
    setRoles([]);
    setPermisos([]);
  }, []);

  const cargarPerfil = useCallback(async () => {
    const me = await getMeRequest();
    setUsuario(me.usuario);
    setRoles(me.roles || []);
    setPermisos(me.permisos || []);
    return me;
  }, []);

  useEffect(() => {
    setOnSessionLost(() => {
      limpiarEstado();
    });

    let activo = true;
    (async () => {
      try {
        const token = await intentarRefreshInicial();
        if (token && activo) {
          await cargarPerfil();
        }
      } catch {
        if (activo) limpiarEstado();
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
      setOnSessionLost(null);
    };
  }, [cargarPerfil, limpiarEstado]);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await loginRequest({ email, password });
      setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      const me = await cargarPerfil();
      return me;
    },
    [cargarPerfil]
  );

  const registro = useCallback(async (payload) => {
    return registroRequest(payload);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch {
      // Aunque falle la red, limpiamos la sesión local
    } finally {
      limpiarEstado();
    }
  }, [limpiarEstado]);

  const tienePermiso = useCallback(
    (recurso, accion) => {
      if (!usuario) return false;
      if (roles.includes('ADMINISTRADOR')) return true;
      return permisos.includes(`${recurso}:${accion}`);
    },
    [usuario, roles, permisos]
  );

  const tieneAlgunPermiso = useCallback(
    (lista) => lista.some(([recurso, accion]) => tienePermiso(recurso, accion)),
    [tienePermiso]
  );

  const esAdmin = roles.includes('ADMINISTRADOR');
  const esOrganizador = roles.includes('ORGANIZADOR');

  const value = useMemo(
    () => ({
      usuario,
      roles,
      permisos,
      cargando,
      autenticado: Boolean(usuario),
      esAdmin,
      esOrganizador,
      login,
      registro,
      logout,
      recargarPerfil: cargarPerfil,
      tienePermiso,
      tieneAlgunPermiso,
    }),
    [
      usuario,
      roles,
      permisos,
      cargando,
      esAdmin,
      esOrganizador,
      login,
      registro,
      logout,
      cargarPerfil,
      tienePermiso,
      tieneAlgunPermiso,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
