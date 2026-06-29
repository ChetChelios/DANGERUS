// ============================================================
// Funciones de la API: Autenticación
// ============================================================

import api from './axios';

export async function login(cedula, password) {
  const respuesta = await api.post('/auth/login', { cedula, password });
  return respuesta.data;
}

export async function obtenerPerfil() {
  const respuesta = await api.get('/auth/yo');
  return respuesta.data;
}

export async function verificarPassword(password) {
  const respuesta = await api.post('/auth/verificar-password', { password });
  return respuesta.data;
}
