// ============================================================
// Modelo Malla (horario semanal planificado)
// ============================================================
// La "malla" es el horario que se espera que cumpla cada empleado
// cada día de la semana: hora de entrada, salida y pausas.
// ============================================================

const pool = require('../config/db');

/**
 * Devuelve la malla (horario) de un usuario para la semana que
 * comienza en "semanaInicio" (formato 'YYYY-MM-DD', debe ser un lunes).
 */
async function obtenerMallaSemana(usuarioId, semanaInicio) {
  const resultado = await pool.query(
    `SELECT * FROM mallas
     WHERE usuario_id = $1 AND semana_inicio = $2
     ORDER BY
       CASE dia_semana
         WHEN 'lunes' THEN 1
         WHEN 'martes' THEN 2
         WHEN 'miercoles' THEN 3
         WHEN 'jueves' THEN 4
         WHEN 'viernes' THEN 5
         WHEN 'sabado' THEN 6
         WHEN 'domingo' THEN 7
       END`,
    [usuarioId, semanaInicio]
  );
  return resultado.rows;
}

/**
 * Inserta o actualiza (upsert) un día de malla para un usuario.
 * Se usa tanto para carga manual como para la carga masiva por Excel.
 */
async function upsertDiaMalla(datos) {
  const {
    usuarioId, diaSemana, semanaInicio,
    horaEntrada, horaSalida,
    break1Inicio, break1Fin,
    almuerzoInicio, almuerzoFin,
    break2Inicio, break2Fin,
  } = datos;

  const resultado = await pool.query(
    `INSERT INTO mallas (
        usuario_id, dia_semana, semana_inicio,
        hora_entrada, hora_salida,
        break1_inicio, break1_fin,
        almuerzo_inicio, almuerzo_fin,
        break2_inicio, break2_fin
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (usuario_id, dia_semana, semana_inicio)
     DO UPDATE SET
        hora_entrada = EXCLUDED.hora_entrada,
        hora_salida = EXCLUDED.hora_salida,
        break1_inicio = EXCLUDED.break1_inicio,
        break1_fin = EXCLUDED.break1_fin,
        almuerzo_inicio = EXCLUDED.almuerzo_inicio,
        almuerzo_fin = EXCLUDED.almuerzo_fin,
        break2_inicio = EXCLUDED.break2_inicio,
        break2_fin = EXCLUDED.break2_fin
     RETURNING *`,
    [
      usuarioId, diaSemana, semanaInicio,
      horaEntrada || null, horaSalida || null,
      break1Inicio || null, break1Fin || null,
      almuerzoInicio || null, almuerzoFin || null,
      break2Inicio || null, break2Fin || null,
    ]
  );
  return resultado.rows[0];
}

module.exports = {
  obtenerMallaSemana,
  upsertDiaMalla,
};
