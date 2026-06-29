# DGUS — Sistema de Control de Turnos (MVP)

Sistema web para gestionar el logueo, deslogueo, pausas (Break 1, Almuerzo,
Break 2) y horario semanal del personal, según el documento de proyecto
original.

## Contenido de esta entrega (MVP)

✅ Incluido en este MVP:
- Autenticación de empleados y administradores (JWT + bcrypt).
- Logueo y deslogueo de turno.
- Pausas (Break 1, Almuerzo, Break 2) con confirmación de contraseña al
  regresar.
- Visualización del horario semanal del empleado (malla).
- Panel básico de administración para crear usuarios.

⏳ Pendiente para próximas entregas (ver el documento original del proyecto):
- Calendario visual de tardanzas y asistencia.
- Carga semanal de mallas mediante Excel.
- Administración completa de usuarios, campañas y supervisores.
- Reactivación de turnos por administrador.
- Reportes diarios, semanales y mensuales en Excel/PDF.
- Fase 2: justificación de tardanzas, permisos, vacaciones, notificaciones,
  panel de supervisor, aplicación móvil.

## Estructura del proyecto

```
dgus/
├── backend/        Servidor API (Node.js + Express + PostgreSQL)
│   ├── database.sql        Script de creación de la base de datos
│   ├── .env.example         Plantilla de variables de entorno
│   └── src/
│       ├── config/          Conexión a PostgreSQL
│       ├── controllers/     Lógica de negocio
│       ├── middleware/      Autenticación / autorización
│       ├── models/          Acceso a datos (SQL)
│       ├── routes/          Definición de endpoints
│       ├── seed.js          Crea el usuario administrador inicial
│       └── server.js        Punto de entrada del backend
│
└── frontend/        Interfaz visual (React + Vite + Tailwind CSS)
    └── src/
        ├── api/              Funciones que llaman al backend
        ├── components/       Piezas reutilizables de interfaz
        ├── context/          Estado global de sesión (login)
        ├── hooks/            Lógica reutilizable (ej. reloj en vivo)
        └── pages/            Pantallas completas (Login, Dashboard, Admin)
```

## Cómo instalar y ejecutar

Sigue el documento **"Manual_Instalacion_DGUS.docx"** incluido en esta
entrega: tiene el paso a paso completo, pensado para alguien sin
experiencia previa en programación.

Resumen rápido (si ya tienes Node.js y PostgreSQL instalados):

```bash
# 1. Base de datos
psql -U postgres -c "CREATE DATABASE dgus_turnos;"
psql -U postgres -d dgus_turnos -f backend/database.sql

# 2. Backend
cd backend
cp .env.example .env   # y edita la contraseña de PostgreSQL dentro del archivo
npm install
npm run seed           # crea el usuario administrador inicial
npm start               # http://localhost:4000

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## Credenciales iniciales

| Campo       | Valor          |
|-------------|----------------|
| Cédula      | `0000000000`   |
| Contraseña  | `Admin123!`    |

Cámbiala después de tu primer ingreso.

## Diseño visual

Paleta corporativa (amarillo / gris / blanco) implementada como:
- **Ámbar** (`#F5B400`) como acento principal de acción.
- **Carbón** (escala de grises cálidos, no gris neutro plano) para texto y
  fondos oscuros.
- Tipografía: *Space Grotesk* (títulos), *Inter* (texto), *JetBrains Mono*
  (reloj y datos numéricos).
- El elemento central del dashboard es un **reloj en vivo** con el estado
  actual del turno, que es el "corazón" visual de la aplicación.

## Próximos pasos sugeridos

Cuando quieras seguir con la Fase 2 de este proyecto (carga de mallas por
Excel, reportes, calendario de tardanzas, etc.), continúa la conversación
indicando qué módulo quieres construir primero.
