// ============================================================
// Rutas: /api/auth
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requiereAutenticacion } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/verificar-password', requiereAutenticacion, authController.verificarPassword);
router.get('/yo', requiereAutenticacion, authController.obtenerPerfil);

module.exports = router;
