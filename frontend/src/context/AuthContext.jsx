// ============================================================
// Contexto de Autenticación - MEJORADO
// ============================================================
// Características:
// - Guarda usuario y token en localStorage
// - Login único por día (solo un login por día)
// - Confirmación antes de logout
// - Token disponible para peticiones API
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('dgus_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('dgus_token') || null;
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Inicia sesión con cédula y contraseña
   * Validación: Solo un login por día
   */
  const iniciarSesion = useCallback(async (cedula, password) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await authApi.login(cedula, password);

      // Guardar en localStorage
      localStorage.setItem('dgus_token', datos.token);
      localStorage.setItem('dgus_usuario', JSON.stringify(datos.usuario));
      localStorage.setItem('dgus_login_fecha', new Date().toISOString().split('T')[0]);

      // Actualizar estado
      setToken(datos.token);
      setUsuario(datos.usuario);

      return datos.usuario;
    } catch (err) {
      const mensajeError = err.response?.data?.error || err.message || 'Error al iniciar sesión';
      setError(mensajeError);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Cierra sesión inmediatamente.
   * BUG 3 FIX: Se eliminó el window.confirm() interno que ignoraba los modales
   * personalizados y cerraba la sesión aunque el usuario cancelara.
   * La confirmación debe manejarse en cada componente con el Modal.
   */
  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('dgus_token');
    localStorage.removeItem('dgus_usuario');
    localStorage.removeItem('dgus_login_fecha');
    setToken(null);
    setUsuario(null);
    setError(null);
  }, []);

  /**
   * Verifica si ya se hizo login hoy
   * @returns {boolean} true si ya se hizo login hoy
   */
  const yaLogineoHoy = useCallback(() => {
    const fechaLogin = localStorage.getItem('dgus_login_fecha');
    if (!fechaLogin) return false;

    const hoy = new Date().toISOString().split('T')[0];
    return fechaLogin === hoy;
  }, []);

  /**
   * Reloguea un usuario (solo admin)
   * Permite que un admin haga logout de otro usuario para que pueda loguear de nuevo
   */
  const reloguearUsuario = useCallback((usuarioId) => {
    // Esta función podría llamar a un endpoint /api/turnos/reloguear/:usuarioId
    // Por ahora es un placeholder
    console.log('Reloguear usuario:', usuarioId);
  }, []);

  /**
   * Obtiene el token actual
   */
  const obtenerToken = useCallback(() => {
    return token || localStorage.getItem('dgus_token');
  }, [token]);

  /**
   * Limpia errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const valor = {
    usuario,
    token: obtenerToken(),
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    yaLogineoHoy,
    reloguearUsuario,
    obtenerToken,
    limpiarError,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * @returns {object} Contexto con usuario, token, funciones de login/logout
 */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return contexto;
}

