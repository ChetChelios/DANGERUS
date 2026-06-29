// ============================================================
// Componente: Barra de Navegación Premium DGUS
// ============================================================

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Boton from './Boton';

export default function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navegar('/login');
  }

  const fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-carbon-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-dangerus-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            D
          </div>

          <div>
            <h1 className="font-display text-xl font-bold text-dangerus-600">
              DGUS
            </h1>

            <p className="text-xs text-carbon-400">
              Control Inteligente de Turnos
            </p>
          </div>
        </div>

        {/* Información usuario */}
        <div className="flex items-center gap-5">

          <div className="hidden lg:block text-right">
            <p className="text-xs text-carbon-400 capitalize">
              {fecha}
            </p>

            <p className="font-semibold text-carbon-800">
              {usuario?.nombre}
            </p>

            <p className="text-sm text-dangerus-600 capitalize">
              {usuario?.rol}
            </p>
          </div>

          <Boton
            variante="fantasma"
            onClick={manejarCerrarSesion}
          >
            Cerrar sesión
          </Boton>

        </div>

      </div>
    </header>
  );
}