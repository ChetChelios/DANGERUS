// ============================================================
// Dashboard DGUS — con datos reales conectados al backend
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PanelControlTurno from '../components/PanelControlTurno';
import HorarioSemanal from '../components/HorarioSemanal';
import * as turnoApi from '../api/turnoApi';
import * as authApi from '../api/authApi';

// ── Íconos ─────────────────────────────────────────────────
const IconShield = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const IconDashboard = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const IconCalendar = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const IconChart = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const IconSettings = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const IconLogout = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const IconUsers = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconGrid = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const IconArrow = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>);
const IconClock = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

// ── Helpers ─────────────────────────────────────────────────

/**
 * Dado un array de eventos (login/logout/break…) de un día,
 * calcula el total de horas efectivas trabajadas en minutos.
 */
function calcularMinutosTrabajados(eventos) {
  let minutos = 0;
  let loginTime = null;

  for (const ev of eventos) {
    const t = new Date(ev.fecha_hora).getTime();
    if (ev.tipo_evento === 'login') {
      loginTime = t;
    } else if (ev.tipo_evento === 'logout' && loginTime) {
      minutos += (t - loginTime) / 60000;
      loginTime = null;
    } else if (['break1_inicio', 'almuerzo_inicio', 'break2_inicio'].includes(ev.tipo_evento) && loginTime) {
      // Pausar el conteo
      minutos += (t - loginTime) / 60000;
      loginTime = null;
    } else if (['break1_fin', 'almuerzo_fin', 'break2_fin'].includes(ev.tipo_evento)) {
      // Reanudar el conteo
      loginTime = t;
    }
  }

  // Si aún está en turno (sin logout todavía), contar hasta ahora
  if (loginTime) {
    minutos += (Date.now() - loginTime) / 60000;
  }

  return minutos;
}

function formatearMinutos(min) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function getLunesDeSemana() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function getViernesDeSemana() {
  const lunes = getLunesDeSemana();
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 6);
  viernes.setHours(23, 59, 59, 999);
  return viernes;
}

// Formatea Date a YYYY-MM-DD
function toISO(date) {
  return date.toISOString().split('T')[0];
}

// Agrupa eventos por día (YYYY-MM-DD)
function agruparPorDia(eventos) {
  const grupos = {};
  for (const ev of eventos) {
    const dia = new Date(ev.fecha_hora).toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
    });
    if (!grupos[dia]) grupos[dia] = [];
    grupos[dia].push(ev);
  }
  return grupos;
}

// ── Componente ──────────────────────────────────────────────
export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();
  const esAdmin = usuario?.rol === 'administrador';

  // Perfil completo desde /auth/yo
  const [perfil, setPerfil] = useState(null);

  // Asistencia real
  const [eventosSemanales, setEventosSemanales] = useState([]);
  const [cargandoCalendario, setCargandoCalendario] = useState(true);

  // Búsqueda
  const [busqueda, setBusqueda] = useState('');

  function handleLogout() {
    cerrarSesion();
    navegar('/login');
  }

  // Cargar perfil del usuario
  useEffect(() => {
    authApi.obtenerPerfil()
      .then((datos) => setPerfil(datos.usuario || datos))
      .catch(() => setPerfil(null));
  }, []);

  // Cargar calendario de la semana
  const cargarCalendario = useCallback(async () => {
    setCargandoCalendario(true);
    try {
      const desde = toISO(getLunesDeSemana());
      const hasta = toISO(getViernesDeSemana());
      const datos = await turnoApi.obtenerCalendario(desde, hasta);
      setEventosSemanales(datos.eventos || []);
    } catch {
      setEventosSemanales([]);
    } finally {
      setCargandoCalendario(false);
    }
  }, []);

  useEffect(() => { cargarCalendario(); }, [cargarCalendario]);

  // Calcular horas semanales reales
  const minutosSemana = calcularMinutosTrabajados(eventosSemanales);
  const horasSemana = minutosSemana / 60;
  const META_HORAS = 40;
  const porcentaje = Math.min((horasSemana / META_HORAS) * 100, 100);

  // Construir tabla de asistencia por día
  const gruposPorDia = agruparPorDia(eventosSemanales);
  const filasDiarias = Object.entries(gruposPorDia)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([dia, evs]) => {
      const login = evs.find((e) => e.tipo_evento === 'login');
      const logout = evs.find((e) => e.tipo_evento === 'logout');
      const min = calcularMinutosTrabajados(evs);
      return {
        fecha: dia,
        entrada: login ? new Date(login.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
        salida: logout ? new Date(logout.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
        duracion: min > 0 ? formatearMinutos(min) : '—',
        estado: logout ? 'Completado' : (login ? 'En turno' : 'Sin registro'),
      };
    });

  // Filtro búsqueda sobre la tabla
  const filasFiltradas = busqueda.trim()
    ? filasDiarias.filter((f) =>
        f.fecha.includes(busqueda) ||
        f.estado.toLowerCase().includes(busqueda.toLowerCase())
      )
    : filasDiarias;

  // Próximo turno: mañana (placeholder hasta que haya malla conectada)
  const manana = new Date(Date.now() + 86400000);

  // Nav items
  const navItems = [
    { icon: <IconDashboard />, label: 'Dashboard', to: '/dashboard' },
    { icon: <IconCalendar />, label: 'Mi Horario', to: '/dashboard' },
    ...(esAdmin ? [
      { icon: <IconUsers />, label: 'Usuarios', to: '/admin/usuarios' },
      { icon: <IconGrid />, label: 'Mallas', to: '/admin/mallas' },
      { icon: <IconChart />, label: 'Reportes', to: '/admin/reportes' },
    ] : [
      { icon: <IconChart />, label: 'Mis Reportes', to: '/dashboard' },
    ]),
  ];

  const nombreMostrado = perfil?.nombre || usuario?.nombre || 'Usuario';
  const inicial = nombreMostrado.charAt(0).toUpperCase();
  const campana = perfil?.campana_nombre || '—';
  const supervisor = perfil?.supervisor || '—';

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-carbon-100 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-carbon-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-dangerus-500 flex items-center justify-center text-white">
              <IconShield />
            </div>
            <div>
              <p className="font-display font-bold text-carbon-900 text-sm leading-tight">DGUS</p>
              <p className="text-[10px] text-carbon-400 leading-tight">Edición Empresarial</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const activo = location.pathname === item.to && item.label !== 'Mi Horario' && item.label !== 'Mis Reportes'
              || (location.pathname === item.to && item.label === 'Dashboard');
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activo
                    ? 'bg-dangerus-500 text-white'
                    : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900'
                }`}
              >
                <span className={activo ? 'text-white' : 'text-carbon-400'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-carbon-100 space-y-0.5">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900 transition-colors">
            <span className="text-carbon-400"><IconSettings /></span>
            Configuración
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="text-carbon-400"><IconLogout /></span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-carbon-100 sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-dangerus-500 flex items-center justify-center text-white">
                <IconShield />
              </div>
              <span className="font-display font-bold text-carbon-900 text-sm">DGUS</span>
            </div>
            {/* Búsqueda */}
            <div className="hidden md:flex items-center gap-2 bg-carbon-50 border border-carbon-200 rounded-xl px-3 py-2 w-64">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-carbon-300">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por fecha o estado..."
                className="bg-transparent text-sm text-carbon-600 placeholder:text-carbon-300 outline-none w-full"
              />
            </div>
          </div>

          {/* Perfil usuario en topbar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-semibold text-carbon-800 leading-tight">{nombreMostrado}</p>
              <p className="text-xs text-carbon-400 capitalize leading-tight">{perfil?.rol || usuario?.rol || 'empleado'}</p>
            </div>
            <div
              title={`Campaña: ${campana}\nSupervisor: ${supervisor}`}
              className="w-8 h-8 rounded-full bg-dangerus-500 flex items-center justify-center text-white text-xs font-bold cursor-default"
            >
              {inicial}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 space-y-6 max-w-5xl">

          {/* ── Fila 1: Panel turno + resumen semanal ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <PanelControlTurno onEventoRegistrado={cargarCalendario} />
            </div>

            {/* Resumen semanal REAL */}
            <div className="bg-white rounded-2xl border border-carbon-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-carbon-900 text-sm">Resumen Semanal</h3>
                <span className="text-[10px] text-carbon-400">Esta semana</span>
              </div>

              <div>
                <p className="text-xs text-carbon-400 mb-1">Horas trabajadas</p>
                {cargandoCalendario ? (
                  <p className="text-carbon-300 text-sm">Calculando...</p>
                ) : (
                  <>
                    <p className="font-display font-bold text-dangerus-500 text-3xl">
                      {formatearMinutos(minutosSemana)}{' '}
                      <span className="text-carbon-300 text-xl">/ {META_HORAS}h</span>
                    </p>
                    <div className="mt-2 h-1.5 bg-carbon-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-dangerus-400 rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-carbon-100">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Próximo turno</p>
                <p className="text-sm font-semibold text-carbon-800">
                  {manana.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-carbon-400 mt-0.5">Consulta tu horario abajo</p>
              </div>

              <div className="rounded-xl bg-dangerus-600 p-4 flex items-center justify-between mt-1">
                <div>
                  <p className="text-[10px] text-dangerus-200 uppercase tracking-wider font-semibold">¿Necesitas permiso?</p>
                  <p className="text-white text-sm font-semibold mt-0.5">Solicitar Ausencia</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <IconArrow />
                </div>
              </div>
            </div>
          </div>

          {/* ── Fila 2: Tabla de asistencia REAL ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-carbon-900">Asistencia esta semana</h3>
              <button
                onClick={cargarCalendario}
                className="text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors"
              >
                Actualizar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b border-carbon-100">
                    {['FECHA', 'ENTRADA', 'SALIDA', 'DURACIÓN', 'ESTADO'].map((h) => (
                      <th key={h} className="pb-3 text-left text-[10px] font-semibold text-carbon-400 tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargandoCalendario && (
                    <tr><td colSpan="5" className="py-6 text-center text-carbon-400 text-sm">Cargando asistencia...</td></tr>
                  )}
                  {!cargandoCalendario && filasFiltradas.length === 0 && (
                    <tr><td colSpan="5" className="py-6 text-center text-carbon-400 text-sm">
                      {busqueda ? 'No hay registros que coincidan.' : 'No hay registros de asistencia esta semana.'}
                    </td></tr>
                  )}
                  {!cargandoCalendario && filasFiltradas.map((row, i) => (
                    <tr key={i} className="border-b border-carbon-50 last:border-0">
                      <td className="py-3.5 text-carbon-700">{row.fecha}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.entrada}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.salida}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.duracion}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.estado === 'Completado' ? 'bg-dangerus-100 text-dangerus-700' :
                          row.estado === 'En turno' ? 'bg-green-100 text-green-700' :
                          'bg-carbon-100 text-carbon-600'
                        }`}>
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Fila 3: Mi horario semanal ── */}
          <HorarioSemanal />

          {/* ── Fila 4: Métricas personales ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-carbon-400"><IconClock /></span>
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">Total horas semana</p>
              </div>
              <p className="font-display font-bold text-3xl text-carbon-900">
                {cargandoCalendario ? '—' : formatearMinutos(minutosSemana)}
              </p>
              <p className="text-xs text-carbon-400 mt-1">
                {porcentaje.toFixed(0)}% de la meta semanal ({META_HORAS}h)
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-carbon-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">Mi perfil</p>
              </div>
              <p className="font-semibold text-carbon-900">{nombreMostrado}</p>
              <p className="text-xs text-carbon-500 mt-0.5 capitalize">{perfil?.rol || usuario?.rol}</p>
              {campana !== '—' && <p className="text-xs text-carbon-400 mt-0.5">Campaña: {campana}</p>}
              {supervisor !== '—' && <p className="text-xs text-carbon-400 mt-0.5">Supervisor: {supervisor}</p>}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
