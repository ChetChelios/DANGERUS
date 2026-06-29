// ============================================================
// Página: Administración de usuarios (solo administradores)
// ============================================================

import { useEffect, useState } from 'react';
import BarraNavegacion from '../components/BarraNavegacion';
import Tarjeta from '../components/Tarjeta';
import Boton from '../components/Boton';
import * as usuarioApi from '../api/usuarioApi';

const ESTADO_INICIAL_FORM = {
  cedula: '', nombre: '', password: '', rol: 'empleado', supervisor: '',
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  async function cargarUsuarios() {
    setCargando(true);
    try {
      const datos = await usuarioApi.listarUsuarios();
      setUsuarios(datos.usuarios);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function manejarCambio(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setEnviando(true);
    try {
      await usuarioApi.crearUsuario(form);
      setMensajeExito(`Usuario "${form.nombre}" creado con éxito.`);
      setForm(ESTADO_INICIAL_FORM);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el usuario.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-carbon-50">
      <BarraNavegacion />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-carbon-800 mb-6">
          Administración de usuarios
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Formulario para crear un nuevo usuario */}
          <div className="lg:col-span-2">
            <Tarjeta titulo="Crear nuevo usuario">
              <form onSubmit={manejarSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-carbon-700 mb-1.5">Cédula</label>
                  <input
                    type="text" required value={form.cedula}
                    onChange={(e) => manejarCambio('cedula', e.target.value)}
                    className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 mb-1.5">Nombre completo</label>
                  <input
                    type="text" required value={form.nombre}
                    onChange={(e) => manejarCambio('nombre', e.target.value)}
                    className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 mb-1.5">Contraseña temporal</label>
                  <input
                    type="text" required value={form.password}
                    onChange={(e) => manejarCambio('password', e.target.value)}
                    className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 mb-1.5">Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => manejarCambio('rol', e.target.value)}
                    className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                  >
                    <option value="empleado">Empleado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 mb-1.5">Supervisor (opcional)</label>
                  <input
                    type="text" value={form.supervisor}
                    onChange={(e) => manejarCambio('supervisor', e.target.value)}
                    className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {mensajeExito && <p className="text-sm text-green-600">{mensajeExito}</p>}

                <Boton type="submit" variante="primario" fullWidth disabled={enviando}>
                  {enviando ? 'Creando...' : 'Crear usuario'}
                </Boton>
              </form>
            </Tarjeta>
          </div>

          {/* Lista de usuarios existentes */}
          <div className="lg:col-span-3">
            <Tarjeta titulo="Usuarios registrados">
              {cargando && <p className="text-sm text-carbon-400">Cargando usuarios...</p>}
              {!cargando && (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="text-left text-carbon-400 border-b border-carbon-100">
                        <th className="py-2 px-2 font-medium">Nombre</th>
                        <th className="py-2 px-2 font-medium">Cédula</th>
                        <th className="py-2 px-2 font-medium">Rol</th>
                        <th className="py-2 px-2 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id} className="border-b border-carbon-50 last:border-0">
                          <td className="py-2.5 px-2 font-medium text-carbon-700">{u.nombre}</td>
                          <td className="py-2.5 px-2 font-mono text-carbon-500">{u.cedula}</td>
                          <td className="py-2.5 px-2 capitalize">{u.rol}</td>
                          <td className="py-2.5 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.activo ? 'bg-green-100 text-green-700' : 'bg-carbon-200 text-carbon-600'
                            }`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tarjeta>
          </div>
        </div>
      </main>
    </div>
  );
}
