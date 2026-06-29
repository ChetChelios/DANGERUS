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

  // Modal de edición
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [enviandoEdit, setEnviandoEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  // Modal confirmación eliminar
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

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

  useEffect(() => { cargarUsuarios(); }, []);

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

  function abrirEdicion(u) {
    setUsuarioEditando(u);
    setFormEdit({ nombre: u.nombre, rol: u.rol, supervisor: u.supervisor || '', activo: u.activo });
    setErrorEdit('');
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setEnviandoEdit(true);
    setErrorEdit('');
    try {
      await usuarioApi.actualizarUsuario(usuarioEditando.id, formEdit);
      setUsuarioEditando(null);
      await cargarUsuarios();
    } catch (err) {
      setErrorEdit(err.response?.data?.error || 'No se pudo actualizar el usuario.');
    } finally {
      setEnviandoEdit(false);
    }
  }

  async function confirmarEliminar() {
    setEliminando(true);
    try {
      await usuarioApi.eliminarUsuario(usuarioAEliminar.id);
      setUsuarioAEliminar(null);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el usuario.');
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
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
          {/* Formulario crear usuario */}
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

          {/* Lista de usuarios */}
          <div className="lg:col-span-3">
            <Tarjeta titulo="Usuarios registrados">
              {cargando && <p className="text-sm text-carbon-400">Cargando usuarios...</p>}
              {!cargando && (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="text-left text-carbon-400 border-b border-carbon-100">
                        <th className="py-2 px-2 font-medium">Nombre</th>
                        <th className="py-2 px-2 font-medium">Cédula</th>
                        <th className="py-2 px-2 font-medium">Rol</th>
                        <th className="py-2 px-2 font-medium">Estado</th>
                        <th className="py-2 px-2 font-medium">Acciones</th>
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
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => abrirEdicion(u)}
                                className="text-xs text-dangerus-600 hover:text-dangerus-800 font-medium underline underline-offset-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setUsuarioAEliminar(u)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2"
                              >
                                Eliminar
                              </button>
                            </div>
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

      {/* Modal: Editar usuario */}
      {usuarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="font-display font-bold text-lg text-carbon-900 mb-4">
              Editar usuario — {usuarioEditando.nombre}
            </h2>
            <form onSubmit={guardarEdicion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-1.5">Nombre completo</label>
                <input
                  type="text" required value={formEdit.nombre}
                  onChange={(e) => setFormEdit((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-1.5">Rol</label>
                <select
                  value={formEdit.rol}
                  onChange={(e) => setFormEdit((f) => ({ ...f, rol: e.target.value }))}
                  className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                >
                  <option value="empleado">Empleado</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-1.5">Supervisor</label>
                <input
                  type="text" value={formEdit.supervisor}
                  onChange={(e) => setFormEdit((f) => ({ ...f, supervisor: e.target.value }))}
                  className="w-full rounded-lg border border-carbon-200 px-4 py-2.5 text-sm focus:border-dangerus-400 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-carbon-700">Estado</label>
                <button
                  type="button"
                  onClick={() => setFormEdit((f) => ({ ...f, activo: !f.activo }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formEdit.activo ? 'bg-dangerus-500' : 'bg-carbon-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    formEdit.activo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm text-carbon-600">{formEdit.activo ? 'Activo' : 'Inactivo'}</span>
              </div>

              {errorEdit && <p className="text-sm text-red-600">{errorEdit}</p>}

              <div className="flex gap-3 pt-2">
                <Boton type="submit" variante="primario" fullWidth disabled={enviandoEdit}>
                  {enviandoEdit ? 'Guardando...' : 'Guardar cambios'}
                </Boton>
                <Boton type="button" variante="fantasma" fullWidth onClick={() => setUsuarioEditando(null)}>
                  Cancelar
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h2 className="font-display font-bold text-carbon-900 text-lg mb-1">¿Eliminar usuario?</h2>
            <p className="text-sm text-carbon-500 mb-6">
              Se eliminará permanentemente a <strong>{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.cedula}). Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setUsuarioAEliminar(null)}
                className="flex-1 py-2.5 rounded-xl border border-carbon-200 text-carbon-700 text-sm font-semibold hover:bg-carbon-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
