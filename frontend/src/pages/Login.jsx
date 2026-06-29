// ============================================================
// Página: Login DGUS v2.0 — Layout split-screen estilo enterprise
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Boton from '../components/Boton';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recordar, setRecordar] = useState(false);

  const { iniciarSesion, cargando } = useAuth();
  const navegar = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await iniciarSesion(cedula, password);
      navegar('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error || 'No fue posible iniciar sesión.'
      );
    }
  }

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Panel izquierdo: formulario ── */}
      <div className="w-full lg:w-[42%] flex flex-col justify-between bg-white px-10 py-10 md:px-14">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-dangerus-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-carbon-800 text-lg tracking-tight">DGUS</span>
        </div>

        {/* Formulario central */}
        <div className="max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl font-bold text-carbon-900 mb-1">
            Portal de Acceso
          </h1>
          <p className="text-carbon-400 text-sm mb-8">
            Sistema de Gestión de Turnos Institucional
          </p>

          <form onSubmit={manejarSubmit} className="space-y-5">

            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-1.5">
                Cédula
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-carbon-200 text-carbon-800 placeholder:text-carbon-300 text-sm focus:border-dangerus-500 focus:ring-2 focus:ring-dangerus-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-carbon-700">
                  Contraseña
                </label>
                <button type="button" className="text-xs text-dangerus-500 hover:text-dangerus-600 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-carbon-200 text-carbon-800 placeholder:text-carbon-300 text-sm focus:border-dangerus-500 focus:ring-2 focus:ring-dangerus-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Recordar sesión */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="w-4 h-4 rounded border-carbon-300 text-dangerus-500 accent-dangerus-500"
              />
              <span className="text-sm text-carbon-600">Mantener sesión activa</span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              fullWidth
              disabled={cargando}
              className="py-3.5 text-base rounded-xl flex items-center justify-center gap-2"
            >
              {cargando ? 'Ingresando...' : (
                <>
                  Ingresar al Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </Boton>

          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-carbon-300">
          © 2026 DGUS · Sistema Inteligente de Gestión de Turnos
        </p>
      </div>

      {/* ── Panel derecho: fondo oscuro con imagen y tarjeta de stats ── */}
      <div
        className="hidden lg:flex flex-1 relative items-end justify-end p-10"
        style={{
          background: 'linear-gradient(135deg, #0B2620 0%, #103A33 40%, #1B1B18 100%)',
        }}
      >
        {/* Overlay de textura sutil */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 35%, #2D8B6B 0%, transparent 50%),
                              radial-gradient(circle at 80% 70%, #1B6B4F 0%, transparent 40%)`,
          }}
        />

        {/* Tarjeta de stats */}
        <div
          className="relative z-10 w-full max-w-xs rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Header tarjeta */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-dangerus-500/80 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Infraestructura Segura</p>
              <p className="text-dangerus-300 text-xs">Cifrado AES-256</p>
            </div>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mb-5">
            Tecnología de nivel enterprise para mantener los datos de tu organización seguros, disponibles y auditables.
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <p className="text-white text-2xl font-bold font-display">99.9%</p>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">Uptime</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold font-display">ISO</p>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">27001 Cert.</p>
            </div>
          </div>
        </div>

        {/* Texto inferior derecha */}
        <p
          className="absolute bottom-6 right-10 text-xs tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Protocolos de Seguridad Activos
        </p>
      </div>

    </div>
  );
}