import api from './axios';

export async function crearSolicitud(datos) {
  const { data } = await api.post('/solicitudes', datos);
  return data;
}
export async function misSolicitudes() {
  const { data } = await api.get('/solicitudes/mis');
  return data;
}
export async function solicitudesParaRevisar() {
  const { data } = await api.get('/solicitudes/revisar');
  return data;
}
export async function responderSolicitud(id, estado, respuesta) {
  const { data } = await api.put(`/solicitudes/${id}/responder`, { estado, respuesta });
  return data;
}
