import api from './axios';

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}
// BUG 1 FIX: endpoint para listar campañas disponibles
export async function listarCampanas() {
  const { data } = await api.get('/usuarios/campanas');
  return data;
}
export async function crearUsuario(datos) {
  const { data } = await api.post('/usuarios', datos);
  return data;
}
export async function actualizarUsuario(id, datos) {
  const { data } = await api.put(`/usuarios/${id}`, datos);
  return data;
}
export async function exportarUsuariosExcel() {
  const response = await api.get('/usuarios/exportar', { responseType: 'blob' });
  return response.data;
}
