// ============================================================
// Modelo EventoTurno
// ============================================================
// Cada vez que un empleado hace login, logout, o entra/sale de un
// break o almuerzo, se guarda una fila aquí con la fecha y hora exacta.
// Con esta tabla se construyen el calendario, el cálculo de tardanzas
// y los reportes.
// ============================================================

const pool = require('../config/db');

const TIPOS_VALIDOS = [
  'login',
  'logout',
  'break1_inicio',
  'break1_fin',
  'almuerzo_inicio',
  'almuerzo_fin',
  'break2_inicio',
  'break2_fin',
];

/**
 * Registra un nuevo evento para un usuario.
 */
async function registrarEvento(usuarioId, tipoEvento) {
  if (!TIPOS_VALIDOS.includes(tipoEvento)) {
    throw new Error(`Tipo de evento inválido: ${tipoEvento}`);
  }

  const resultado = await pool.query(
    `INSERT INTO eventos_turno (usuario_id, tipo_evento, fecha_hora)
     VALUES ($1, $2, NOW())
     RETURNING id, usuario_id, tipo_evento, fecha_hora`,
    [usuarioId, tipoEvento]
  );

  return resultado.rows[0];
}

/**
 * Devuelve el último evento registrado por un usuario.
 */
async function obtenerUltimoEvento(usuarioId) {
  const resultado = await pool.query(
    `SELECT id, usuario_id, tipo_evento, fecha_hora
     FROM eventos_turno
     WHERE usuario_id = $1
     ORDER BY fecha_hora DESC
     LIMIT 1`,
    [usuarioId]
  );

  return resultado.rows[0] || null;
}

/**
 * Devuelve todos los eventos de un usuario dentro de un rango de fechas.
 */
async function obtenerEventosPorRango(usuarioId, fechaInicio, fechaFin) {
  const resultado = await pool.query(
    `SELECT id, usuario_id, tipo_evento, fecha_hora
     FROM eventos_turno
     WHERE usuario_id = $1
       AND fecha_hora >= $2
       AND fecha_hora <= $3
     ORDER BY fecha_hora ASC`,
    [usuarioId, fechaInicio, fechaFin]
  );

  return resultado.rows;
}

/**
 * Devuelve todos los eventos para reportes globales.
 */
async function obtenerEventosGlobalesPorRango(fechaInicio, fechaFin) {
  const resultado = await pool.query(
    `SELECT
        e.id,
        e.usuario_id,
        e.tipo_evento,
        e.fecha_hora,
        u.nombre,
        u.cedula,
        u.supervisor,
        c.nombre AS campana_nombre
     FROM eventos_turno e
     JOIN usuarios u
       ON u.id = e.usuario_id
     LEFT JOIN campanas c
       ON c.id = u.campana_id
     WHERE e.fecha_hora >= $1
       AND e.fecha_hora <= $2
     ORDER BY e.fecha_hora ASC`,
    [fechaInicio, fechaFin]
  );

  return resultado.rows;
}

// ============================================================
// Reportes con filtros
// ============================================================

async function obtenerReporte(filtros = {}) {
  const {
    fechaInicio,
    fechaFin,
    supervisor,
    campana,
  } = filtros;

  let sql = `
    SELECT
      e.fecha_hora,
      e.tipo_evento,
      u.cedula,
      u.nombre,
      u.supervisor,
      c.nombre AS campana
    FROM eventos_turno e
    INNER JOIN usuarios u
      ON e.usuario_id = u.id
    LEFT JOIN campanas c
      ON u.campana_id = c.id
    WHERE 1=1
  `;

  const valores = [];
  let indice = 1;

  if (fechaInicio) {
    sql += ` AND e.fecha_hora >= $${indice++}`;
    valores.push(fechaInicio);
  }

  if (fechaFin) {
    sql += ` AND e.fecha_hora <= $${indice++}`;
    valores.push(fechaFin);
  }

  if (supervisor) {
    sql += ` AND u.supervisor = $${indice++}`;
    valores.push(supervisor);
  }

  if (campana) {
    sql += ` AND c.nombre = $${indice++}`;
    valores.push(campana);
  }

  sql += ` ORDER BY e.fecha_hora DESC`;

  const resultado = await pool.query(sql, valores);

  return resultado.rows;
}

module.exports = {
  TIPOS_VALIDOS,
  registrarEvento,
  obtenerUltimoEvento,
  obtenerEventosPorRango,
  obtenerEventosGlobalesPorRango,
  obtenerReporte,
};