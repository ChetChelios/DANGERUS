// ============================================================
// Rutas: /api/usuarios
// ============================================================

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { requiereAutenticacion, requiereAdmin } = require('../middleware/authMiddleware');

router.use(requiereAutenticacion, requiereAdmin);

router.get('/', usuarioController.listar);
router.post('/', usuarioController.crear);

module.exports = router;
