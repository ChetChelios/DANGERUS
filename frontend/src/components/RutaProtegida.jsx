// ============================================================
// Componente: RutaProtegida
// ============================================================
// Envuelve páginas que requieren que el usuario haya iniciado
// sesión. Si no hay sesión, lo redirige automáticamente al login.
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && usuario.rol !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
