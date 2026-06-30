const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const pool = require('../config/db');
const XLSX = require('xlsx');

async function listar(req, res) {
  try {
    const usuarios = await usuarioModel.listarTodos();
    res.json({ usuarios });
  } catch (err) { res.status(500).json({ error: 'Error listando usuarios.' }); }
}

// BUG 1 FIX: Listar campañas para el selector del formulario
async function listarCampanas(req, res) {
  try {
    const r = await pool.query(`SELECT id, nombre FROM campanas ORDER BY nombre ASC`);
    res.json({ campanas: r.rows });
  } catch (err) { res.status(500).json({ error: 'Error listando campañas.' }); }
}

async function crear(req, res) {
  try {
    const { cedula, nombre, password, rol, campanaId, supervisor } = req.body;
    if (!cedula || !nombre || !password) return res.status(400).json({ error: 'Cédula, nombre y contraseña son obligatorios.' });
    const existente = await usuarioModel.buscarPorCedula(cedula);
    if (existente) return res.status(409).json({ error: 'Ya existe un usuario con esa cédula.' });
    const passwordHash = await bcrypt.hash(password, 10);
    // BUG 1 FIX: campanaId puede ser número o texto (nombre de campaña)
    let campanaIdFinal = campanaId || null;
    if (campanaId && isNaN(Number(campanaId))) {
      // Es un nombre de campaña, buscar o crear
      let camp = await pool.query(`SELECT id FROM campanas WHERE nombre ILIKE $1 LIMIT 1`, [campanaId]);
      if (!camp.rows[0]) {
        camp = await pool.query(`INSERT INTO campanas (nombre) VALUES ($1) RETURNING id`, [campanaId]);
      }
      campanaIdFinal = camp.rows[0].id;
    }
    const nuevo = await usuarioModel.crear({ cedula, nombre, passwordHash, rol, campanaId: campanaIdFinal, supervisor });
    res.status(201).json({ usuario: nuevo });
  } catch (err) { res.status(500).json({ error: 'Error creando usuario.' }); }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, rol, campanaId, supervisor, activo, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await usuarioModel.actualizarPassword(id, hash);
    }
    // BUG 1 FIX: campanaId puede ser nombre de campaña también al editar
    let campanaIdFinal = campanaId || null;
    if (campanaId && isNaN(Number(campanaId))) {
      let camp = await pool.query(`SELECT id FROM campanas WHERE nombre ILIKE $1 LIMIT 1`, [campanaId]);
      if (!camp.rows[0]) {
        camp = await pool.query(`INSERT INTO campanas (nombre) VALUES ($1) RETURNING id`, [campanaId]);
      }
      campanaIdFinal = camp.rows[0].id;
    }
    const usuario = await usuarioModel.actualizar(id, { nombre, rol, campanaId: campanaIdFinal, supervisor, activo });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ usuario });
  } catch (err) { res.status(500).json({ error: 'Error actualizando usuario.' }); }
}

async function exportarExcel(req, res) {
  try {
    const usuarios = await usuarioModel.listarTodos();
    const filas = usuarios.map(u => ({
      Cédula: u.cedula, Nombre: u.nombre, Rol: u.rol,
      Campaña: u.campana_nombre || '', Supervisor: u.supervisor || '',
      Estado: u.activo ? 'Activo' : 'Inactivo',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filas);
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios-dgus.xlsx');
    res.send(buf);
  } catch (err) { res.status(500).json({ error: 'Error exportando.' }); }
}

module.exports = { listar, listarCampanas, crear, actualizar, exportarExcel };
