// ============================================================
// Funciones de la API: Usuarios (solo administradores)
// ============================================================

import api from './axios';

export async function listarUsuarios() {
  const respuesta = await api.get('/usuarios');
  return respuesta.data;
}

export async function crearUsuario(datos) {
  const respuesta = await api.post('/usuarios', datos);
  return respuesta.data;
}
