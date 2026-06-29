// ============================================================
// Utilidades para JSON Web Tokens (JWT)
// ============================================================
// Un JWT es como una "credencial firmada" que el servidor le da
// al usuario después de iniciar sesión. El usuario la envía en
// cada petición siguiente para probar quién es, sin tener que
// volver a escribir su contraseña.
// ============================================================

const jwt = require('jsonwebtoken');

function generarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generarToken, verificarToken };
