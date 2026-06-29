// ============================================================
// Componente: PanelControlTurno
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRelojEnVivo } from '../hooks/useRelojEnVivo';
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
  null: { texto: 'Turno no iniciado', color: 'bg-carbon-200 text-carbon-700' },
  login: { texto: 'Trabajando', color: 'bg-green-100 text-green-700' },
  logout: { texto: 'Turno finalizado', color: 'bg-carbon-200 text-carbon-700' },
  break1_inicio: { texto: 'En Break 1', color: 'bg-dangerus-100 text-dangerus-700' },
  break1_fin: { texto: 'Trabajando', color: 'bg-green-100 text-green-700' },
  almuerzo_inicio: { texto: 'En Almuerzo', color: 'bg-dangerus-100 text-dangerus-700' },
  almuerzo_fin: { texto: 'Trabajando', color: 'bg-green-100 text-green-700' },
  break2_inicio: { texto: 'En Break 2', color: 'bg-dangerus-100 text-dangerus-700' },
  break2_fin: { texto: 'Trabajando', color: 'bg-green-100 text-green-700' },
};

const REQUIERE_PASSWORD = [
  'break1_fin',
  'almuerzo_fin',
  'break2_fin',
];

export default function PanelControlTurno() {
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

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);

  async function ejecutarEvento(tipoEvento, password = null) {
    setEventoEnProceso(tipoEvento);
    setErrorAccion('');
    setErrorModal('');

    try {
      await turnoApi.registrarEvento(tipoEvento, password);

      setEventoQuePideModal(null);
      setMostrarConfirmacionSalida(false);

      await cargarEstado();
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        'Ocurrió un error al registrar el evento.';

      if (eventoQuePideModal) {
        setErrorModal(mensaje);
      } else {
        setErrorAccion(mensaje);
      }
    } finally {
      setEventoEnProceso(null);
    }
  }

  function manejarClicBoton(tipoEvento) {
    if (tipoEvento === 'logout') {
      setMostrarConfirmacionSalida(true);
      return;
    }

    if (REQUIERE_PASSWORD.includes(tipoEvento)) {
      setEventoQuePideModal(tipoEvento);
      return;
    }

    ejecutarEvento(tipoEvento);
  }

  const tipoUltimoEvento = estado?.ultimoEvento?.tipo_evento ?? null;
  const infoEstado = ESTADOS[tipoUltimoEvento] || ESTADOS.null;
  const siguientesPermitidos = estado?.siguientesPermitidos || [];
  console.log("Estado:", estado);
  console.log("Siguientes:", siguientesPermitidos);

  return (
    <>
      <div className="bg-carbon-900 rounded-2xl shadow-card p-8 text-white">

        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-5xl sm:text-6xl font-semibold">
            {ahora.toLocaleTimeString('es-CO')}
          </p>

          <p className="text-carbon-400 text-sm mt-2">
            {ahora.toLocaleDateString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>

          <div
            className={`mt-5 px-4 py-2 rounded-full text-sm font-semibold ${infoEstado.color}`}
          >
            {infoEstado.texto}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">

          {cargandoEstado && (
            <p className="text-center col-span-2">
              Cargando...
            </p>
          )}

          {!cargandoEstado &&
            siguientesPermitidos.map((tipoEvento) => (
              <Boton
                key={tipoEvento}
                variante={
                  tipoEvento === 'logout'
                    ? 'peligro'
                    : 'primario'
                }
                fullWidth
                disabled={eventoEnProceso !== null}
                onClick={() => manejarClicBoton(tipoEvento)}
              >
                {eventoEnProceso === tipoEvento
                  ? 'Registrando...'
                  : ETIQUETAS[tipoEvento]}
              </Boton>
            ))}

        </div>

        {errorAccion && (
          <p className="mt-4 text-center text-red-400">
            {errorAccion}
          </p>
        )}
      </div>

      {eventoQuePideModal && (
        <ModalConfirmarPassword
          titulo={ETIQUETAS[eventoQuePideModal]}
          cargando={eventoEnProceso !== null}
          error={errorModal}
          onCancelar={() => {
            setEventoQuePideModal(null);
            setErrorModal('');
          }}
          onConfirmar={(password) =>
            ejecutarEvento(eventoQuePideModal, password)
          }
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