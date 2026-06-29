// ============================================================
// Funciones de la API: Mallas (horario semanal)
// ============================================================

import api from './axios';

export async function obtenerMiMalla(semanaInicio) {
  const respuesta = await api.get('/mallas/mia', { params: { semanaInicio } });
  return respuesta.data;
}
