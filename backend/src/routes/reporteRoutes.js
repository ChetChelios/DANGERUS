const express = require('express');
const router = express.Router();

const reporteController = require('../controllers/reporteController');

const {
  requiereAutenticacion,
  requiereAdmin
} = require('../middleware/authMiddleware');

router.get(
  '/',
  requiereAutenticacion,
  requiereAdmin,
  reporteController.obtenerReportes
);

router.get(
  '/exportar',
  requiereAutenticacion,
  requiereAdmin,
  reporteController.exportarReportes
);

module.exports = router;