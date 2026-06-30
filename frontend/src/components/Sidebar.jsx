// ============================================================
// Componente Sidebar compartido — todos los roles
// ============================================================
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const Ico = {
  shield:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dash:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  calendar: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chart:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  grid:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  inbox:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  settings: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  file:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};

function NavItem({ icon, label, to, activo, badge }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      activo ? 'bg-dangerus-500 text-white' : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900'
    }`}>
      <span className={activo ? 'text-white' : 'text-carbon-400'}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activo ? 'bg-white/30 text-white' : 'bg-dangerus-500 text-white'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ solicitudesPendientes = 0 }) {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navegar = useNavigate();
  const [modalLogout, setModalLogout] = useState(false);
  const [modalEnTurno, setModalEnTurno] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  const enTurno = usuario?.enTurno; // se pasa desde contexto si está en turno

  const ruta = location.pathname;
  const esAdmin = usuario?.rol === 'administrador';
  const esSupervisor = usuario?.rol === 'supervisor';

  const navEmpleado = [
    { icon: <Ico.dash />,     label: 'Dashboard',     to: '/dashboard',    path: '/dashboard' },
    { icon: <Ico.calendar />, label: 'Mi Horario',    to: '/mi-horario',   path: '/mi-horario' },
    { icon: <Ico.file />,     label: 'Mis Reportes',  to: '/mis-reportes', path: '/mis-reportes' },
  ];
  const navSupervisor = [
    { icon: <Ico.dash />,     label: 'Dashboard',     to: '/dashboard',    path: '/dashboard' },
    { icon: <Ico.calendar />, label: 'Mi Horario',    to: '/mi-horario',   path: '/mi-horario' },
    { icon: <Ico.chart />,    label: 'Reportes',      to: '/admin/reportes', path: '/admin/reportes' },
    { icon: <Ico.inbox />,    label: 'Solicitudes',   to: '/supervisor/solicitudes', path: '/supervisor/solicitudes', badge: solicitudesPendientes },
  ];
  const navAdmin = [
    { icon: <Ico.dash />,     label: 'Dashboard',     to: '/dashboard',     path: '/dashboard' },
    { icon: <Ico.users />,    label: 'Usuarios',      to: '/admin/usuarios', path: '/admin/usuarios' },
    { icon: <Ico.grid />,     label: 'Mallas',        to: '/admin/mallas',   path: '/admin/mallas' },
    { icon: <Ico.chart />,    label: 'Reportes',      to: '/admin/reportes', path: '/admin/reportes' },
    { icon: <Ico.inbox />,    label: 'Solicitudes',   to: '/supervisor/solicitudes', path: '/supervisor/solicitudes', badge: solicitudesPendientes },
  ];

  const items = esAdmin ? navAdmin : esSupervisor ? navSupervisor : navEmpleado;

  function pedirLogout() {
    // Verificar si está en turno consultando estado actual
    setModalLogout(true);
  }

  function confirmarLogout() {
    cerrarSesion();
    navegar('/login');
  }

  return (
    <>
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-carbon-100 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-carbon-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-dangerus-500 flex items-center justify-center">
              <Ico.shield />
            </div>
            <div>
              <p className="font-display font-bold text-carbon-900 text-sm leading-tight">DGUS</p>
              <p className="text-[10px] text-carbon-400 capitalize leading-tight">{usuario?.rol}</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {items.map(it => (
            <NavItem key={it.label} icon={it.icon} label={it.label} to={it.to}
              activo={ruta === it.path || (it.path === '/dashboard' && ruta === '/dashboard')}
              badge={it.badge} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-carbon-100 space-y-0.5">
          <button
            onClick={() => setModalConfig(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900 transition-colors"
          >
            <span className="text-carbon-400"><Ico.settings /></span> Configuración
          </button>
          <button
            onClick={pedirLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-carbon-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="text-carbon-400"><Ico.logout /></span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Modal confirmar logout */}
      <Modal
        abierto={modalLogout}
        titulo="Cerrar sesión"
        mensaje="¿Estás seguro de que deseas cerrar sesión? Asegúrate de haber finalizado tu turno antes de salir."
        confirmarTexto="Sí, cerrar sesión"
        cancelarTexto="Cancelar"
        onConfirmar={confirmarLogout}
        onCancelar={() => setModalLogout(false)}
      />

      {/* Modal en turno */}
      <Modal
        abierto={modalEnTurno}
        titulo="Turno activo"
        mensaje="Tienes un turno en curso. Debes finalizar tu turno antes de cerrar sesión."
        confirmarTexto="Entendido"
        cancelarTexto=""
        onConfirmar={() => setModalEnTurno(false)}
        onCancelar={() => setModalEnTurno(false)}
      />

      {/* Modal configuración */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-100">
              <h2 className="font-semibold text-carbon-900">Configuración</h2>
              <button onClick={() => setModalConfig(false)} className="text-carbon-400 hover:text-carbon-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1">Perfil</p>
                <div className="bg-carbon-50 rounded-xl p-3 space-y-1">
                  <p className="text-sm font-semibold text-carbon-800">{usuario?.nombre}</p>
                  <p className="text-xs text-carbon-500">Cédula: {usuario?.cedula}</p>
                  <p className="text-xs text-carbon-500 capitalize">Rol: {usuario?.rol}</p>
                  {usuario?.campana && <p className="text-xs text-carbon-500">Campaña: {usuario.campana}</p>}
                  {usuario?.supervisor && <p className="text-xs text-carbon-500">Supervisor: {usuario.supervisor}</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-carbon-400 uppercase tracking-wider mb-1">Sistema</p>
                <div className="bg-carbon-50 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-carbon-500">Versión: DGUS 2.1.0</p>
                  <p className="text-xs text-carbon-500">Entorno: Producción</p>
                </div>
              </div>
              <button
                onClick={() => { setModalConfig(false); setModalLogout(true); }}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
