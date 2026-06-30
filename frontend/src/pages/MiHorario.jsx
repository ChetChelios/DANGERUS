// ============================================================
// MiHorario — Calendario mensual con malla + asistencia real
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import * as turnoApi from '../api/turnoApi';
import * as mallaApi from '../api/mallaApi';

const DIAS_SEMANA = ['lun','mar','mié','jue','vie','sáb','dom'];
const NOMBRES_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function obtenerLunes(fecha) {
  const d = new Date(fecha);
  const dia = d.getDay();
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
  return d;
}

function fmt(d) { return d.toISOString().split('T')[0]; }
function fmtHora(h) { return h ? h.slice(0,5) : null; }
function minutos(hStr) { if (!hStr) return null; const [h,m] = hStr.split(':'); return +h*60 + +m; }

export default function MiHorario() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState([]);
  const [mallas, setMallas] = useState({});
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const inicioMes = new Date(anio, mes, 1);
      const finMes = new Date(anio, mes + 1, 0, 23, 59, 59);
      // Eventos del mes
      const evResp = await turnoApi.obtenerCalendario(fmt(inicioMes), fmt(finMes) + 'T23:59:59');
      setEventos(evResp.eventos || []);
      // Mallas: obtener todas las semanas del mes
      const mallasMap = {};
      let semana = obtenerLunes(inicioMes);
      while (semana <= finMes) {
        const semStr = fmt(semana);
        try {
          const m = await mallaApi.obtenerMiMalla(semStr);
          if (m.malla) m.malla.forEach(d => { mallasMap[`${semStr}_${d.dia_semana}`] = d; });
        } catch {}
        semana = new Date(semana); semana.setDate(semana.getDate() + 7);
      }
      setMallas(mallasMap);
    } catch(e) { console.error(e); }
    finally { setCargando(false); }
  }, [mes, anio]);

  useEffect(() => { cargar(); }, [cargar]);

  // Procesar eventos por fecha
  const porFecha = {};
  for (const ev of eventos) {
    const d = ev.fecha_hora.split('T')[0];
    if (!porFecha[d]) porFecha[d] = [];
    porFecha[d].push(ev);
  }

  // Calcular estado de cada día
  function estadoDia(fecha) {
    const evs = porFecha[fecha] || [];
    const login = evs.find(e => e.tipo_evento === 'login');
    const logout = evs.find(e => e.tipo_evento === 'logout');
    if (!login) return null;
    // Obtener malla del día
    const d = new Date(fecha + 'T12:00:00');
    const diasEs = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const diaSemana = diasEs[d.getDay()];
    const lunes = fmt(obtenerLunes(d));
    const malla = mallas[`${lunes}_${diaSemana}`];
    const horasT = logout ? (new Date(logout.fecha_hora) - new Date(login.fecha_hora)) / 3600000 : null;
    let retardo = false;
    if (malla?.hora_entrada) {
      const esperados = minutos(fmtHora(malla.hora_entrada));
      const reales = new Date(login.fecha_hora);
      const realesMins = reales.getHours() * 60 + reales.getMinutes();
      retardo = realesMins > esperados + 5; // 5 min de tolerancia
    }
    return { login, logout, horasT: horasT ? Math.round(horasT * 10) / 10 : null, retardo, malla };
  }

  // Construir grilla del mes
  function diasDelMes() {
    const primero = new Date(anio, mes, 1);
    const ultimo = new Date(anio, mes + 1, 0);
    const inicioGrid = new Date(primero);
    const diaPrimero = primero.getDay();
    inicioGrid.setDate(primero.getDate() - (diaPrimero === 0 ? 6 : diaPrimero - 1));
    const dias = [];
    const cur = new Date(inicioGrid);
    while (cur <= ultimo || dias.length % 7 !== 0) {
      dias.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      if (dias.length > 42) break;
    }
    return dias;
  }

  const dias = diasDelMes();

  // Acumulados del mes
  const retardosMes = Object.keys(porFecha).filter(f => {
    const e = estadoDia(f); return e?.retardo && f.startsWith(`${anio}-${String(mes+1).padStart(2,'0')}`);
  }).length;
  const horasMes = Object.keys(porFecha).reduce((acc, f) => {
    if (!f.startsWith(`${anio}-${String(mes+1).padStart(2,'0')}`)) return acc;
    const e = estadoDia(f); return acc + (e?.horasT || 0);
  }, 0);
  const diasAsistidos = Object.keys(porFecha).filter(f =>
    f.startsWith(`${anio}-${String(mes+1).padStart(2,'0')}`) && porFecha[f].some(e => e.tipo_evento === 'login')
  ).length;

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-56 p-6">
        <div className="max-w-4xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-carbon-900">Mi Horario</h1>
              <p className="text-carbon-400 text-sm mt-0.5">Calendario de asistencia y malla programada</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a-1); } else setMes(m => m-1); }}
                className="w-8 h-8 rounded-xl border border-carbon-200 flex items-center justify-center hover:bg-carbon-50 text-carbon-600 transition-colors">
                ‹
              </button>
              <span className="font-semibold text-carbon-800 min-w-[130px] text-center text-sm">
                {NOMBRES_MES[mes]} {anio}
              </span>
              <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a+1); } else setMes(m => m+1); }}
                className="w-8 h-8 rounded-xl border border-carbon-200 flex items-center justify-center hover:bg-carbon-50 text-carbon-600 transition-colors">
                ›
              </button>
            </div>
          </div>

          {/* Métricas del mes */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Días asistidos', valor: diasAsistidos, color: 'text-dangerus-600' },
              { label: 'Retardos', valor: retardosMes, color: retardosMes > 0 ? 'text-red-600' : 'text-carbon-900' },
              { label: 'Horas trabajadas', valor: `${Math.round(horasMes * 10)/10}h`, color: 'text-carbon-900' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-carbon-100 p-4">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{m.label}</p>
                <p className={`font-display font-bold text-2xl mt-1 ${m.color}`}>{m.valor}</p>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 text-xs">
            {[
              { color: 'bg-dangerus-400', label: 'Asistencia' },
              { color: 'bg-red-400', label: 'Retardo' },
              { color: 'bg-carbon-200', label: 'Sin registro' },
              { color: 'bg-blue-200', label: 'Programado' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-carbon-600">
                <span className={`w-3 h-3 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            {cargando ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length:35}).map((_,i) => (
                  <div key={i} className="h-16 bg-carbon-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Cabecera días */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-carbon-400 uppercase tracking-wider py-1">{d}</div>
                  ))}
                </div>
                {/* Grilla */}
                <div className="grid grid-cols-7 gap-1">
                  {dias.map((dia, i) => {
                    const esMesActual = dia.getMonth() === mes;
                    const esHoy = fmt(dia) === fmt(hoy);
                    const estado = esMesActual ? estadoDia(fmt(dia)) : null;
                    // Verificar si tiene malla (programado)
                    const diasEs = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
                    const diaSemana = diasEs[dia.getDay()];
                    const lunes = fmt(obtenerLunes(dia));
                    const tieneMalla = !!mallas[`${lunes}_${diaSemana}`];
                    let bg = 'bg-carbon-50';
                    let textColor = esMesActual ? 'text-carbon-600' : 'text-carbon-300';
                    if (esMesActual && estado?.login) {
                      bg = estado.retardo ? 'bg-red-50 border border-red-200' : 'bg-dangerus-50 border border-dangerus-200';
                      textColor = estado.retardo ? 'text-red-700' : 'text-dangerus-700';
                    } else if (esMesActual && tieneMalla && dia < hoy) {
                      bg = 'bg-carbon-100';
                    } else if (esMesActual && tieneMalla) {
                      bg = 'bg-blue-50 border border-blue-100';
                      textColor = 'text-blue-700';
                    }
                    return (
                      <div key={i} className={`relative rounded-xl p-1.5 min-h-[64px] ${bg} ${esHoy ? 'ring-2 ring-dangerus-400 ring-offset-1' : ''}`}>
                        <span className={`text-xs font-semibold ${textColor} ${esHoy ? 'font-bold' : ''}`}>
                          {dia.getDate()}
                        </span>
                        {esMesActual && estado?.login && (
                          <div className="mt-1 space-y-0.5">
                            <div className={`text-[9px] font-semibold px-1 py-0.5 rounded ${estado.retardo ? 'bg-red-100 text-red-700' : 'bg-dangerus-100 text-dangerus-700'}`}>
                              {new Date(estado.login.fecha_hora).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
                              {estado.retardo && ' ⚠'}
                            </div>
                            {estado.horasT && (
                              <div className="text-[9px] text-carbon-500">{estado.horasT}h</div>
                            )}
                          </div>
                        )}
                        {esMesActual && tieneMalla && !estado?.login && dia < hoy && (
                          <div className="mt-1 text-[9px] text-carbon-400">Sin registro</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Detalle día hoy si hay asistencia */}
          {(() => {
            const e = estadoDia(fmt(hoy));
            if (!e?.login) return null;
            return (
              <div className="bg-white rounded-2xl border border-carbon-100 p-5">
                <h3 className="font-semibold text-carbon-900 mb-3 text-sm">Detalle de hoy</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Entrada', valor: new Date(e.login.fecha_hora).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) },
                    { label: 'Salida', valor: e.logout ? new Date(e.logout.fecha_hora).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : 'En turno' },
                    { label: 'Horas', valor: e.horasT ? `${e.horasT}h` : '—' },
                    { label: 'Estado', valor: e.retardo ? 'Retardo' : 'A tiempo', color: e.retardo ? 'text-red-600' : 'text-dangerus-600' },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{d.label}</p>
                      <p className={`font-semibold text-sm mt-0.5 ${d.color || 'text-carbon-800'}`}>{d.valor}</p>
                    </div>
                  ))}
                </div>
                {e.malla && (
                  <div className="mt-3 pt-3 border-t border-carbon-100">
                    <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-2">Malla programada</p>
                    <div className="flex flex-wrap gap-3 text-xs text-carbon-600">
                      <span>Entrada: <strong>{fmtHora(e.malla.hora_entrada) || '—'}</strong></span>
                      <span>Salida: <strong>{fmtHora(e.malla.hora_salida) || '—'}</strong></span>
                      {e.malla.almuerzo_inicio && <span>Almuerzo: <strong>{fmtHora(e.malla.almuerzo_inicio)}–{fmtHora(e.malla.almuerzo_fin)}</strong></span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
