// ============================================================
// Cliente HTTP (Axios) configurado para hablar con el backend
// ============================================================
// Todas las llamadas a la API pasan por aquí. Esto evita repetir
// la URL base y el manejo del token en cada archivo.
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Antes de cada petición, si hay un token guardado, lo añadimos
// automáticamente al header de autorización.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dgus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde con 401 (token inválido/expirado), forzamos
// el cierre de sesión en el frontend para que el usuario vuelva a entrar.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dgus_token');
      localStorage.removeItem('dgus_usuario');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
