// ============================================================
// Middleware de autenticación
// ============================================================
// Un "middleware" es una función que se ejecuta ANTES de que la
// petición llegue al controlador final. Aquí lo usamos para revisar
// que el usuario haya iniciado sesión (tenga un token válido) antes
// de dejarlo usar rutas protegidas.
// ============================================================

const { verificarToken } = require('../utils/jwt');

/**
 * Verifica que la petición incluya un token JWT válido en el header
 * "Authorization: Bearer <token>". Si es válido, guarda los datos
 * del usuario en req.usuario para que los controladores los usen.
 */
function requiereAutenticacion(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó un token de autenticación.' });
  }

  const token = header.split(' ')[1];

  try {
    const datos = verificarToken(token);
    req.usuario = datos; // { id, cedula, rol, nombre }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado. Por favor inicia sesión de nuevo.' });
  }
}

/**
 * Verifica que el usuario autenticado tenga rol de administrador.
 * Debe usarse SIEMPRE después de "requiereAutenticacion".
 */
function requiereAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'administrador') {
    return res.status(403).json({ error: 'No tienes permisos de administrador para esta acción.' });
  }
  next();
}

module.exports = { requiereAutenticacion, requiereAdmin };
