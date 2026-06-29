// ============================================================
// Controlador: Mallas (horario semanal)
// ============================================================

const mallaModel = require('../models/mallaModel');
const usuarioModel = require('../models/usuarioModel');
const XLSX = require('xlsx');

/**
 * GET /api/mallas/mia?semanaInicio=YYYY-MM-DD
 * El empleado consulta su propio horario de la semana indicada.
 */
async function obtenerMiMalla(req, res) {
  try {
    const { semanaInicio } = req.query;
    if (!semanaInicio) {
      return res.status(400).json({ error: 'Debes indicar el parámetro "semanaInicio" (lunes de la semana).' });
    }
    const malla = await mallaModel.obtenerMallaSemana(req.usuario.id, semanaInicio);
    return res.json({ malla });
  } catch (err) {
    console.error('Error obteniendo malla:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/mallas/usuario/:usuarioId?semanaInicio=YYYY-MM-DD
 * Un administrador consulta el horario de cualquier usuario.
 */
async function obtenerMallaDeUsuario(req, res) {
  try {
    const { usuarioId } = req.params;
    const { semanaInicio } = req.query;
    if (!semanaInicio) {
      return res.status(400).json({ error: 'Debes indicar el parámetro "semanaInicio".' });
    }
    const malla = await mallaModel.obtenerMallaSemana(usuarioId, semanaInicio);
    return res.json({ malla });
  } catch (err) {
    console.error('Error obteniendo malla de usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/mallas/usuario/:usuarioId
 * Body: { semanaInicio, dias: [ { diaSemana, horaEntrada, horaSalida, ... }, ... ] }
 * Un administrador carga o edita manualmente el horario de un usuario.
 */
async function guardarMallaDeUsuario(req, res) {
  try {
    const { usuarioId } = req.params;
    const { semanaInicio, dias } = req.body;

    if (!semanaInicio || !Array.isArray(dias)) {
      return res.status(400).json({ error: 'Debes indicar "semanaInicio" y un arreglo "dias".' });
    }

    const resultados = [];
    for (const dia of dias) {
      const guardado = await mallaModel.upsertDiaMalla({
        usuarioId,
        semanaInicio,
        diaSemana: dia.diaSemana,
        horaEntrada: dia.horaEntrada,
        horaSalida: dia.horaSalida,
        break1Inicio: dia.break1Inicio,
        break1Fin: dia.break1Fin,
        almuerzoInicio: dia.almuerzoInicio,
        almuerzoFin: dia.almuerzoFin,
        break2Inicio: dia.break2Inicio,
        break2Fin: dia.break2Fin,
      });
      resultados.push(guardado);
    }

    return res.status(201).json({ malla: resultados });
  } catch (err) {
    console.error('Error guardando malla:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/mallas/cargar-excel
 * Body: FormData con archivo 'archivo' (Excel)
 * Carga masiva de horarios desde un archivo Excel.
 * Solo administradores pueden hacer esto.
 * 
 * Formato esperado del Excel:
 * | Cédula | Nombre | Supervisor | Campaña | [Fecha] Entrada | [Fecha] Salida | [Fecha] Break1 | [Fecha] Almuerzo | [Fecha] Break2 | ...
 * Para cada día de la semana
 */
async function cargarMallasExcel(req, res) {
  try {
    // Validar que sea administrador
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({ error: 'Solo los administradores pueden cargar mallas.' });
    }

    // Validar que haya archivo
    if (!req.files || !req.files.archivo) {
      return res.status(400).json({ error: 'Debes enviar un archivo Excel.' });
    }

    const archivo = req.files.archivo;
    const buffer = archivo.data;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(hoja);

    if (datos.length === 0) {
      return res.status(400).json({ error: 'El archivo Excel está vacío.' });
    }

    const resultados = {
      exitosos: 0,
      errores: [],
      advertencias: [],
    };

    // Procesar cada fila
    for (let i = 0; i < datos.length; i++) {
      const row = datos[i];
      const rowNum = i + 2; // +2 porque la fila 1 es header, y los arrays empiezan en 0

      try {
        const cedula = String(row['Cédula'] || row['cedula'] || '').trim();
        const nombre = String(row['Nombre'] || row['nombre'] || '').trim();
        const supervisor = String(row['Supervisor'] || row['supervisor'] || '').trim();
        const campana = String(row['Campaña'] || row['campana'] || '').trim();

        // Validar campos básicos
        if (!cedula || !nombre) {
          resultados.errores.push({
            fila: rowNum,
            cedula,
            razon: 'Falta Cédula o Nombre',
          });
          continue;
        }

        // Buscar usuario por cédula
        let usuario = await usuarioModel.buscarPorCedula(cedula);
        if (!usuario) {
          resultados.errores.push({
            fila: rowNum,
            cedula,
            razon: `Usuario con cédula ${cedula} no existe`,
          });
          continue;
        }

        // Actualizar supervisor y campaña si se proporcionan
        if (supervisor && usuario.supervisor !== supervisor) {
          await usuarioModel.actualizarSupervisor(usuario.id, supervisor);
        }

        // Procesar horarios por día
        // El formato esperado es: [Fecha] [Tipo]
        // Ej: "29/06/2026 Entrada", "29/06/2026 Salida", "29/06/2026 Break1", etc.

        const horariosDelUsuario = {};
        const columnas = Object.keys(row);

        for (const columna of columnas) {
          // Ignorar columnas de identificación
          if (['Cédula', 'cedula', 'Nombre', 'nombre', 'Supervisor', 'supervisor', 'Campaña', 'campana'].includes(columna)) {
            continue;
          }

          // Intentar parsear columna del formato "29/06/2026 Entrada"
          const match = columna.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.+)$/i);
          if (!match) {
            resultados.advertencias.push({
              fila: rowNum,
              columna,
              razon: 'Columna no reconocida (esperado: "DD/MM/YYYY Tipo")',
            });
            continue;
          }

          const [, dia, mes, año, tipo] = match;
          const fecha = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const tipoLimpio = tipo.trim().toLowerCase();

          if (!horariosDelUsuario[fecha]) {
            horariosDelUsuario[fecha] = {};
          }

          const valor = row[columna];
          if (valor) {
            horariosDelUsuario[fecha][tipoLimpio] = String(valor).trim();
          }
        }

        // Guardar horarios en la BD
        for (const [fecha, horarios] of Object.entries(horariosDelUsuario)) {
          // Determinar el lunes de esa semana
          const fechaObj = new Date(`${fecha}T00:00:00`);
          const lunes = new Date(fechaObj);
          const dia = fechaObj.getDay();
          const diferencia = fechaObj.getDate() - dia + (dia === 0 ? -6 : 1);
          lunes.setDate(diferencia);
          const semanaInicio = lunes.toISOString().split('T')[0];

          // Determinar día de la semana
          const diasEnIngles = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          const diaSemana = diasEnIngles[fechaObj.getDay()];

          // Mapear tipos de horarios
          const entrada = horarios['entrada'] || horarios['h. entrada'] || horarios['hora entrada'];
          const salida = horarios['salida'] || horarios['h. salida'] || horarios['hora salida'];
          const break1 = horarios['break 1'] || horarios['break1'] || horarios['brak1'];
          const almuerzo = horarios['almuerzo'];
          const break2 = horarios['break 2'] || horarios['break2'] || horarios['brak2'];

          // Guardar en BD
          await mallaModel.upsertDiaMalla({
            usuarioId: usuario.id,
            semanaInicio,
            diaSemana,
            horaEntrada: entrada,
            horaSalida: salida,
            break1Inicio: break1 ? `${break1.split('-')[0]}` : null,
            break1Fin: break1 ? `${break1.split('-')[1]}` : null,
            almuerzoInicio: almuerzo ? `${almuerzo.split('-')[0]}` : null,
            almuerzoFin: almuerzo ? `${almuerzo.split('-')[1]}` : null,
            break2Inicio: break2 ? `${break2.split('-')[0]}` : null,
            break2Fin: break2 ? `${break2.split('-')[1]}` : null,
          });
        }

        resultados.exitosos++;
      } catch (err) {
        resultados.errores.push({
          fila: rowNum,
          razon: err.message,
        });
      }
    }

    return res.status(200).json({
      mensaje: 'Carga completada',
      resultados,
    });
  } catch (err) {
    console.error('Error cargando mallas desde Excel:', err);
    return res.status(500).json({ error: 'Error al procesar el archivo Excel.' });
  }
}

module.exports = { obtenerMiMalla, obtenerMallaDeUsuario, guardarMallaDeUsuario, cargarMallasExcel };

