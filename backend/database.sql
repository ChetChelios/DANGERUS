-- ============================================================
-- DGUS - Sistema de Control de Turnos
-- Script de creación de base de datos (PostgreSQL)
-- ============================================================
-- Uso: psql -U postgres -f database.sql
-- Este script es idempotente: se puede correr varias veces sin error.
-- ============================================================

-- Crear la base de datos (conectado a "postgres")
-- Si ya existe, este comando da un aviso pero no falla.
CREATE DATABASE dgus_turnos;

-- A partir de aquí conectarse a dgus_turnos: \c dgus_turnos

-- ============================================================
-- TABLA: campanas
-- ============================================================
CREATE TABLE IF NOT EXISTS campanas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('empleado', 'administrador', 'supervisor')),
    campana_id INTEGER REFERENCES campanas(id) ON DELETE SET NULL,
    supervisor VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: mallas
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
    semana_inicio DATE NOT NULL,
    creado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, dia_semana, semana_inicio)
);

-- ============================================================
-- TABLA: eventos_turno
-- Incluye columnas snapshot desde el inicio para evitar migraciones
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_turno (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(20) NOT NULL CHECK (tipo_evento IN
        ('login', 'logout', 'break1_inicio', 'break1_fin',
         'almuerzo_inicio', 'almuerzo_fin', 'break2_inicio', 'break2_fin')),
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    supervisor_snapshot VARCHAR(150),
    campana_snapshot VARCHAR(100),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Por si la tabla ya existía sin las columnas snapshot, las agregamos
ALTER TABLE eventos_turno ADD COLUMN IF NOT EXISTS supervisor_snapshot VARCHAR(150);
ALTER TABLE eventos_turno ADD COLUMN IF NOT EXISTS campana_snapshot VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_eventos_usuario_fecha
    ON eventos_turno(usuario_id, fecha_hora);

-- ============================================================
-- TABLA: turnos_reactivados
-- ============================================================
CREATE TABLE IF NOT EXISTS turnos_reactivados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES usuarios(id),
    motivo VARCHAR(255),
    fecha_hora TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: solicitudes_ausencia
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_ausencia (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    supervisor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'ausencia',
    motivo TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobada','rechazada')),
    respuesta_supervisor TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    respondido_en TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_empleado ON solicitudes_ausencia(empleado_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_supervisor ON solicitudes_ausencia(supervisor_id);

-- ============================================================
-- Datos iniciales
-- ============================================================
INSERT INTO campanas (nombre) VALUES ('Campaña Demo') ON CONFLICT DO NOTHING;

-- Usuario administrador inicial (ejecutar seed.js para generar el hash):
--   Cédula: 0000000000 / Contraseña: Admin123!
