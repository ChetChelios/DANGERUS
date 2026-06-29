// ============================================================
// Página: Login DGUS v1.1
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Boton from '../components/Boton';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { iniciarSesion, cargando } = useAuth();
  const navegar = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      await iniciarSesion(cedula, password);
      navegar('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'No fue posible iniciar sesión.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-carbon-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-xl border border-carbon-100 p-10">

          <div className="flex justify-center mb-6">

            <div className="w-20 h-20 rounded-3xl bg-dangerus-500 flex items-center justify-center shadow-lg">

              <span className="text-white text-3xl font-bold">
                D
              </span>

            </div>

          </div>

          <h1 className="text-center text-3xl font-bold text-dangerus-600">
            DGUS
          </h1>

          <p className="text-center text-carbon-400 mt-2 mb-8">
            Control Inteligente de Turnos
          </p>

          <form
            onSubmit={manejarSubmit}
            className="space-y-5"
          >

            <div>

              <label className="block mb-2 font-medium text-carbon-700">
                Cédula
              </label>

              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="
                w-full
                rounded-xl
                border
                border-carbon-200
                px-4
                py-3
                focus:border-dangerus-500
                focus:ring-2
                focus:ring-dangerus-100
                outline-none
                transition-all"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium text-carbon-700">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                w-full
                rounded-xl
                border
                border-carbon-200
                px-4
                py-3
                focus:border-dangerus-500
                focus:ring-2
                focus:ring-dangerus-100
                outline-none
                transition-all"
              />

            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              fullWidth
              disabled={cargando}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Boton>

          </form>

        </div>

        <p className="text-center text-xs text-carbon-400 mt-6">
          DGUS © 2026 · Sistema Inteligente de Gestión de Turnos
        </p>

      </div>

    </div>
  );
}