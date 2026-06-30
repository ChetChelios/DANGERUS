// ============================================================
// Dashboard DGUS v2.1 — Totalmente conectado al backend
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PanelControlTurno from '../components/PanelControlTurno';
import HorarioSemanal from '../components/HorarioSemanal';
import * as turnoApi from '../api/turnoApi';
import Sidebar from '../components/Sidebar';
import * as solicitudApi from '../api/solicitudApi';
import Modal from '../components/Modal';

// ── Íconos ───────────────────────────────────────────────────
const Ico = {
  dashboard: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  calendar:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chart:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  grid:      () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  refresh:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  settings:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  shield:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bell:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  arrow:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  trend:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  clock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  calcheck:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>,
  star:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  question:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

// ── Función para calcular días de la semana ───────────────────
function obtenerRangoSemana() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() + diff);
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { desde: fmt(lunes), hasta: fmt(domingo) + 'T23:59:59' };
}

// ── Procesar eventos del calendario en registros de asistencia ─
function procesarEventosEnAsistencia(eventos) {
  const dias = {};
  for (const ev of eventos) {
    const fecha = new Date(ev.fecha_hora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!dias[fecha]) dias[fecha] = { fecha, entrada: null, salida: null };
    if (ev.tipo_evento === 'login' && !dias[fecha].entrada) {
      dias[fecha].entrada = new Date(ev.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (ev.tipo_evento === 'logout') {
      dias[fecha].salida = new Date(ev.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
  return Object.values(dias).map(d => {
    let duracion = '—';
    let estado = 'Parcial';
    if (d.entrada && d.salida) {
      const e = new Date(`2000-01-01 ${d.entrada}`);
      const s = new Date(`2000-01-01 ${d.salida}`);
      const mins = Math.round((s - e) / 60000);
      duracion = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      estado = mins >= 420 ? 'Completado' : 'Parcial';
    }
    return { ...d, duracion, estado };
  }).reverse().slice(0, 5);
}

// ── Calcular horas trabajadas en la semana ────────────────────
function calcularHorasSemana(eventos) {
  let totalMins = 0;
  let loginTime = null;
  const sorted = [...eventos].sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  for (const ev of sorted) {
    if (ev.tipo_evento === 'login') loginTime = new Date(ev.fecha_hora);
    if (ev.tipo_evento === 'logout' && loginTime) {
      totalMins += (new Date(ev.fecha_hora) - loginTime) / 60000;
      loginTime = null;
    }
  }
  return Math.round(totalMins / 60 * 10) / 10;
}

// ── Noticias (estáticas por ahora, sin endpoint en backend) ───
const NOTICIAS = [
  { fecha: '28 Jun, 2026', titulo: 'Nuevo sistema de turnos activo', resumen: 'A partir de hoy el sistema DGUS gestiona todos los registros de entrada y salida de forma automática.' },
  { fecha: '25 Jun, 2026', titulo: 'Capacitación en seguridad', resumen: 'Recordamos a todos los colaboradores completar el módulo obligatorio de seguridad antes del 30 de junio.' },
  { fecha: '20 Jun, 2026', titulo: 'Evento de integración mensual', resumen: '¡No te pierdas nuestro próximo convivio corporativo! Celebraremos los logros del semestre.' },
];

// ── NavItem ───────────────────────────────────────────────────
function NavItem({ icon, label, to, activo }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      activo ? 'bg-dangerus-500 text-white' : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900'
    }`}>
      <span className={activo ? 'text-white' : 'text-carbon-400'}>{icon}</span>
      {label}
    </Link>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();
  const esAdmin = usuario?.rol === 'administrador';
  // BUG 3 FIX: modal de confirmación para cerrar sesión desde Dashboard
  const [modalLogout, setModalLogout] = useState(false);

  const [asistencia, setAsistencia] = useState([]);
  const [horasSemana, setHorasSemana] = useState(0);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargandoAsistencia(true);
      const { desde, hasta } = obtenerRangoSemana();
      // Cargamos los últimos 30 días para la tabla
      const treintaDiasAtras = new Date(); treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
      const desde30 = treintaDiasAtras.toISOString().split('T')[0];
      const [eventosSemana, eventosRecientes] = await Promise.all([
        turnoApi.obtenerCalendario(desde, hasta),
        turnoApi.obtenerCalendario(desde30, hasta),
      ]);
      setHorasSemana(calcularHorasSemana(eventosSemana.eventos || []));
      setAsistencia(procesarEventosEnAsistencia(eventosRecientes.eventos || []));
    } catch {
      setAsistencia([]);
    } finally {
      setCargandoAsistencia(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // BUG 3 FIX: no cerrar sesión directamente, mostrar modal de confirmación
  function handleLogout() { setModalLogout(true); }
  function confirmarLogout() { cerrarSesion(); navegar('/login'); }

  // BUG 2 FIX: rutas corregidas para Mi Horario y Mis Reportes
  const navItems = [
    { icon: <Ico.dashboard />, label: 'Dashboard',   to: '/dashboard',      path: '/dashboard' },
    { icon: <Ico.calendar />,  label: 'Mi Horario',   to: '/mi-horario',     path: '/mi-horario' },
    ...(esAdmin ? [
      { icon: <Ico.users />,   label: 'Usuarios',     to: '/admin/usuarios', path: '/admin/usuarios' },
      { icon: <Ico.grid />,    label: 'Mallas',       to: '/admin/mallas',   path: '/admin/mallas' },
      { icon: <Ico.chart />,   label: 'Reportes',     to: '/admin/reportes', path: '/admin/reportes' },
    ] : [
      { icon: <Ico.chart />,   label: 'Mis Reportes', to: '/mis-reportes',   path: '/mis-reportes' },
    ]),
  ];

  const metricasReales = [
    {
      icon: <Ico.clock />, label: 'PUNTUALIDAD',
      valor: asistencia.length > 0
        ? `${Math.round((asistencia.filter(a => a.estado === 'Completado').length / asistencia.length) * 100)}%`
        : '—',
      sub: `Últimos ${asistencia.length} registros`,
    },
    {
      icon: <Ico.calcheck />, label: 'HORAS ESTA SEMANA',
      valor: `${horasSemana}h`,
      sub: `De 40h objetivo`,
    },
    {
      icon: <Ico.star />, label: 'CAMPAÑA',
      valor: usuario?.campana || 'N/A',
      sub: usuario?.supervisor ? `Sup: ${usuario.supervisor}` : 'Sin supervisor asignado',
    },
  ];

  const pctSemana = Math.min(100, Math.round((horasSemana / 40) * 100));

  // Filtrar asistencia según búsqueda
  const asistenciaFiltrada = busqueda
    ? asistencia.filter(r => r.fecha.toLowerCase().includes(busqueda.toLowerCase()) || r.estado.toLowerCase().includes(busqueda.toLowerCase()))
    : asistencia;

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-carbon-100 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-carbon-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-dangerus-500 flex items-center justify-center">
              <Ico.shield />
            </div>
            <div>
              <p className="font-display font-bold text-carbon-900 text-sm leading-tight">DGUS</p>
              <p className="text-[10px] text-carbon-400 leading-tight">Edición Empresarial</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavItem key={item.label} {...item} activo={location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard')} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-carbon-100 space-y-0.5">
          {esAdmin && (
            <Link to="/admin/usuarios" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900 transition-colors">
              <span className="text-carbon-400"><Ico.settings /></span> Configuración
            </Link>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <span className="text-carbon-400"><Ico.logout /></span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══ CONTENIDO ════════════════════════════════════════ */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-carbon-100 sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-dangerus-500 flex items-center justify-center"><Ico.shield /></div>
              <span className="font-display font-bold text-carbon-900 text-sm">DGUS</span>
            </div>
            {/* Búsqueda */}
            <div className="hidden md:flex items-center gap-2 bg-carbon-50 border border-carbon-200 rounded-xl px-3 py-2 w-64 focus-within:border-dangerus-400 focus-within:ring-2 focus-within:ring-dangerus-100 transition-all">
              <span className="text-carbon-300"><Ico.search /></span>
              <input
                type="text"
                placeholder="Buscar en asistencia..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="bg-transparent text-sm text-carbon-700 placeholder:text-carbon-300 outline-none w-full"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="text-carbon-300 hover:text-carbon-600 text-xs">✕</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-carbon-200 flex items-center justify-center text-carbon-400 hover:bg-carbon-50 transition-colors relative">
              <Ico.bell />
            </button>
            <button className="w-8 h-8 rounded-lg border border-carbon-200 flex items-center justify-center text-carbon-400 hover:bg-carbon-50 transition-colors">
              <Ico.question />
            </button>
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-carbon-100">
              <div className="w-8 h-8 rounded-full bg-dangerus-500 flex items-center justify-center text-white text-xs font-bold">
                {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-carbon-800 leading-tight">{usuario?.nombre?.split(' ')[0]}</p>
                <p className="text-[10px] text-carbon-400 capitalize leading-tight">{usuario?.rol}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-6 space-y-5 max-w-5xl w-full">

          {/* ── Fila 1: Panel turno + resumen semanal ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <PanelControlTurno onEventoRegistrado={cargarDatos} />
            </div>

            {/* Resumen semanal real */}
            <div className="bg-white rounded-2xl border border-carbon-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-carbon-900 text-sm">Resumen Semanal</h3>
                <button onClick={cargarDatos} className="text-carbon-300 hover:text-dangerus-500 transition-colors" title="Actualizar">
                  <Ico.refresh />
                </button>
              </div>

              <div>
                <p className="text-xs text-carbon-400 mb-1">Horas trabajadas esta semana</p>
                {cargandoAsistencia ? (
                  <div className="h-8 bg-carbon-100 rounded animate-pulse w-24" />
                ) : (
                  <p className="font-display font-bold text-dangerus-500 text-3xl">
                    {horasSemana} <span className="text-carbon-300 text-xl">/ 40</span>
                  </p>
                )}
                <div className="mt-2 h-1.5 bg-carbon-100 rounded-full overflow-hidden">
                  <div className="h-full bg-dangerus-400 rounded-full transition-all duration-700" style={{ width: `${pctSemana}%` }} />
                </div>
                <p className="text-xs text-carbon-400 mt-1">{pctSemana}% completado</p>
              </div>

              <div className="pt-2 border-t border-carbon-100">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1">Información</p>
                <p className="text-sm font-semibold text-carbon-800">{usuario?.campana || 'Sin campaña'}</p>
                {usuario?.supervisor && <p className="text-xs text-carbon-400 mt-0.5">Sup: {usuario.supervisor}</p>}
              </div>

              <div className="rounded-xl bg-dangerus-600 p-4 flex items-center justify-between cursor-pointer" onClick={() => navegar('/mis-reportes')}>
                <div>
                  <p className="text-[10px] text-dangerus-200 uppercase tracking-wider font-semibold">¿Necesitas permiso?</p>
                  <p className="text-white text-sm font-semibold mt-0.5">Solicitar Ausencia</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Ico.arrow />
                </div>
              </div>
            </div>
          </div>

          {/* ── Fila 2: Tabla de asistencia real ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-carbon-900">Asistencia Reciente</h3>
              <div className="flex items-center gap-2">
                {busqueda && (
                  <span className="text-xs text-dangerus-500 bg-dangerus-50 px-2 py-1 rounded-lg">
                    {asistenciaFiltrada.length} resultado{asistenciaFiltrada.length !== 1 ? 's' : ''}
                  </span>
                )}
                <button onClick={cargarDatos} className="text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors">
                  Actualizar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-carbon-100">
                    {['FECHA', 'ENTRADA', 'SALIDA', 'DURACIÓN', 'ESTADO'].map(h => (
                      <th key={h} className="pb-3 text-left text-[10px] font-semibold text-carbon-400 tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargandoAsistencia ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-carbon-50">
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="py-3.5">
                            <div className="h-4 bg-carbon-100 rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : asistenciaFiltrada.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-carbon-400 text-sm">
                      {busqueda ? 'Sin resultados para tu búsqueda.' : 'No hay registros de asistencia esta semana.'}
                    </td></tr>
                  ) : (
                    asistenciaFiltrada.map((row, i) => (
                      <tr key={i} className="border-b border-carbon-50 last:border-0 hover:bg-carbon-50/50 transition-colors">
                        <td className="py-3.5 text-carbon-700">{row.fecha}</td>
                        <td className="py-3.5 text-carbon-600 font-mono">{row.entrada || '—'}</td>
                        <td className="py-3.5 text-carbon-600 font-mono">{row.salida || '—'}</td>
                        <td className="py-3.5 text-carbon-600 font-mono">{row.duracion}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.estado === 'Completado' ? 'bg-dangerus-100 text-dangerus-700' : 'bg-carbon-100 text-carbon-600'
                          }`}>{row.estado}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Fila 3: Horario semanal real ── */}
          <HorarioSemanal />

          {/* ── Fila 4: Noticias ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-carbon-900">Noticias Corporativas</h3>
              <button className="text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors">Ver todas</button>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {NOTICIAS.map((n, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-[11px] text-carbon-400">{n.fecha}</p>
                  <p className="font-semibold text-carbon-900 text-sm leading-snug">{n.titulo}</p>
                  <p className="text-xs text-carbon-500 leading-relaxed">{n.resumen}</p>
                  <button className="flex items-center gap-1 text-xs text-dangerus-500 hover:text-dangerus-600 font-medium mt-1 transition-colors">
                    Leer más <Ico.arrow />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Fila 5: Métricas reales ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricasReales.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl border border-carbon-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-carbon-400">{m.icon}</span>
                  <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">{m.label}</p>
                </div>
                {cargandoAsistencia && i < 2 ? (
                  <div className="h-9 bg-carbon-100 rounded animate-pulse w-20 mb-1" />
                ) : (
                  <p className="font-display font-bold text-3xl text-carbon-900">{m.valor}</p>
                )}
                <p className="text-xs text-carbon-400 mt-1">{m.sub}</p>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* BUG 3 FIX: Modal de confirmación para cerrar sesión */}
      <Modal
        abierto={modalLogout}
        titulo="Cerrar sesión"
        mensaje="¿Estás seguro de que deseas cerrar sesión? Asegúrate de haber finalizado tu turno antes de salir."
        confirmarTexto="Sí, cerrar sesión"
        cancelarTexto="Cancelar"
        onConfirmar={confirmarLogout}
        onCancelar={() => setModalLogout(false)}
      />
    </div>
  );
}
