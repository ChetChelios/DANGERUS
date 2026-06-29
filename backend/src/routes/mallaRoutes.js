// ============================================================
// Rutas: /api/mallas
// ============================================================

const express = require('express');
const router = express.Router();
const mallaController = require('../controllers/mallaController');
const { requiereAutenticacion, requiereAdmin } = require('../middleware/authMiddleware');

router.use(requiereAutenticacion);

// El empleado consulta SU PROPIO horario.
router.get('/mia', mallaController.obtenerMiMalla);

// Solo administradores pueden ver/editar el horario de otros usuarios.
router.get('/usuario/:usuarioId', requiereAdmin, mallaController.obtenerMallaDeUsuario);
router.post('/usuario/:usuarioId', requiereAdmin, mallaController.guardarMallaDeUsuario);

// Carga masiva de horarios desde archivo Excel (solo admin)
router.post('/cargar-excel', requiereAdmin, mallaController.cargarMallasExcel);

module.exports = router;
