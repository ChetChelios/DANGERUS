// ============================================================
// Controlador de Reportes
// ============================================================

const Evento = require('../models/eventoModel');
const XLSX = require('xlsx');

async function obtenerReportes(req, res) {
  try {
    const { fechaInicio, fechaFin, supervisor, campana } = req.query;

    const reportes = await Evento.obtenerReporte({ fechaInicio, fechaFin, supervisor, campana });

    // Formatear fecha_hora en fecha y hora por separado
    const resultado = reportes.map((r) => {
      const dt = new Date(r.fecha_hora);
      return {
        ...r,
        fecha: dt.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }),
        hora: dt.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo reportes.' });
  }
}

async function exportarReportes(req, res) {
  try {
    const { fechaInicio, fechaFin, supervisor, campana } = req.query;

    const reportes = await Evento.obtenerReporte({ fechaInicio, fechaFin, supervisor, campana });

    // Construir filas para el Excel
    const filas = reportes.map((r) => {
      const dt = new Date(r.fecha_hora);
      return {
        'Empleado': r.nombre,
        'Cédula': r.cedula,
        'Campaña': r.campana || '—',
        'Supervisor': r.supervisor || '—',
        'Evento': r.tipo_evento,
        'Fecha': dt.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }),
        'Hora': dt.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      };
    });

    const hoja = XLSX.utils.json_to_sheet(filas);

    // Ancho de columnas
    hoja['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
      { wch: 18 }, { wch: 14 }, { wch: 12 },
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reporte DGUS');

    const buffer = XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' });

    const nombre = `reporte-dgus-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando el Excel.' });
  }
}

module.exports = { obtenerReportes, exportarReportes };
