-- ============================================================
-- DGUS - Sistema de Control de Turnos
-- Script de creación de base de datos (PostgreSQL)
-- ============================================================
-- Cómo usar: ver el manual de instalación. En resumen:
--   psql -U postgres -f database.sql hjfghnrf
-- ============================================================

-- Crear la base de datos (ejecutar este bloque conectado a "postgres")
-- Si ya existe, este comando fallará con un aviso, eso es normal.
CREATE DATABASE dgus_turnos;

-- A partir de aquí, conéctate a la base "dgus_turnos" antes de continuar.
-- En psql: \c dgus_turnos

-- ============================================================
-- TABLA: campañas
-- ============================================================
CREATE TABLE IF NOT EXISTS campanas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: usuarios (empleados y administradores)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('empleado', 'administrador')),
    campana_id INTEGER REFERENCES campanas(id) ON DELETE SET NULL,
    supervisor VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: mallas (horario semanal planificado por día)
-- ============================================================
CREATE TABLE IF NOT EXISTS mallas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dia_semana VARCHAR(15) NOT NULL CHECK (dia_semana IN
        ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
    hora_entrada TIME,
    hora_salida TIME,
    break1_inicio TIME,
    break1_fin TIME,
    almuerzo_inicio TIME,
    almuerzo_fin TIME,
    break2_inicio TIME,
    break2_fin TIME,
    semana_inicio DATE NOT NULL, -- lunes de la semana que aplica esta malla
    creado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, dia_semana, semana_inicio)
);

-- ============================================================
-- TABLA: eventos_turno (registro real de lo que hace el empleado)
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_turno (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(20) NOT NULL CHECK (tipo_evento IN
        ('login', 'logout', 'break1_inicio', 'break1_fin',
         'almuerzo_inicio', 'almuerzo_fin', 'break2_inicio', 'break2_fin')),
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Índice para acelerar las consultas de calendario/reportes por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_eventos_usuario_fecha
    ON eventos_turno(usuario_id, fecha_hora);

-- ============================================================
-- TABLA: turnos_reactivados (auditoría de reactivaciones por admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS turnos_reactivados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES usuarios(id),
    motivo VARCHAR(255),
    fecha_hora TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Datos iniciales de ejemplo (puedes borrarlos luego)
-- ============================================================
INSERT INTO campanas (nombre) VALUES ('Campaña Demo') ON CONFLICT DO NOTHING;

-- Usuario administrador inicial:
--   Cédula: 0000000000
--   Contraseña: Admin123!
-- (El hash de abajo corresponde a "Admin123!" usando bcrypt, lo regeneraremos
--  automáticamente con el script seed.js — ver manual de instalación)
