// ============================================================
// Configuración de la conexión a PostgreSQL
// ============================================================
// Usamos "pg" (node-postgres) con un "Pool", que mantiene varias
// conexiones abiertas y las reutiliza, en vez de abrir una nueva
// conexión cada vez que hacemos una consulta (esto es más rápido).
// ============================================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Esto nos avisa en la consola si la conexión a la base de datos falló,
// para que sea fácil saber qué está pasando.
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;
