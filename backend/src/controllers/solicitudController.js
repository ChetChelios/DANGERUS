const pool = require('../config/db');

async function crear(req, res) {
  try {
    const { fechaInicio, fechaFin, tipo, motivo } = req.body;
    if (!fechaInicio || !fechaFin) return res.status(400).json({ error: 'Fechas requeridas.' });
    
    // BUG 4 FIX: Buscar supervisor con coincidencia más flexible (trim + ILIKE)
    const emp = await pool.query(`SELECT supervisor FROM usuarios WHERE id=$1`, [req.usuario.id]);
    let supervisorId = null;
    const supervisorNombre = emp.rows[0]?.supervisor?.trim();
    if (supervisorNombre) {
      // Primero buscar exacto, luego por ILIKE
      const sup = await pool.query(
        `SELECT id FROM usuarios 
         WHERE (nombre = $1 OR nombre ILIKE $2) 
           AND (rol='supervisor' OR rol='administrador') 
           AND activo = TRUE
         LIMIT 1`,
        [supervisorNombre, `%${supervisorNombre}%`]
      );
      supervisorId = sup.rows[0]?.id || null;
    }
    
    const r = await pool.query(
      `INSERT INTO solicitudes_ausencia (empleado_id, supervisor_id, fecha_inicio, fecha_fin, tipo, motivo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.usuario.id, supervisorId, fechaInicio, fechaFin, tipo || 'ausencia', motivo || null]
    );
    res.status(201).json({ solicitud: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error creando solicitud.' }); }
}

async function misSolicitudes(req, res) {
  try {
    const r = await pool.query(
      `SELECT s.*, u.nombre AS supervisor_nombre
       FROM solicitudes_ausencia s LEFT JOIN usuarios u ON u.id = s.supervisor_id
       WHERE s.empleado_id = $1 ORDER BY s.creado_en DESC`,
      [req.usuario.id]
    );
    res.json({ solicitudes: r.rows });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
}

async function paraRevisar(req, res) {
  try {
    let r;
    if (req.usuario.rol === 'administrador') {
      r = await pool.query(
        `SELECT s.*, u.nombre AS empleado_nombre, u.cedula AS empleado_cedula,
                sup.nombre AS supervisor_nombre
         FROM solicitudes_ausencia s
         JOIN usuarios u ON u.id = s.empleado_id
         LEFT JOIN usuarios sup ON sup.id = s.supervisor_id
         ORDER BY s.creado_en DESC`
      );
    } else {
      // BUG 4 FIX: El supervisor también ve solicitudes donde su nombre coincide (por si supervisor_id es null)
      r = await pool.query(
        `SELECT s.*, u.nombre AS empleado_nombre, u.cedula AS empleado_cedula
         FROM solicitudes_ausencia s JOIN usuarios u ON u.id = s.empleado_id
         WHERE s.supervisor_id = $1 
            OR (s.supervisor_id IS NULL AND u.supervisor ILIKE $2)
         ORDER BY s.creado_en DESC`,
        [req.usuario.id, `%${req.usuario.nombre}%`]
      );
    }
    res.json({ solicitudes: r.rows });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
}

async function responder(req, res) {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    if (!['aprobada','rechazada'].includes(estado)) return res.status(400).json({ error: 'Estado inválido.' });
    const r = await pool.query(
      `UPDATE solicitudes_ausencia SET estado=$1, respuesta_supervisor=$2, respondido_en=NOW()
       WHERE id=$3 RETURNING *`,
      [estado, respuesta || null, id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    res.json({ solicitud: r.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
}

module.exports = { crear, misSolicitudes, paraRevisar, responder };
