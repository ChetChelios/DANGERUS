// ============================================================
// Controlador: Autenticación
// ============================================================

const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const { generarToken } = require('../utils/jwt');

/**
 * POST /api/auth/login
 * Recibe { cedula, password } y devuelve un token si son correctos.
 */
async function login(req, res) {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({ error: 'Debes ingresar cédula y contraseña.' });
    }

    const usuario = await usuarioModel.buscarPorCedula(cedula);

    if (!usuario) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrecta.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu usuario está inactivo. Contacta a un administrador.' });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrecta.' });
    }

    const token = generarToken({
      id: usuario.id,
      cedula: usuario.cedula,
      nombre: usuario.nombre,
      rol: usuario.rol,
    });

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        rol: usuario.rol,
        campana: usuario.campana_nombre,
        supervisor: usuario.supervisor,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/auth/verificar-password
 * Se usa cuando el empleado quiere REGRESAR de una pausa: debe volver
 * a escribir su contraseña como confirmación de identidad.
 */
async function verificarPassword(req, res) {
  try {
    const { password } = req.body;
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);

    // Buscamos también el hash, que buscarPorId no devuelve por seguridad
    const usuarioConHash = await usuarioModel.buscarPorCedula(usuario.cedula);

    const passwordCorrecta = await bcrypt.compare(password, usuarioConHash.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    return res.json({ verificado: true });
  } catch (err) {
    console.error('Error verificando contraseña:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/auth/yo
 * Devuelve los datos del usuario actualmente logueado (según el token).
 */
async function obtenerPerfil(req, res) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.json({ usuario });
  } catch (err) {
    console.error('Error obteniendo perfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = { login, verificarPassword, obtenerPerfil };
