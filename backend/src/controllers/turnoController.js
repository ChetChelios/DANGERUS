// ============================================================
// Controlador: Eventos de turno (logueo, deslogueo, pausas)
// ============================================================
// Aquí está la lógica del "reloj" de cada empleado: cuándo entra,
// cuándo sale, cuándo se va a break/almuerzo y cuándo regresa.
// ============================================================

const bcrypt = require('bcryptjs');
const eventoModel = require('../models/eventoModel');
const usuarioModel = require('../models/usuarioModel');

// Define qué evento puede seguir a cuál, para no permitir, por ejemplo,
// que alguien marque "fin de almuerzo" sin haber marcado "inicio de almuerzo" antes.
const TRANSICIONES_VALIDAS = {
  null: ['login'],
  logout: ['login'],
  login: ['logout', 'break1_inicio', 'almuerzo_inicio', 'break2_inicio'],
  break1_inicio: ['break1_fin'],
  break1_fin: ['logout', 'almuerzo_inicio', 'break2_inicio'],
  almuerzo_inicio: ['almuerzo_fin'],
  almuerzo_fin: ['logout', 'break1_inicio', 'break2_inicio'],
  break2_inicio: ['break2_fin'],
  break2_fin: ['logout'],
};

// Estos eventos representan "salir" de una actividad y requieren
// que el usuario vuelva a confirmar su contraseña para registrar el regreso.
const EVENTOS_QUE_REQUIEREN_PASSWORD_AL_VOLVER = [
  'break1_inicio', 'almuerzo_inicio', 'break2_inicio',
];

/**
 * GET /api/turnos/estado
 * Devuelve el estado actual del empleado: cuál fue su último evento,
 * y qué eventos puede registrar a continuación.
 */
async function obtenerEstadoActual(req, res) {
  try {
    const ultimo = await eventoModel.obtenerUltimoEvento(req.usuario.id);
    const tipoAnterior = ultimo ? ultimo.tipo_evento : null;
    const siguientesPermitidos = TRANSICIONES_VALIDAS[tipoAnterior] || [];

    return res.json({
      ultimoEvento: ultimo,
      siguientesPermitidos,
    });
  } catch (err) {
    console.error('Error obteniendo estado actual:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/turnos/evento
 * Body: { tipoEvento, password? }
 * Registra un nuevo evento, validando que la transición sea lógica.
 * Si el evento es un "regreso" de pausa, exige la contraseña.
 */
async function registrarEvento(req, res) {
  try {
    const { tipoEvento, password } = req.body;

    if (!eventoModel.TIPOS_VALIDOS.includes(tipoEvento)) {
      return res.status(400).json({ error: 'Tipo de evento inválido.' });
    }

    const ultimo = await eventoModel.obtenerUltimoEvento(req.usuario.id);
    const tipoAnterior = ultimo ? ultimo.tipo_evento : null;
    const permitido = (TRANSICIONES_VALIDAS[tipoAnterior] || []).includes(tipoEvento);

    if (!permitido) {
      return res.status(409).json({
        error: `No puedes registrar "${tipoEvento}" en este momento. Tu último evento fue "${tipoAnterior || 'ninguno'}".`,
      });
    }

    // Si el evento anterior fue un "inicio de pausa" y ahora se registra
    // el "fin" de esa misma pausa, pedimos confirmar contraseña.
    const esRegresoDePausa = EVENTOS_QUE_REQUIEREN_PASSWORD_AL_VOLVER.includes(tipoAnterior)
      && tipoEvento.endsWith('_fin');

    if (esRegresoDePausa) {
      if (!password) {
        return res.status(400).json({ error: 'Debes confirmar tu contraseña para registrar el regreso.' });
      }
      const usuarioConHash = await usuarioModel.buscarPorCedula(req.usuario.cedula);
      const passwordCorrecta = await bcrypt.compare(password, usuarioConHash.password_hash);
      if (!passwordCorrecta) {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
      }
    }

    const evento = await eventoModel.registrarEvento(req.usuario.id, tipoEvento);

    return res.status(201).json({ evento });
  } catch (err) {
    console.error('Error registrando evento:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/turnos/calendario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Devuelve los eventos del empleado logueado en un rango de fechas,
 * para construir el calendario de asistencia/tardanzas en el frontend.
 */
async function obtenerCalendario(req, res) {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Debes indicar los parámetros "desde" y "hasta".' });
    }
    const eventos = await eventoModel.obtenerEventosPorRango(req.usuario.id, desde, hasta);
    return res.json({ eventos });
  } catch (err) {
    console.error('Error obteniendo calendario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = { obtenerEstadoActual, registrarEvento, obtenerCalendario };
