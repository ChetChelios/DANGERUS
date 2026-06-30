const pool = require('../config/db');

const TIPOS_VALIDOS = [
  'login','logout',
  'break1_inicio','break1_fin',
  'almuerzo_inicio','almuerzo_fin',
  'break2_inicio','break2_fin',
];

// Verifica una sola vez si las columnas snapshot existen en la tabla
let _columnasSnapshotExisten = null;
async function columnasSnapshotExisten() {
  if (_columnasSnapshotExisten !== null) return _columnasSnapshotExisten;
  const r = await pool.query(`
    SELECT COUNT(*) AS total FROM information_schema.columns
    WHERE table_name = 'eventos_turno'
      AND column_name IN ('supervisor_snapshot', 'campana_snapshot')
  `);
  _columnasSnapshotExisten = parseInt(r.rows[0].total) === 2;
  return _columnasSnapshotExisten;
}

async function registrarEvento(usuarioId, tipoEvento) {
  if (!TIPOS_VALIDOS.includes(tipoEvento)) throw new Error(`Tipo inválido: ${tipoEvento}`);

  const conSnapshot = await columnasSnapshotExisten();

  if (conSnapshot) {
    // Capturar snapshot de supervisor y campaña en este momento
    const snap = await pool.query(
      `SELECT u.supervisor, c.nombre AS campana_nombre
       FROM usuarios u LEFT JOIN campanas c ON c.id = u.campana_id
       WHERE u.id = $1`, [usuarioId]
    );
    const { supervisor, campana_nombre } = snap.rows[0] || {};
    const resultado = await pool.query(
      `INSERT INTO eventos_turno (usuario_id, tipo_evento, fecha_hora, supervisor_snapshot, campana_snapshot)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING id, usuario_id, tipo_evento, fecha_hora, supervisor_snapshot, campana_snapshot`,
      [usuarioId, tipoEvento, supervisor || null, campana_nombre || null]
    );
    return resultado.rows[0];
  } else {
    // Las columnas snapshot aún no existen en la BD — insertar sin ellas
    const resultado = await pool.query(
      `INSERT INTO eventos_turno (usuario_id, tipo_evento, fecha_hora)
       VALUES ($1, $2, NOW())
       RETURNING id, usuario_id, tipo_evento, fecha_hora`,
      [usuarioId, tipoEvento]
    );
    return resultado.rows[0];
  }
}

async function obtenerUltimoEvento(usuarioId) {
  const r = await pool.query(
    `SELECT * FROM eventos_turno WHERE usuario_id = $1 ORDER BY fecha_hora DESC LIMIT 1`,
    [usuarioId]
  );
  return r.rows[0] || null;
}

async function obtenerEventosPorRango(usuarioId, fechaInicio, fechaFin) {
  const r = await pool.query(
    `SELECT * FROM eventos_turno
     WHERE usuario_id = $1 AND fecha_hora >= $2 AND fecha_hora <= $3
     ORDER BY fecha_hora ASC`,
    [usuarioId, fechaInicio, fechaFin]
  );
  return r.rows;
}

async function obtenerReporte(filtros = {}) {
  const { fechaInicio, fechaFin, supervisor, campana, cedula, nombre } = filtros;
  const conSnapshot = await columnasSnapshotExisten();

  const supervisorCol = conSnapshot
    ? `COALESCE(e.supervisor_snapshot, u.supervisor)`
    : `u.supervisor`;
  const campanaCol = conSnapshot
    ? `COALESCE(e.campana_snapshot, c.nombre)`
    : `c.nombre`;

  let sql = `
    SELECT e.id, e.fecha_hora, e.tipo_evento,
           u.cedula, u.nombre,
           ${supervisorCol} AS supervisor,
           ${campanaCol} AS campana
    FROM eventos_turno e
    INNER JOIN usuarios u ON e.usuario_id = u.id
    LEFT JOIN campanas c ON u.campana_id = c.id
    WHERE 1=1
  `;
  const vals = []; let i = 1;
  if (fechaInicio) { sql += ` AND e.fecha_hora >= $${i++}`; vals.push(fechaInicio); }
  if (fechaFin)    { sql += ` AND e.fecha_hora <= $${i++}`; vals.push(fechaFin + ' 23:59:59'); }
  if (supervisor)  { sql += ` AND ${supervisorCol} ILIKE $${i++}`; vals.push(`%${supervisor}%`); }
  if (campana)     { sql += ` AND ${campanaCol} ILIKE $${i++}`; vals.push(`%${campana}%`); }
  if (cedula)      { sql += ` AND u.cedula ILIKE $${i++}`; vals.push(`%${cedula}%`); }
  if (nombre)      { sql += ` AND u.nombre ILIKE $${i++}`; vals.push(`%${nombre}%`); }
  sql += ` ORDER BY e.fecha_hora DESC LIMIT 2000`;
  const r = await pool.query(sql, vals);
  return r.rows;
}

module.exports = { TIPOS_VALIDOS, registrarEvento, obtenerUltimoEvento, obtenerEventosPorRango, obtenerReporte };
