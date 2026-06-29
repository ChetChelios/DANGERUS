// ============================================================
// Controlador: Usuarios (básico para el MVP)
// ============================================================
// La administración completa de usuarios (editar, desactivar, etc.)
// se ampliará en la Fase 2. Aquí dejamos lo mínimo necesario para
// que un administrador pueda crear empleados y ver la lista.
// ============================================================

const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');

/**
 * GET /api/usuarios
 * Solo administradores. Lista todos los usuarios del sistema.
 */
async function listar(req, res) {
  try {
    const usuarios = await usuarioModel.listarTodos();
    return res.json({ usuarios });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/usuarios
 * Solo administradores. Crea un nuevo empleado o administrador.
 * Body: { cedula, nombre, password, rol, campanaId, supervisor }
 */
async function crear(req, res) {
  try {
    const { cedula, nombre, password, rol, campanaId, supervisor } = req.body;

    if (!cedula || !nombre || !password) {
      return res.status(400).json({ error: 'Cédula, nombre y contraseña son obligatorios.' });
    }

    const existente = await usuarioModel.buscarPorCedula(cedula);
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con esa cédula.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await usuarioModel.crear({
      cedula, nombre, passwordHash, rol, campanaId, supervisor,
    });

    return res.status(201).json({ usuario: nuevoUsuario });
  } catch (err) {
    console.error('Error creando usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = { listar, crear };
