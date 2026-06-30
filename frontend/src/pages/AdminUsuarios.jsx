// ============================================================
// AdminUsuarios v3.1 — Campaña alfanumérica, supervisor opcional
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import * as usuarioApi from '../api/usuarioApi';

// FIX 1: campanaId acepta texto (nombre de campaña), supervisor opcional
const FORM_INICIAL = { cedula:'', nombre:'', password:'', rol:'empleado', supervisor:'', campanaId:'' };
const inputCls = "w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm text-carbon-800 focus:border-dangerus-400 focus:ring-2 focus:ring-dangerus-100 outline-none transition-all";

function Campo({ label, req, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">
        {label}{req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const Ico = {
  download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  x:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

export default function AdminUsuarios() {
  const { cerrarSesion } = useAuth();
  const navegar = useNavigate();

  // ── Estado ──────────────────────────────────────────────────
  const [usuarios,   setUsuarios]   = useState([]);
  const [campanas,   setCampanas]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [form,       setForm]       = useState(FORM_INICIAL);
  const [enviando,   setEnviando]   = useState(false);
  const [error,      setError]      = useState('');
  const [exito,      setExito]      = useState('');
  const [editando,   setEditando]   = useState(null);
  const [formEdit,   setFormEdit]   = useState({});
  const [guardando,  setGuardando]  = useState(false);
  const [filtro,     setFiltro]     = useState('todos');
  const [exportando, setExportando] = useState(false);

  // ── Carga inicial ────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [ud, camps] = await Promise.all([
        usuarioApi.listarUsuarios(),
        usuarioApi.listarCampanas(),
      ]);
      setUsuarios(ud.usuarios || []);
      setCampanas(camps.campanas || []);
    } catch { setError('No se pudo cargar la lista.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Helpers ──────────────────────────────────────────────────
  function setF(campo, val)  { setForm(f     => ({ ...f, [campo]: val })); }
  function setFE(campo, val) { setFormEdit(f => ({ ...f, [campo]: val })); }

  // ── Crear usuario ────────────────────────────────────────────
  async function crear(e) {
    e.preventDefault();
    setError(''); setExito('');
    if (!form.campanaId) { setError('La campaña es obligatoria.'); return; }
    setEnviando(true);
    try {
      await usuarioApi.crearUsuario(form);
      setExito(`Usuario "${form.nombre}" creado.`);
      setForm(FORM_INICIAL);
      await cargar();
    } catch(err) { setError(err.response?.data?.error || 'Error creando usuario.'); }
    finally { setEnviando(false); }
  }

  // ── Guardar edición ──────────────────────────────────────────
  async function guardarEdicion() {
    setGuardando(true); setError('');
    try {
      await usuarioApi.actualizarUsuario(editando.id, {
        nombre:    formEdit.nombre,
        rol:       formEdit.rol,
        supervisor:formEdit.supervisor,
        campanaId: formEdit.campanaId,
        activo:    formEdit.activo,
        ...(formEdit.password ? { password: formEdit.password } : {}),
      });
      setExito('Usuario actualizado.');
      setEditando(null);
      await cargar();
    } catch(err) { setError(err.response?.data?.error || 'Error actualizando.'); }
    finally { setGuardando(false); }
  }

  // ── Toggle activo ────────────────────────────────────────────
  async function toggleActivo(u) {
    try {
      await usuarioApi.actualizarUsuario(u.id, { activo: !u.activo });
      setExito(`Usuario ${u.activo ? 'desactivado' : 'reactivado'}.`);
      await cargar();
    } catch { setError('No se pudo cambiar el estado.'); }
  }

  // ── Exportar Excel ───────────────────────────────────────────
  async function exportar() {
    setExportando(true);
    try {
      const blob = await usuarioApi.exportarUsuariosExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'usuarios-dgus.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Error exportando. Verifica el backend.'); }
    finally { setExportando(false); }
  }

  // ── Abrir edición ────────────────────────────────────────────
  function abrirEdicion(u) {
    setEditando(u);
    setFormEdit({
      nombre:    u.nombre,
      rol:       u.rol,
      supervisor:u.supervisor || '',
      campanaId: u.campana_nombre || u.campana_id || '',
      password:  '',
      activo:    u.activo,
    });
    setError('');
  }

  // ── Derivados ────────────────────────────────────────────────
  const filtrados = usuarios.filter(u =>
    filtro === 'todos' ? true : filtro === 'activos' ? u.activo : !u.activo
  );
  const activos   = usuarios.filter(u => u.activo).length;
  const inactivos = usuarios.filter(u => !u.activo).length;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-56 p-6">
        <div className="max-w-5xl space-y-5">

          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-carbon-900">Usuarios</h1>
              <p className="text-carbon-400 text-sm mt-0.5">Gestiona empleados, supervisores y administradores.</p>
            </div>
            <button onClick={exportar} disabled={exportando}
              className="flex items-center gap-2 border border-carbon-200 hover:bg-carbon-50 text-carbon-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              <Ico.download /> {exportando ? 'Exportando...' : 'Descargar Excel'}
            </button>
          </div>

          {/* Feedback */}
          {exito && (
            <div className="bg-dangerus-50 border border-dangerus-200 text-dangerus-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              {exito}<button onClick={() => setExito('')}>✕</button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              {error}<button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Total usuarios', valor: usuarios.length, color:'text-carbon-900' },
              { label:'Activos',        valor: activos,         color:'text-dangerus-600' },
              { label:'Inactivos',      valor: inactivos,       color: inactivos > 0 ? 'text-red-500' : 'text-carbon-400' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-carbon-100 p-4">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{m.label}</p>
                <p className={`font-display font-bold text-2xl mt-1 ${m.color}`}>{m.valor}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-5">

            {/* Formulario crear */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-carbon-100 p-5">
              <h2 className="font-semibold text-carbon-900 mb-4">Crear usuario</h2>
              <form onSubmit={crear} className="space-y-3.5">
                <Campo label="Cédula" req>
                  <input required value={form.cedula} onChange={e => setF('cedula', e.target.value)} placeholder="1234567890" className={inputCls}/>
                </Campo>
                <Campo label="Nombre completo" req>
                  <input required value={form.nombre} onChange={e => setF('nombre', e.target.value)} placeholder="Juan Pérez" className={inputCls}/>
                </Campo>
                <Campo label="Contraseña temporal" req>
                  <input required value={form.password} onChange={e => setF('password', e.target.value)} placeholder="Temporal123" className={inputCls}/>
                </Campo>
                <Campo label="Rol" req>
                  <select value={form.rol} onChange={e => setF('rol', e.target.value)} className={inputCls}>
                    <option value="empleado">Empleado</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </Campo>
                {/* FIX 1: acepta nombre alfanumérico de campaña, con sugerencias */}
                <Campo label="Campaña" req>
                  <input
                    list="campanas-lista"
                    value={form.campanaId}
                    onChange={e => setF('campanaId', e.target.value)}
                    placeholder="Nombre de campaña (ej: Ventas-2026)"
                    className={inputCls}
                  />
                  <datalist id="campanas-lista">
                    {campanas.map(c => <option key={c.id} value={c.nombre}/>)}
                  </datalist>
                </Campo>
                {/* FIX 1: supervisor ya no es obligatorio */}
                <Campo label="Supervisor">
                  <input value={form.supervisor} onChange={e => setF('supervisor', e.target.value)} placeholder="Nombre del supervisor (opcional)" className={inputCls}/>
                </Campo>
                <button type="submit" disabled={enviando} className="w-full bg-dangerus-500 hover:bg-dangerus-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                  {enviando ? 'Creando...' : 'Crear usuario'}
                </button>
              </form>
            </div>

            {/* Tabla usuarios */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-carbon-900">
                  Usuarios registrados
                  <span className="ml-2 text-xs font-normal text-carbon-400 bg-carbon-100 px-2 py-0.5 rounded-full">{filtrados.length}</span>
                </h2>
                <div className="flex gap-1 bg-carbon-100 rounded-lg p-0.5">
                  {['todos','activos','inactivos'].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${filtro === f ? 'bg-white text-carbon-800 shadow-sm' : 'text-carbon-500'}`}>{f}</button>
                  ))}
                </div>
              </div>

              {cargando ? (
                <div className="space-y-2">{Array.from({length:4}).map((_,i) => <div key={i} className="h-12 bg-carbon-100 rounded-xl animate-pulse"/>)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-carbon-100">
                        {['Nombre','Cédula','Rol','Campaña','Estado',''].map(h => (
                          <th key={h} className="pb-2.5 text-left text-[10px] font-semibold text-carbon-400 uppercase tracking-wider pr-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(u => (
                        <tr key={u.id} className="border-b border-carbon-50 last:border-0 hover:bg-carbon-50/50 transition-colors">
                          <td className="py-3 pr-2">
                            <p className="font-medium text-carbon-800 text-xs">{u.nombre}</p>
                            {u.supervisor && <p className="text-[10px] text-carbon-400">Sup: {u.supervisor}</p>}
                          </td>
                          <td className="py-3 pr-2 font-mono text-carbon-500 text-xs">{u.cedula}</td>
                          <td className="py-3 pr-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.rol==='administrador'?'bg-purple-100 text-purple-700':u.rol==='supervisor'?'bg-blue-100 text-blue-700':'bg-carbon-100 text-carbon-600'}`}>{u.rol}</span>
                          </td>
                          <td className="py-3 pr-2 text-carbon-500 text-xs">{u.campana_nombre || '—'}</td>
                          <td className="py-3 pr-2">
                            <span className={`w-2 h-2 rounded-full inline-block mr-1 ${u.activo ? 'bg-dangerus-400' : 'bg-carbon-300'}`}/>
                            <span className={`text-xs font-medium ${u.activo ? 'text-dangerus-700' : 'text-carbon-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => abrirEdicion(u)} className="p-1.5 rounded-lg hover:bg-dangerus-50 text-carbon-400 hover:text-dangerus-600 transition-colors"><Ico.edit/></button>
                              <button onClick={() => toggleActivo(u)} className={`p-1.5 rounded-lg transition-colors ${u.activo ? 'hover:bg-red-50 text-carbon-400 hover:text-red-600' : 'hover:bg-dangerus-50 text-carbon-400 hover:text-dangerus-600'}`}>
                                {u.activo ? <Ico.x/> : <Ico.check/>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtrados.length === 0 && (
                        <tr><td colSpan="6" className="py-8 text-center text-carbon-400 text-sm">Sin usuarios {filtro !== 'todos' ? filtro : ''}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal edición */}
      {editando && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-100">
              <h2 className="font-semibold text-carbon-900">Editar: {editando.nombre}</h2>
              <button onClick={() => setEditando(null)} className="text-carbon-400 hover:text-carbon-700">✕</button>
            </div>
            <div className="p-6 space-y-3.5">
              <Campo label="Nombre" req>
                <input value={formEdit.nombre} onChange={e => setFE('nombre', e.target.value)} className={inputCls}/>
              </Campo>
              <Campo label="Rol" req>
                <select value={formEdit.rol} onChange={e => setFE('rol', e.target.value)} className={inputCls}>
                  <option value="empleado">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </Campo>
              {/* FIX 1: acepta nombre alfanumérico con sugerencias */}
              <Campo label="Campaña" req>
                <input
                  list="campanas-lista-edit"
                  value={formEdit.campanaId}
                  onChange={e => setFE('campanaId', e.target.value)}
                  placeholder="Nombre de campaña (ej: Ventas-2026)"
                  className={inputCls}
                />
                <datalist id="campanas-lista-edit">
                  {campanas.map(c => <option key={c.id} value={c.nombre}/>)}
                </datalist>
              </Campo>
              {/* FIX 1: supervisor opcional */}
              <Campo label="Supervisor">
                <input value={formEdit.supervisor} onChange={e => setFE('supervisor', e.target.value)} placeholder="Nombre del supervisor (opcional)" className={inputCls}/>
              </Campo>
              <Campo label="Nueva contraseña (vacío = sin cambio)">
                <input type="password" value={formEdit.password} onChange={e => setFE('password', e.target.value)} placeholder="••••••••" className={inputCls}/>
              </Campo>
              <Campo label="Estado">
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <label key={String(v)} className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${formEdit.activo === v ? 'border-dangerus-400 bg-dangerus-50' : 'border-carbon-200 hover:bg-carbon-50'}`}>
                      <input type="radio" checked={formEdit.activo === v} onChange={() => setFE('activo', v)} className="accent-dangerus-500"/>
                      <span className="text-sm font-medium">{v ? 'Activo' : 'Inactivo'}</span>
                    </label>
                  ))}
                </div>
              </Campo>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditando(null)} className="flex-1 py-2.5 rounded-xl border border-carbon-200 text-sm font-medium text-carbon-600 hover:bg-carbon-50">Cancelar</button>
                <button onClick={guardarEdicion} disabled={guardando} className="flex-1 py-2.5 rounded-xl bg-dangerus-500 hover:bg-dangerus-600 text-white text-sm font-semibold disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
