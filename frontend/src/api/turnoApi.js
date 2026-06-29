// ============================================================
// Funciones de la API: Turnos (eventos de logueo, pausas, etc.)
// ============================================================

import api from './axios';

export async function obtenerEstadoActual() {
  const respuesta = await api.get('/turnos/estado');
  return respuesta.data;
}

export async function registrarEvento(tipoEvento, password) {
  const respuesta = await api.post('/turnos/evento', { tipoEvento, password });
  return respuesta.data;
}

export async function obtenerCalendario(desde, hasta) {
  const respuesta = await api.get('/turnos/calendario', { params: { desde, hasta } });
  return respuesta.data;
}
