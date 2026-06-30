// ============================================================
// MisReportes — Solicitudes de ausencia del empleado
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import * as solicitudApi from '../api/solicitudApi';

const TIPOS = ['ausencia','vacaciones','permiso médico','calamidad','permiso personal'];
const ESTADO_BADGE = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  aprobada:   'bg-dangerus-100 text-dangerus-700',
  rechazada:  'bg-red-100 text-red-700',
};

export default function MisReportes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fechaInicio: '', fechaFin: '', tipo: 'ausencia', motivo: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [verDetalle, setVerDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const d = await solicitudApi.misSolicitudes();
      setSolicitudes(d.solicitudes || []);
    } catch { setSolicitudes([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function enviar(e) {
    e.preventDefault();
    if (!form.fechaInicio || !form.fechaFin) { setError('Las fechas son obligatorias.'); return; }
    setEnviando(true); setError('');
    try {
      await solicitudApi.crearSolicitud(form);
      setExito('Solicitud enviada. Tu supervisor la revisará pronto.');
      setModal(false);
      setForm({ fechaInicio: '', fechaFin: '', tipo: 'ausencia', motivo: '' });
      await cargar();
    } catch(err) {
      setError(err.response?.data?.error || 'No se pudo enviar la solicitud.');
    } finally { setEnviando(false); }
  }

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const aprobadas  = solicitudes.filter(s => s.estado === 'aprobada').length;

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-56 p-6">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-carbon-900">Mis Reportes</h1>
              <p className="text-carbon-400 text-sm mt-0.5">Solicitudes de ausencia y permisos</p>
            </div>
            <button
              onClick={() => { setModal(true); setError(''); }}
              className="flex items-center gap-2 bg-dangerus-500 hover:bg-dangerus-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              + Nueva solicitud
            </button>
          </div>

          {exito && (
            <div className="bg-dangerus-50 border border-dangerus-200 text-dangerus-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              {exito} <button onClick={() => setExito('')}>✕</button>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', valor: solicitudes.length },
              { label: 'Pendientes', valor: pendientes, color: pendientes > 0 ? 'text-yellow-600' : '' },
              { label: 'Aprobadas', valor: aprobadas, color: aprobadas > 0 ? 'text-dangerus-600' : '' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-carbon-100 p-4">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{m.label}</p>
                <p className={`font-display font-bold text-2xl mt-1 ${m.color || 'text-carbon-900'}`}>{m.valor}</p>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <h2 className="font-semibold text-carbon-900 mb-4 text-sm">Historial de solicitudes</h2>
            {cargando ? (
              <div className="space-y-2">
                {Array.from({length:3}).map((_,i) => <div key={i} className="h-14 bg-carbon-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-carbon-400 text-sm">No tienes solicitudes aún.</p>
                <button onClick={() => setModal(true)} className="mt-3 text-dangerus-500 text-sm font-medium hover:text-dangerus-600">
                  Crear tu primera solicitud →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {solicitudes.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-carbon-100 hover:bg-carbon-50 transition-colors cursor-pointer"
                    onClick={() => setVerDetalle(s)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-carbon-800 capitalize">{s.tipo}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[s.estado]}`}>{s.estado}</span>
                      </div>
                      <p className="text-xs text-carbon-500 mt-0.5">
                        {new Date(s.fecha_inicio + 'T12:00:00').toLocaleDateString('es-CO')} — {new Date(s.fecha_fin + 'T12:00:00').toLocaleDateString('es-CO')}
                        {s.supervisor_nombre && ` · Sup: ${s.supervisor_nombre}`}
                      </p>
                    </div>
                    <span className="text-carbon-300 text-xs">{new Date(s.creado_en).toLocaleDateString('es-CO')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nueva solicitud */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-100">
              <h2 className="font-semibold text-carbon-900">Solicitar ausencia / permiso</h2>
              <button onClick={() => setModal(false)} className="text-carbon-400 hover:text-carbon-700">✕</button>
            </div>
            <form onSubmit={enviar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Tipo</label>
                <select value={form.tipo} onChange={e => setForm(f=>({...f,tipo:e.target.value}))}
                  className="w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm outline-none focus:border-dangerus-400 focus:ring-2 focus:ring-dangerus-100">
                  {TIPOS.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Desde</label>
                  <input type="date" required value={form.fechaInicio} onChange={e => setForm(f=>({...f,fechaInicio:e.target.value}))}
                    className="w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm outline-none focus:border-dangerus-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Hasta</label>
                  <input type="date" required value={form.fechaFin} onChange={e => setForm(f=>({...f,fechaFin:e.target.value}))}
                    min={form.fechaInicio}
                    className="w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm outline-none focus:border-dangerus-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Motivo</label>
                <textarea value={form.motivo} onChange={e => setForm(f=>({...f,motivo:e.target.value}))}
                  placeholder="Describe el motivo de tu solicitud..."
                  rows={3} className="w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm outline-none focus:border-dangerus-400 resize-none" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-carbon-200 text-sm font-medium text-carbon-600 hover:bg-carbon-50">
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="flex-1 py-2.5 rounded-xl bg-dangerus-500 hover:bg-dangerus-600 text-white text-sm font-semibold disabled:opacity-50">
                  {enviando ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ver detalle */}
      {verDetalle && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-100">
              <h2 className="font-semibold text-carbon-900">Detalle de solicitud</h2>
              <button onClick={() => setVerDetalle(null)} className="text-carbon-400 hover:text-carbon-700">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-carbon-900 capitalize">{verDetalle.tipo}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[verDetalle.estado]}`}>{verDetalle.estado}</span>
              </div>
              <div className="bg-carbon-50 rounded-xl p-3 space-y-1 text-sm">
                <p className="text-carbon-600">Desde: <strong>{new Date(verDetalle.fecha_inicio+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</strong></p>
                <p className="text-carbon-600">Hasta: <strong>{new Date(verDetalle.fecha_fin+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</strong></p>
                {verDetalle.motivo && <p className="text-carbon-600">Motivo: {verDetalle.motivo}</p>}
                {verDetalle.supervisor_nombre && <p className="text-carbon-600">Supervisor: <strong>{verDetalle.supervisor_nombre}</strong></p>}
              </div>
              {verDetalle.respuesta_supervisor && (
                <div className={`rounded-xl p-3 text-sm ${verDetalle.estado === 'aprobada' ? 'bg-dangerus-50 border border-dangerus-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-carbon-500">Respuesta del supervisor</p>
                  <p className="text-carbon-700">{verDetalle.respuesta_supervisor}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
