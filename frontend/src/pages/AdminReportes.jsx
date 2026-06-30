// ============================================================
// AdminReportes v2.0 — Filtros reales + exportación Excel
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import * as reporteApi from '../api/reporteApi';

const Ico = {
  shield:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  users:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  grid:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chart:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  dash:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  logout:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  download:() => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const ETIQUETAS_EVENTO = {
  login: 'Entrada',
  logout: 'Salida',
  break1_inicio: 'Inicio Break 1',
  break1_fin: 'Fin Break 1',
  almuerzo_inicio: 'Inicio Almuerzo',
  almuerzo_fin: 'Fin Almuerzo',
  break2_inicio: 'Inicio Break 2',
  break2_fin: 'Fin Break 2',
};

const BADGE_EVENTO = {
  login: 'bg-dangerus-100 text-dangerus-700',
  logout: 'bg-carbon-100 text-carbon-600',
  break1_inicio: 'bg-blue-50 text-blue-700',
  break1_fin: 'bg-blue-50 text-blue-700',
  almuerzo_inicio: 'bg-orange-50 text-orange-700',
  almuerzo_fin: 'bg-orange-50 text-orange-700',
  break2_inicio: 'bg-purple-50 text-purple-700',
  break2_fin: 'bg-purple-50 text-purple-700',
};

const inputCls = "w-full rounded-xl border border-carbon-200 px-3.5 py-2.5 text-sm text-carbon-800 focus:border-dangerus-400 focus:ring-2 focus:ring-dangerus-100 outline-none transition-all";

export default function AdminReportes() {
  const { cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();

  const hoy = new Date().toISOString().split('T')[0];
  const hace7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [filtros, setFiltros] = useState({ cedula: '', nombre: '', supervisor: '', campana: '', fechaInicio: hace7, fechaFin: hoy });
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  function setF(campo, valor) { setFiltros(f => ({ ...f, [campo]: valor })); }
  function handleLogout() { cerrarSesion(); navegar('/login'); }

  async function buscar(e) {
    e?.preventDefault();
    setCargando(true); setError('');
    try {
      const datos = await reporteApi.obtenerReportes(filtros);
      setReportes(Array.isArray(datos) ? datos : []);
      setBuscado(true);
    } catch { setError('No se pudieron cargar los reportes.'); }
    finally { setCargando(false); }
  }

  async function exportar() {
    setExportando(true);
    try {
      const blob = await reporteApi.exportarExcel(filtros);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-dgus-${filtros.fechaInicio}-${filtros.fechaFin}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar el archivo. Verifica que el backend soporte exportación.');
    } finally { setExportando(false); }
  }

  function limpiar() {
    setFiltros({ cedula: '', nombre: '', supervisor: '', campana: '', fechaInicio: hace7, fechaFin: hoy });
    setReportes([]); setBuscado(false); setError('');
  }

  // Agrupar eventos por empleado/día para resumen
  const totalEventos = reportes.length;
  const empleadosUnicos = new Set(reportes.map(r => r.cedula)).size;
  const entradas = reportes.filter(r => r.tipo_evento === 'login').length;

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-56 p-6">
        <div className="max-w-5xl space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl text-carbon-900">Reportes</h1>
            <p className="text-carbon-400 text-sm mt-0.5">Consulta y exporta los registros de marcación del equipo.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {/* ── Filtros ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <h2 className="font-semibold text-carbon-900 text-sm mb-4">Filtros de búsqueda</h2>
            <form onSubmit={buscar} className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Cédula</label>
                <input value={filtros.cedula} onChange={e => setF('cedula', e.target.value)} placeholder="1234567890" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Nombre</label>
                <input value={filtros.nombre} onChange={e => setF('nombre', e.target.value)} placeholder="Juan Pérez" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Supervisor</label>
                <input value={filtros.supervisor} onChange={e => setF('supervisor', e.target.value)} placeholder="Nombre supervisor" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Campaña</label>
                <input value={filtros.campana} onChange={e => setF('campana', e.target.value)} placeholder="Nombre campaña" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Desde</label>
                <input type="date" value={filtros.fechaInicio} onChange={e => setF('fechaInicio', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Hasta</label>
                <input type="date" value={filtros.fechaFin} onChange={e => setF('fechaFin', e.target.value)} className={inputCls} />
              </div>
              <div className="md:col-span-3 flex gap-3 pt-1">
                <button type="submit" disabled={cargando} className="flex items-center gap-2 bg-dangerus-500 hover:bg-dangerus-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  <Ico.search /> {cargando ? 'Buscando...' : 'Buscar registros'}
                </button>
                {buscado && (
                  <>
                    <button type="button" onClick={exportar} disabled={exportando || reportes.length === 0} className="flex items-center gap-2 border border-carbon-200 hover:bg-carbon-50 text-carbon-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
                      <Ico.download /> {exportando ? 'Exportando...' : 'Exportar Excel'}
                    </button>
                    <button type="button" onClick={limpiar} className="text-sm text-carbon-500 hover:text-carbon-700 px-3 py-2.5 transition-colors">
                      Limpiar
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          {/* ── Resumen si hay resultados ── */}
          {buscado && !cargando && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total registros', valor: totalEventos },
                { label: 'Empleados',       valor: empleadosUnicos },
                { label: 'Entradas',        valor: entradas },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-carbon-100 p-4">
                  <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{s.label}</p>
                  <p className="font-display font-bold text-2xl text-carbon-900 mt-1">{s.valor}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabla resultados ── */}
          {buscado && (
            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-carbon-900">
                  Resultados
                  {reportes.length > 0 && <span className="ml-2 text-xs font-normal text-carbon-400 bg-carbon-100 px-2 py-0.5 rounded-full">{reportes.length}</span>}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-carbon-100">
                      {['EMPLEADO', 'CÉDULA', 'CAMPAÑA', 'EVENTO', 'FECHA', 'HORA'].map(h => (
                        <th key={h} className="pb-3 text-left text-[10px] font-semibold text-carbon-400 tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      Array.from({length:5}).map((_, i) => (
                        <tr key={i} className="border-b border-carbon-50">
                          {Array.from({length:6}).map((__, j) => (
                            <td key={j} className="py-3"><div className="h-4 bg-carbon-100 rounded animate-pulse w-16" /></td>
                          ))}
                        </tr>
                      ))
                    ) : reportes.length === 0 ? (
                      <tr><td colSpan="6" className="py-10 text-center text-carbon-400">Sin registros para los filtros aplicados.</td></tr>
                    ) : reportes.map((r, i) => {
                      const dt = new Date(r.fecha_hora);
                      const fecha = dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                      const hora  = dt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      return (
                        <tr key={i} className="border-b border-carbon-50 last:border-0 hover:bg-carbon-50/50 transition-colors">
                          <td className="py-3 font-medium text-carbon-800">{r.nombre}</td>
                          <td className="py-3 font-mono text-carbon-500 text-xs">{r.cedula}</td>
                          <td className="py-3 text-carbon-500">{r.campana || '—'}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE_EVENTO[r.tipo_evento] || 'bg-carbon-100 text-carbon-600'}`}>
                              {ETIQUETAS_EVENTO[r.tipo_evento] || r.tipo_evento}
                            </span>
                          </td>
                          <td className="py-3 text-carbon-600">{fecha}</td>
                          <td className="py-3 font-mono text-carbon-600">{hora}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
