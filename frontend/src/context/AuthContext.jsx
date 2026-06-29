// ============================================================
// Contexto de Autenticación
// ============================================================
// Este contexto guarda quién es el usuario logueado y lo hace
// disponible para cualquier componente de la aplicación, sin tener
// que pasarlo manualmente de componente en componente ("prop drilling").
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('dgus_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = useCallback(async (cedula, password) => {
    setCargando(true);
    try {
      const datos = await authApi.login(cedula, password);
      localStorage.setItem('dgus_token', datos.token);
      localStorage.setItem('dgus_usuario', JSON.stringify(datos.usuario));
      setUsuario(datos.usuario);
      return datos.usuario;
    } finally {
      setCargando(false);
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('dgus_token');
    localStorage.removeItem('dgus_usuario');
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return contexto;
}
