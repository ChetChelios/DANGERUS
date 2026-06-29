// ============================================================
// Script de datos iniciales (seed)
// ============================================================
// Este script crea un usuario ADMINISTRADOR inicial para que puedas
// entrar al sistema por primera vez. Lo corres UNA SOLA VEZ con:
//
//   npm run seed
//
// Credenciales que se crean:
//   Cédula:      0000000000
//   Contraseña:  Admin123!
//
// ¡Cambia esta contraseña después de tu primer ingreso!
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function ejecutarSeed() {
  try {
    const cedulaAdmin = '0000000000';
    const passwordAdmin = 'Admin123!';

    const yaExiste = await pool.query('SELECT id FROM usuarios WHERE cedula = $1', [cedulaAdmin]);

    if (yaExiste.rows.length > 0) {
      console.log('ℹ️  El usuario administrador ya existe. No se hizo ningún cambio.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(passwordAdmin, 10);

    await pool.query(
      `INSERT INTO usuarios (cedula, nombre, password_hash, rol)
       VALUES ($1, $2, $3, 'administrador')`,
      [cedulaAdmin, 'Administrador Principal', passwordHash]
    );

    console.log('✅ Usuario administrador creado con éxito:');
    console.log(`   Cédula:      ${cedulaAdmin}`);
    console.log(`   Contraseña:  ${passwordAdmin}`);
    console.log('   ⚠️  Por seguridad, cambia esta contraseña después de tu primer ingreso.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error ejecutando el seed:', err.message);
    process.exit(1);
  }
}

ejecutarSeed();
