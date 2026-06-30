// ============================================================
// SupervisorSolicitudes — Panel de solicitudes para supervisor/admin
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import * as solicitudApi from '../api/solicitudApi';

const ESTADO_BADGE = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  aprobada:  'bg-dangerus-100 text-dangerus-700',
  rechazada: 'bg-red-100 text-red-700',
};

export default function SupervisorSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [activa, setActiva] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('pendiente');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const d = await solicitudApi.solicitudesParaRevisar();
      setSolicitudes(d.solicitudes || []);
    } catch { setSolicitudes([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function responder(estado) {
    if (!activa) return;
    if (estado === 'rechazada' && !respuesta.trim()) { setError('Debes justificar el motivo del rechazo.'); return; }
    setProcesando(true); setError('');
    try {
      await solicitudApi.responderSolicitud(activa.id, estado, respuesta);
      setActiva(null); setRespuesta('');
      await cargar();
    } catch(err) {
      setError(err.response?.data?.error || 'Error respondiendo.');
    } finally { setProcesando(false); }
  }

  const filtradas = solicitudes.filter(s => filtro === 'todas' ? true : s.estado === filtro);
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">
      <Sidebar solicitudesPendientes={pendientes} />
      <div className="flex-1 lg:ml-56 p-6">
        <div className="max-w-4xl space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl text-carbon-900">Solicitudes de Ausencia</h1>
            <p className="text-carbon-400 text-sm mt-0.5">Revisa y responde las solicitudes de tu equipo.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pendientes', valor: solicitudes.filter(s=>s.estado==='pendiente').length, color: 'text-yellow-600' },
              { label: 'Aprobadas',  valor: solicitudes.filter(s=>s.estado==='aprobada').length,  color: 'text-dangerus-600' },
              { label: 'Rechazadas', valor: solicitudes.filter(s=>s.estado==='rechazada').length, color: 'text-red-600' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-carbon-100 p-4">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{m.label}</p>
                <p className={`font-display font-bold text-2xl mt-1 ${m.color}`}>{m.valor}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-1 bg-white border border-carbon-100 rounded-xl p-1 w-fit">
            {['pendiente','aprobada','rechazada','todas'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                  filtro === f ? 'bg-dangerus-500 text-white' : 'text-carbon-600 hover:bg-carbon-50'
                }`}>
                {f === 'pendiente' && pendientes > 0 ? `${f} (${pendientes})` : f}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            {cargando ? (
              <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 bg-carbon-100 rounded-xl animate-pulse"/>)}</div>
            ) : filtradas.length === 0 ? (
              <p className="text-center py-10 text-carbon-400 text-sm">No hay solicitudes {filtro !== 'todas' ? filtro + 's' : ''}.</p>
            ) : (
              <div className="space-y-2">
                {filtradas.map(s => (
                  <div key={s.id}
                    onClick={() => { setActiva(s); setRespuesta(s.respuesta_supervisor || ''); setError(''); }}
                    className="flex items-center justify-between p-4 rounded-xl border border-carbon-100 hover:border-dangerus-200 hover:bg-dangerus-50/30 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-dangerus-100 flex items-center justify-center text-dangerus-700 text-xs font-bold">
                          {s.empleado_nombre?.charAt(0) || '?'}
                        </div>
                        <p className="font-semibold text-carbon-800 text-sm">{s.empleado_nombre}</p>
                        <span className="text-carbon-400 text-xs">{s.empleado_cedula}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[s.estado]}`}>{s.estado}</span>
                      </div>
                      <p className="text-xs text-carbon-500 ml-9">
                        <strong className="capitalize">{s.tipo}</strong> · {new Date(s.fecha_inicio+'T12:00:00').toLocaleDateString('es-CO')} — {new Date(s.fecha_fin+'T12:00:00').toLocaleDateString('es-CO')}
                        {s.motivo && ` · "${s.motivo.slice(0,50)}${s.motivo.length>50?'...':''}"`}
                      </p>
                    </div>
                    {s.estado === 'pendiente' && (
                      <div className="flex items-center gap-1.5 ml-4">
                        <button onClick={e => { e.stopPropagation(); setActiva(s); setRespuesta(''); setError(''); }}
                          className="px-3 py-1.5 rounded-lg bg-dangerus-500 text-white text-xs font-semibold hover:bg-dangerus-600 transition-colors">
                          Responder
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal responder */}
      {activa && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-100">
              <h2 className="font-semibold text-carbon-900">Solicitud de {activa.empleado_nombre}</h2>
              <button onClick={() => setActiva(null)} className="text-carbon-400 hover:text-carbon-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Info solicitud */}
              <div className="bg-carbon-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-carbon-600">Empleado:</span>
                  <span className="font-semibold text-carbon-800">{activa.empleado_nombre} — {activa.empleado_cedula}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-carbon-600">Tipo:</span>
                  <span className="font-semibold text-carbon-800 capitalize">{activa.tipo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-carbon-600">Período:</span>
                  <span className="font-semibold text-carbon-800">
                    {new Date(activa.fecha_inicio+'T12:00:00').toLocaleDateString('es-CO')} → {new Date(activa.fecha_fin+'T12:00:00').toLocaleDateString('es-CO')}
                  </span>
                </div>
                {activa.motivo && (
                  <div>
                    <span className="text-carbon-600">Motivo del empleado:</span>
                    <p className="mt-0.5 text-carbon-800 italic">"{activa.motivo}"</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-carbon-600">Estado:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[activa.estado]}`}>{activa.estado}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">
                  Respuesta / Justificación {activa.estado === 'pendiente' && <span className="text-red-500">(requerida si rechazas)</span>}
                </label>
                <textarea
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta o justificación para el empleado..."
                  rows={3}
                  disabled={activa.estado !== 'pendiente'}
                  className="w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm outline-none focus:border-dangerus-400 resize-none disabled:bg-carbon-50 disabled:text-carbon-400"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {activa.estado === 'pendiente' && (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => responder('rechazada')} disabled={procesando}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
                    {procesando ? '...' : '✕ Rechazar'}
                  </button>
                  <button onClick={() => responder('aprobada')} disabled={procesando}
                    className="flex-1 py-2.5 rounded-xl bg-dangerus-500 hover:bg-dangerus-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                    {procesando ? '...' : '✓ Aprobar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
