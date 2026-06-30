const express = require('express');
const router = express.Router();
const c = require('../controllers/usuarioController');
const { requiereAutenticacion, requiereAdmin } = require('../middleware/authMiddleware');

// Campañas: autenticado (cualquier rol), para cargar el selector del formulario
router.get('/campanas', requiereAutenticacion, c.listarCampanas);

// Resto de rutas de usuarios: requiere autenticación + rol administrador
router.use(requiereAutenticacion, requiereAdmin);
router.get('/', c.listar);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.get('/exportar', c.exportarExcel);

module.exports = router;
