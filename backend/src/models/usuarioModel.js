// ============================================================
// Modelo Usuario
// ============================================================
// Aquí están todas las funciones que hablan directamente con la
// tabla "usuarios" en la base de datos. El resto del código nunca
// escribe SQL de usuarios directamente: siempre pasa por aquí.
// ============================================================

const pool = require('../config/db');

/**
 * Busca un usuario por su número de cédula.
 * Se usa principalmente para el login.
 */
async function buscarPorCedula(cedula) {
  const resultado = await pool.query(
    `SELECT u.*, c.nombre AS campana_nombre
     FROM usuarios u
     LEFT JOIN campanas c ON c.id = u.campana_id
     WHERE u.cedula = $1`,
    [cedula]
  );
  return resultado.rows[0] || null;
}

/**
 * Busca un usuario por su id interno.
 */
async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT u.id, u.cedula, u.nombre, u.rol, u.campana_id, u.supervisor, u.activo,
            c.nombre AS campana_nombre
     FROM usuarios u
     LEFT JOIN campanas c ON c.id = u.campana_id
     WHERE u.id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

/**
 * Lista todos los usuarios (para el panel de administración).
 */
async function listarTodos() {
  const resultado = await pool.query(
    `SELECT u.id, u.cedula, u.nombre, u.rol, u.campana_id, u.supervisor, u.activo,
            c.nombre AS campana_nombre
     FROM usuarios u
     LEFT JOIN campanas c ON c.id = u.campana_id
     ORDER BY u.nombre ASC`
  );
  return resultado.rows;
}

/**
 * Crea un nuevo usuario. "passwordHash" ya debe venir cifrado con bcrypt,
 * este modelo nunca cifra contraseñas, eso es responsabilidad del controlador.
 */
async function crear({ cedula, nombre, passwordHash, rol, campanaId, supervisor }) {
  const resultado = await pool.query(
    `INSERT INTO usuarios (cedula, nombre, password_hash, rol, campana_id, supervisor)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, cedula, nombre, rol, campana_id, supervisor, activo`,
    [cedula, nombre, passwordHash, rol || 'empleado', campanaId || null, supervisor || null]
  );
  return resultado.rows[0];
}

/**
 * Actualiza datos básicos de un usuario (sin tocar la contraseña).
 */
async function actualizar(id, { nombre, rol, campanaId, supervisor, activo }) {
  const resultado = await pool.query(
    `UPDATE usuarios
     SET nombre = COALESCE($2, nombre),
         rol = COALESCE($3, rol),
         campana_id = COALESCE($4, campana_id),
         supervisor = COALESCE($5, supervisor),
         activo = COALESCE($6, activo)
     WHERE id = $1
     RETURNING id, cedula, nombre, rol, campana_id, supervisor, activo`,
    [id, nombre, rol, campanaId, supervisor, activo]
  );
  return resultado.rows[0] || null;
}

/**
 * Cambia la contraseña de un usuario (recibe el hash ya generado).
 */
async function actualizarPassword(id, passwordHash) {
  await pool.query(`UPDATE usuarios SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
}

/**
 * Actualiza solo el supervisor de un usuario.
 */
async function actualizarSupervisor(id, supervisor) {
  const resultado = await pool.query(
    `UPDATE usuarios SET supervisor = $2 WHERE id = $1 RETURNING supervisor`,
    [id, supervisor]
  );
  return resultado.rows[0] || null;
}

/**
 * Elimina un usuario (solo administradores deberían poder llamar esto).
 */
async function eliminar(id) {
  await pool.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
}

module.exports = {
  buscarPorCedula,
  buscarPorId,
  listarTodos,
  crear,
  actualizar,
  actualizarPassword,
  actualizarSupervisor,
  eliminar,
};