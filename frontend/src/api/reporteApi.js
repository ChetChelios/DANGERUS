import api from './axios';

export async function obtenerReportes(filtros) {
  const { data } = await api.get('/reportes', { params: filtros });
  return data;
}

export async function exportarExcel(filtros) {
  const response = await api.get('/reportes/exportar', {
    params: filtros,
    responseType: 'blob',
  });
  return response.data;
}
