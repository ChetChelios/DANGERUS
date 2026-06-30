// ============================================================
// Servidor principal del backend DGUS
// ============================================================
// Este es el archivo que se ejecuta para "encender" el backend.
// Configura Express, conecta las rutas, y empieza a escuchar
// peticiones en el puerto indicado en el archivo .env
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const authRoutes = require('./routes/authRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const mallaRoutes = require('./routes/mallaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();

// Permite que el frontend pueda consumir el backend.
app.use(cors());

// Permite recibir JSON.
app.use(express.json());

// Middleware para carga de archivos.
app.use(
  fileUpload({
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  })
);

// Ruta de prueba.
app.get('/api/salud', (req, res) => {
  res.json({
    estado: 'ok',
    mensaje: 'El servidor DGUS está funcionando correctamente.',
  });
});

// =======================
// Rutas
// =======================

app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/mallas', mallaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/solicitudes', solicitudRoutes);

// =======================
// 404
// =======================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada.',
  });
});

// =======================
// Errores generales
// =======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Error interno del servidor.',
  });
});

// =======================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Servidor DGUS escuchando en http://localhost:${PORT}`);
});