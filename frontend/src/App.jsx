import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MiHorario from './pages/MiHorario';
import MisReportes from './pages/MisReportes';
import SupervisorSolicitudes from './pages/SupervisorSolicitudes';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminMallas from './pages/AdminMallas';
import AdminReportes from './pages/AdminReportes';

function RutaInicial() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? '/dashboard' : '/login'} replace />;
}

function RutaAdmin({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'administrador') return <Navigate to="/dashboard" replace />;
  return children;
}

function RutaSupervisor({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!['administrador','supervisor'].includes(usuario.rol)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RutaInicial />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/mi-horario" element={<RutaProtegida><MiHorario /></RutaProtegida>} />
          <Route path="/mis-reportes" element={<RutaProtegida><MisReportes /></RutaProtegida>} />
          <Route path="/supervisor/solicitudes" element={<RutaSupervisor><SupervisorSolicitudes /></RutaSupervisor>} />
          <Route path="/admin/usuarios" element={<RutaAdmin><AdminUsuarios /></RutaAdmin>} />
          <Route path="/admin/mallas" element={<RutaAdmin><AdminMallas /></RutaAdmin>} />
          <Route path="/admin/reportes" element={<RutaSupervisor><AdminReportes /></RutaSupervisor>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
