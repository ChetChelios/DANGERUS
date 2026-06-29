// ============================================================
// Dashboard DGUS v2.0 — Layout sidebar + contenido principal
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PanelControlTurno from '../components/PanelControlTurno';
import HorarioSemanal from '../components/HorarioSemanal';

// ── Íconos inline SVG ──────────────────────────────────────
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCalCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Datos mock para la tabla de asistencia ─────────────────
const ASISTENCIA_RECIENTE = [
  { fecha: '27 Jun, 2026', entrada: '08:02 AM', salida: '05:10 PM', duracion: '9h 08m', estado: 'Completado' },
  { fecha: '26 Jun, 2026', entrada: '08:15 AM', salida: '05:00 PM', duracion: '8h 45m', estado: 'Completado' },
  { fecha: '25 Jun, 2026', entrada: '08:30 AM', salida: '01:00 PM', duracion: '4h 30m', estado: 'Parcial' },
];

const NOTICIAS = [
  {
    fecha: '28 Jun, 2026',
    titulo: 'Nuevo sistema de turnos activo',
    resumen: 'A partir de hoy el sistema DGUS gestiona todos los registros de entrada y salida de forma automática...',
  },
  {
    fecha: '25 Jun, 2026',
    titulo: 'Capacitación en seguridad',
    resumen: 'Recordamos a todos los colaboradores completar el módulo obligatorio de seguridad antes del 30 de junio...',
  },
  {
    fecha: '20 Jun, 2026',
    titulo: 'Evento de integración mensual',
    resumen: '¡No te pierdas nuestro próximo convivio corporativo! Celebraremos los logros del semestre...',
  },
];

// ── Componente principal ───────────────────────────────────
export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const esAdmin = usuario?.rol === 'administrador';

  function handleLogout() {
    cerrarSesion();
    navegar('/login');
  }

  // Nav items dinámicos según rol
  const navItems = [
    { icon: <IconDashboard />, label: 'Dashboard', to: '/dashboard', activo: true },
    { icon: <IconCalendar />, label: 'Mi Horario', to: '/dashboard' },
    ...(esAdmin ? [
      { icon: <IconUsers />, label: 'Usuarios', to: '/admin/usuarios' },
      { icon: <IconGrid />, label: 'Mallas', to: '/admin/mallas' },
      { icon: <IconChart />, label: 'Reportes', to: '/admin/reportes' },
      { icon: <IconRefresh />, label: 'Reactivar', to: '/admin/reactivar' },
    ] : [
      { icon: <IconChart />, label: 'Mis Reportes', to: '/dashboard' },
    ]),
  ];

  return (
    <div className="flex min-h-screen bg-carbon-50 font-sans">

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-carbon-100 fixed inset-y-0 left-0 z-30">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-carbon-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-dangerus-500 flex items-center justify-center">
              <IconShield />
            </div>
            <div>
              <p className="font-display font-bold text-carbon-900 text-sm leading-tight">DGUS</p>
              <p className="text-[10px] text-carbon-400 leading-tight">Edición Empresarial</p>
            </div>
          </div>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.activo
                  ? 'bg-dangerus-500 text-white'
                  : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900'
              }`}
            >
              <span className={item.activo ? 'text-white' : 'text-carbon-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
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

      {/* ══════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ══════════════════════════════════════════ */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-carbon-100 sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-dangerus-500 flex items-center justify-center">
                <IconShield />
              </div>
              <span className="font-display font-bold text-carbon-900 text-sm">DGUS</span>
            </div>
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-carbon-50 border border-carbon-200 rounded-xl px-3 py-2 w-64">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-carbon-300">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar datos..."
                className="bg-transparent text-sm text-carbon-600 placeholder:text-carbon-300 outline-none w-full"
              />
            </div>
          </div>

          {/* Right: user */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg border border-carbon-200 flex items-center justify-center text-carbon-400 hover:bg-carbon-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-lg border border-carbon-200 flex items-center justify-center text-carbon-400 hover:bg-carbon-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-dangerus-500 flex items-center justify-center text-white text-xs font-bold">
              {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Área de scroll */}
        <main className="flex-1 p-6 space-y-6 max-w-5xl">

          {/* ── Fila 1: Panel turno + resumen semanal ── */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Panel control turno (ocupa 2 cols) */}
            <div className="lg:col-span-2">
              <PanelControlTurno />
            </div>

            {/* Resumen semanal */}
            <div className="bg-white rounded-2xl border border-carbon-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-carbon-900 text-sm">Resumen Semanal</h3>
                <button className="text-carbon-300 hover:text-carbon-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>

              <div>
                <p className="text-xs text-carbon-400 mb-1">Horas trabajadas esta semana</p>
                <p className="font-display font-bold text-dangerus-500 text-3xl">32.5 <span className="text-carbon-300 text-xl">/ 40</span></p>
                <div className="mt-2 h-1.5 bg-carbon-100 rounded-full overflow-hidden">
                  <div className="h-full bg-dangerus-400 rounded-full" style={{ width: '81%' }} />
                </div>
              </div>

              <div className="pt-2 border-t border-carbon-100">
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1.5">Próximo turno</p>
                <p className="text-sm font-semibold text-carbon-800">
                  {new Date(Date.now() + 86400000).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}, 09:00 AM
                </p>
                <p className="text-xs text-carbon-400 mt-0.5">Turno regular · 8h</p>
              </div>

              {/* CTA solicitar permiso */}
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

          {/* ── Fila 2: Tabla de asistencia reciente ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-carbon-900">Asistencia Reciente</h3>
              <button className="text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors">
                Ver todos los registros
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b border-carbon-100">
                    {['FECHA', 'ENTRADA', 'SALIDA', 'DURACIÓN', 'ESTADO'].map((h) => (
                      <th key={h} className="pb-3 text-left text-[10px] font-semibold text-carbon-400 tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASISTENCIA_RECIENTE.map((row, i) => (
                    <tr key={i} className="border-b border-carbon-50 last:border-0">
                      <td className="py-3.5 text-carbon-700">{row.fecha}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.entrada}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.salida}</td>
                      <td className="py-3.5 text-carbon-600 font-mono">{row.duracion}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.estado === 'Completado'
                            ? 'bg-dangerus-100 text-dangerus-700'
                            : 'bg-carbon-100 text-carbon-600'
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

          {/* ── Fila 3: Mi horario semanal (full width) ── */}
          <HorarioSemanal />

          {/* ── Fila 4: Noticias corporativas ── */}
          <div className="bg-white rounded-2xl border border-carbon-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-carbon-900">Noticias Corporativas</h3>
              <button className="text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors">
                Ver todas
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {NOTICIAS.map((n, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-[11px] text-carbon-400">{n.fecha}</p>
                  <p className="font-semibold text-carbon-900 text-sm leading-snug">{n.titulo}</p>
                  <p className="text-xs text-carbon-500 leading-relaxed">{n.resumen}</p>
                  <button className="flex items-center gap-1 text-xs text-dangerus-500 hover:text-dangerus-600 font-medium transition-colors mt-1">
                    Leer más <IconArrow />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Fila 5: Métricas personales ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-carbon-400"><IconClock /></span>
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">Puntualidad</p>
              </div>
              <p className="font-display font-bold text-3xl text-carbon-900">98.2%</p>
              <p className="flex items-center gap-1 text-xs text-green-600 mt-1 font-medium">
                <IconTrend /> 1.4% vs mes anterior
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-carbon-400"><IconCalCheck /></span>
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">Días de permiso</p>
              </div>
              <p className="font-display font-bold text-3xl text-carbon-900">12</p>
              <p className="text-xs text-carbon-400 mt-1">Próxima acumulación: 1 Jul</p>
            </div>

            <div className="bg-white rounded-2xl border border-carbon-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-carbon-400"><IconStar /></span>
                <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider">Desempeño</p>
              </div>
              <p className="font-display font-bold text-3xl text-carbon-900">Top 5%</p>
              <p className="text-xs text-carbon-400 mt-1">Empleado categoría Oro</p>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}