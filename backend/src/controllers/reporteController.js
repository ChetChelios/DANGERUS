// ============================================================
// Controlador de Reportes
// ============================================================

const Evento = require('../models/eventoModel');

async function obtenerReportes(req, res) {
  try {
    const {
      fechaInicio,
      fechaFin,
      supervisor,
      campana,
    } = req.query;

    const reportes = await Evento.obtenerReporte({
      fechaInicio,
      fechaFin,
      supervisor,
      campana,
    });

    res.json(reportes);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error obteniendo reportes.',
    });
  }
}

async function exportarReportes(req, res) {
  res.json({
    mensaje: 'Exportación aún no implementada.'
  });
}

module.exports = {
  obtenerReportes,
  exportarReportes,
};