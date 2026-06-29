// ============================================================
// Dashboard DGUS v1.1
// ============================================================

import { Link } from 'react-router-dom';
import BarraNavegacion from '../components/BarraNavegacion';
import PanelControlTurno from '../components/PanelControlTurno';
import HorarioSemanal from '../components/HorarioSemanal';
import Tarjeta from '../components/Tarjeta';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  const fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-carbon-50">
      <BarraNavegacion />

      <main className="max-w-7xl mx-auto p-8">

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-carbon-900">
            ¡Hola, {usuario?.nombre?.split(' ')[0]} 👋
          </h1>

          <p className="text-carbon-400 mt-2">
            {fecha}
          </p>
        </div>

        {/* Tarjetas superiores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <Tarjeta>
            <p className="text-carbon-400 text-sm">
              Campaña
            </p>

            <h2 className="text-2xl font-bold text-dangerus-600 mt-2">
              {usuario?.campana || 'Sin asignar'}
            </h2>
          </Tarjeta>

          <Tarjeta>
            <p className="text-carbon-400 text-sm">
              Rol
            </p>

            <h2 className="text-2xl font-bold text-carbon-800 mt-2 capitalize">
              {usuario?.rol}
            </h2>
          </Tarjeta>

          <Tarjeta>
            <p className="text-carbon-400 text-sm">
              Estado
            </p>

            <h2 className="text-2xl font-bold text-green-600 mt-2">
              Disponible
            </h2>
          </Tarjeta>

        </div>

        {/* Panel Administrador */}
        {usuario?.rol === 'administrador' && (
          <div className="flex flex-wrap gap-3 mb-8">

            <Link
              to="/admin/usuarios"
              className="bg-dangerus-500 hover:bg-dangerus-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              👤 Usuarios
            </Link>

            <Link
              to="/admin/mallas"
              className="bg-dangerus-500 hover:bg-dangerus-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              📅 Mallas
            </Link>

            <Link
              to="/admin/reportes"
              className="bg-dangerus-500 hover:bg-dangerus-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              📊 Reportes
            </Link>

            <Link
              to="/admin/reactivar"
              className="bg-dangerus-500 hover:bg-dangerus-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              🔄 Reactivar
            </Link>

          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">

          <div className="lg:col-span-2">
            <PanelControlTurno />
          </div>

          <div className="lg:col-span-3">
            <HorarioSemanal />
          </div>

        </div>

      </main>
    </div>
  );
}