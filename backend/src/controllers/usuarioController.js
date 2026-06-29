// ============================================================
// Controlador: Usuarios
// ============================================================

const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');

async function listar(req, res) {
  try {
    const usuarios = await usuarioModel.listarTodos();
    return res.json({ usuarios });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

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

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, rol, campanaId, supervisor, activo } = req.body;

    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const actualizado = await usuarioModel.actualizar(id, { nombre, rol, campanaId, supervisor, activo });
    return res.json({ usuario: actualizado });
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // No permitir eliminar al propio admin que está logueado
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
    }

    await usuarioModel.eliminar(id);
    return res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = { listar, crear, actualizar, eliminar };
