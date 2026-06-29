// ============================================================
// Componente: PanelControlTurno v2.0
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRelojEnVivo } from '../hooks/useRelojEnVivo';
import { useAuth } from '../context/AuthContext';
import * as turnoApi from '../api/turnoApi';
import Boton from './Boton';
import Modal from './Modal';
import ModalConfirmarPassword from './ModalConfirmarPassword';

const ETIQUETAS = {
  login: 'Iniciar turno',
  logout: 'Finalizar turno',
  break1_inicio: 'Iniciar Break 1',
  break1_fin: 'Volver de Break 1',
  almuerzo_inicio: 'Iniciar Almuerzo',
  almuerzo_fin: 'Volver de Almuerzo',
  break2_inicio: 'Iniciar Break 2',
  break2_fin: 'Volver de Break 2',
};

const ESTADOS = {
  null:           { texto: 'Turno no iniciado',  color: 'bg-carbon-100 text-carbon-600',      dot: 'bg-carbon-400'   },
  login:          { texto: 'Trabajando',          color: 'bg-green-50 text-green-700',          dot: 'bg-green-500'    },
  logout:         { texto: 'Turno finalizado',    color: 'bg-carbon-100 text-carbon-600',      dot: 'bg-carbon-400'   },
  break1_inicio:  { texto: 'En Break 1',          color: 'bg-dangerus-50 text-dangerus-700',   dot: 'bg-dangerus-400' },
  break1_fin:     { texto: 'Trabajando',          color: 'bg-green-50 text-green-700',          dot: 'bg-green-500'    },
  almuerzo_inicio:{ texto: 'En Almuerzo',         color: 'bg-dangerus-50 text-dangerus-700',   dot: 'bg-dangerus-400' },
  almuerzo_fin:   { texto: 'Trabajando',          color: 'bg-green-50 text-green-700',          dot: 'bg-green-500'    },
  break2_inicio:  { texto: 'En Break 2',          color: 'bg-dangerus-50 text-dangerus-700',   dot: 'bg-dangerus-400' },
  break2_fin:     { texto: 'Trabajando',          color: 'bg-green-50 text-green-700',          dot: 'bg-green-500'    },
};

const REQUIERE_PASSWORD = ['break1_fin', 'almuerzo_fin', 'break2_fin'];

// Ícono check-in
const IconCheckIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IconCheckOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);


export default function PanelControlTurno({ onEventoRegistrado } = {}) {
  const { usuario } = useAuth();
  const ahora = useRelojEnVivo();

  const [estado, setEstado] = useState(null);
  const [cargandoEstado, setCargandoEstado] = useState(true);
  const [eventoEnProceso, setEventoEnProceso] = useState(null);
  const [errorAccion, setErrorAccion] = useState('');
  const [eventoQuePideModal, setEventoQuePideModal] = useState(null);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarEstado = useCallback(async () => {
    try {
      const datos = await turnoApi.obtenerEstadoActual();
      setEstado(datos);
    } catch {
      setErrorAccion('No se pudo cargar el estado actual.');
    } finally {
      setCargandoEstado(false);
    }
  }, []);

  useEffect(() => { cargarEstado(); }, [cargarEstado]);

  async function ejecutarEvento(tipoEvento, password = null) {
    setEventoEnProceso(tipoEvento);
    setErrorAccion('');
    setErrorModal('');
    try {
      await turnoApi.registrarEvento(tipoEvento, password);
      setEventoQuePideModal(null);
      setMostrarConfirmacionSalida(false);
      await cargarEstado();
      if (onEventoRegistrado) onEventoRegistrado();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Ocurrió un error al registrar el evento.';
      if (eventoQuePideModal) setErrorModal(mensaje);
      else setErrorAccion(mensaje);
    } finally {
      setEventoEnProceso(null);
    }
  }

  function manejarClicBoton(tipoEvento) {
    if (tipoEvento === 'logout') { setMostrarConfirmacionSalida(true); return; }
    if (REQUIERE_PASSWORD.includes(tipoEvento)) { setEventoQuePideModal(tipoEvento); return; }
    ejecutarEvento(tipoEvento);
  }

  const tipoUltimoEvento = estado?.ultimoEvento?.tipo_evento ?? null;
  const infoEstado = ESTADOS[tipoUltimoEvento] || ESTADOS.null;
  const siguientesPermitidos = estado?.siguientesPermitidos || [];

  // Formato de hora: "12:45:00" y "PM" separados
  const horaStr = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const horaAmPm = ahora.getHours() >= 12 ? 'PM' : 'AM';
  const fechaStr = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="bg-white rounded-2xl border border-carbon-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          {/* Reloj + fecha + botones */}
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-carbon-400 uppercase tracking-wider mb-1">
              Hora actual
            </p>
            <div className="flex items-end gap-2">
              <p className="font-display font-bold text-5xl text-carbon-900 leading-none">{horaStr}</p>
              <p className="font-display font-bold text-3xl text-carbon-400 leading-none pb-0.5">{horaAmPm}</p>
            </div>
            <p className="text-carbon-400 text-sm mt-1.5 capitalize">{fechaStr}</p>

            {/* Badge estado */}
            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${infoEstado.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${infoEstado.dot}`} />
              {infoEstado.texto}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2 mt-5">
              {cargandoEstado && (
                <p className="text-sm text-carbon-400">Cargando estado...</p>
              )}
              {!cargandoEstado && siguientesPermitidos.map((tipoEvento) => {
                const esSalida = tipoEvento === 'logout';
                const esEntrada = tipoEvento === 'login';
                return (
                  <button
                    key={tipoEvento}
                    disabled={eventoEnProceso !== null}
                    onClick={() => manejarClicBoton(tipoEvento)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      esSalida
                        ? 'bg-carbon-100 text-carbon-600 hover:bg-carbon-200'
                        : esEntrada
                        ? 'bg-dangerus-500 text-white hover:bg-dangerus-600 shadow-sm'
                        : 'bg-dangerus-50 text-dangerus-700 hover:bg-dangerus-100'
                    }`}
                  >
                    {esSalida ? <IconCheckOut /> : <IconCheckIn />}
                    {eventoEnProceso === tipoEvento ? 'Registrando...' : ETIQUETAS[tipoEvento]}
                  </button>
                );
              })}
            </div>

            {errorAccion && (
              <p className="mt-3 text-sm text-red-500">{errorAccion}</p>
            )}
          </div>

          {/* Tarjeta ubicación del turno */}
          <div className="sm:w-44 flex-shrink-0">
            <div
              className="relative rounded-xl overflow-hidden h-36"
              style={{ background: 'linear-gradient(135deg, #103A33 0%, #1B6B4F 100%)' }}
            >
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #5DC4A8 0%, transparent 60%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-dangerus-200 text-[10px] font-semibold uppercase tracking-wider">Campaña</p>
                <p className="text-white text-sm font-bold mt-0.5">{usuario?.campana_nombre || 'Sin asignar'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {eventoQuePideModal && (
        <ModalConfirmarPassword
          titulo={ETIQUETAS[eventoQuePideModal]}
          cargando={eventoEnProceso !== null}
          error={errorModal}
          onCancelar={() => { setEventoQuePideModal(null); setErrorModal(''); }}
          onConfirmar={(password) => ejecutarEvento(eventoQuePideModal, password)}
        />
      )}
      <Modal
        abierto={mostrarConfirmacionSalida}
        titulo="Finalizar turno"
        mensaje="¿Está seguro de que desea finalizar su turno?"
        confirmarTexto="Sí, finalizar"
        cancelarTexto="Cancelar"
        onCancelar={() => setMostrarConfirmacionSalida(false)}
        onConfirmar={() => ejecutarEvento('logout')}
      />
    </>
  );
}