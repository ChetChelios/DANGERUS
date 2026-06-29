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

export async function actualizarUsuario(id, datos) {
  const respuesta = await api.put(`/usuarios/${id}`, datos);
  return respuesta.data;
}

export async function eliminarUsuario(id) {
  const respuesta = await api.delete(`/usuarios/${id}`);
  return respuesta.data;
}
