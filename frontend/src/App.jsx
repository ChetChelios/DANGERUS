// ============================================================
// Componente raíz: define las rutas de toda la aplicación
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminMallas from './pages/AdminMallas';
import AdminReportes from './pages/AdminReportes';

function RutaInicial() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RutaInicial />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <RutaProtegida soloAdmin>
                <AdminUsuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/mallas"
            element={
              <RutaProtegida soloAdmin>
                <AdminMallas />
              </RutaProtegida>
            }
          />

<Route
  path="/admin/reportes"
  element={
    <RutaProtegida soloAdmin>
      <AdminReportes />
    </RutaProtegida>
  }
/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}