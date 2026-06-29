// ============================================================
// Componente: ModalConfirmarPassword
// ============================================================
// Cuando un empleado quiere REGRESAR de un break/almuerzo, debe
// confirmar su identidad escribiendo su contraseña de nuevo.
// Este modal se encarga de esa confirmación.
// ============================================================

import { useState } from 'react';
import Boton from './Boton';

export default function ModalConfirmarPassword({ titulo, onConfirmar, onCancelar, cargando, error }) {
  const [password, setPassword] = useState('');

  function manejarSubmit(e) {
    e.preventDefault();
    onConfirmar(password);
  }

  return (
    <div className="fixed inset-0 bg-carbon-900/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-display font-semibold text-lg text-carbon-800 mb-1">{titulo}</h3>
        <p className="text-sm text-carbon-400 mb-4">
          Por seguridad, confirma tu contraseña para continuar.
        </p>
        <form onSubmit={manejarSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm
                       focus:border-ambar-400 outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Boton type="button" variante="fantasma" fullWidth onClick={onCancelar}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario" fullWidth disabled={cargando || !password}>
              {cargando ? 'Verificando...' : 'Confirmar'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
