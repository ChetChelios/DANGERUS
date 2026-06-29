// ============================================================
// Rutas: /api/turnos
// ============================================================

const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { requiereAutenticacion } = require('../middleware/authMiddleware');

// Todas las rutas de turnos requieren estar logueado.
router.use(requiereAutenticacion);

router.get('/estado', turnoController.obtenerEstadoActual);
router.post('/evento', turnoController.registrarEvento);
router.get('/calendario', turnoController.obtenerCalendario);

module.exports = router;
