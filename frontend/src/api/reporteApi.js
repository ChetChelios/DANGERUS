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

  // Disparar descarga en el navegador
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const fecha = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `reporte-dgus-${fecha}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
