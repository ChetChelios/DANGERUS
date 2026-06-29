// ============================================================
// Controlador: Mallas - VERSIÓN PERFECTA
// ============================================================
// Formato EXACTO esperado:
// | Cédula | Nombre | Supervisor | Campaña | fecha1 | h.entrada | h.salida | break1 | almuerzo | break2 | fecha2 | ... (x7 días)
// ============================================================

const mallaModel = require('../models/mallaModel');
const usuarioModel = require('../models/usuarioModel');
const XLSX = require('xlsx');

/**
 * GET /api/mallas/mia?semanaInicio=YYYY-MM-DD
 */
async function obtenerMiMalla(req, res) {
  try {
    const { semanaInicio } = req.query;
    if (!semanaInicio) {
      return res.status(400).json({ error: 'Debes indicar el parámetro "semanaInicio".' });
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
 * 
 * Formato EXACTO del Excel:
 * Columnas 1-4: Cédula, Nombre, Supervisor, Campaña
 * Columnas 5-10: fecha1, h.entrada, h.salida, break1, almuerzo, break2
 * Columnas 11-16: fecha2, h.entrada, h.salida, break1, almuerzo, break2
 * ... (hasta 7 días)
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
    
    // Leer el Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convertir a JSON
    const datos = XLSX.utils.sheet_to_json(hoja);

    if (datos.length === 0) {
      return res.status(400).json({ error: 'El archivo Excel está vacío.' });
    }

    const resultados = {
      exitosos: 0,
      errores: [],
      advertencias: [],
    };

    // ========== PROCESAR CADA FILA ==========
    for (let i = 0; i < datos.length; i++) {
      const row = datos[i];
      const rowNum = i + 2; // +2 porque fila 1 es header

      try {
        // Extraer datos básicos
        const cedula = String(row['Cédula'] || row['cedula'] || '').trim();
        const nombre = String(row['Nombre'] || row['nombre'] || '').trim();
        const supervisor = String(row['Supervisor'] || row['supervisor'] || '').trim();
        const campana = String(row['Campaña'] || row['campana'] || '').trim();

        // Validar campos básicos
        if (!cedula || !nombre) {
          resultados.errores.push({
            fila: rowNum,
            cedula: cedula || 'N/A',
            nombre: nombre || 'N/A',
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
            nombre,
            razon: `Usuario con cédula ${cedula} no existe en el sistema`,
          });
          continue;
        }

        // Actualizar supervisor
        if (supervisor) {
          await usuarioModel.actualizarSupervisor(usuario.id, supervisor);
        }

        // ========== PROCESAR 7 DÍAS ==========
        // Formato: bloques de 6 columnas (fecha, entrada, salida, break1, almuerzo, break2)
        // Días están en: fecha1, fecha2, fecha3, fecha4, fecha5, fecha6, fecha7
        
        let diasCargados = 0;
        const diasProcesados = [];

        for (let diaIdx = 1; diaIdx <= 7; diaIdx++) {
          const fechaKey = `fecha ${diaIdx}`;
          const entradaKey = `hora entrada`;
          const salidaKey = `hora salida`;
          const break1Key = `break 1`;
          const almuerzoKey = `Almuerzo`;
          const break2Key = `break 2`;

          // Obtener valores
          const fechaVal = row[fechaKey];
          const entradaVal = row[entradaKey];
          const salidaVal = row[salidaKey];
          const break1Val = row[break1Key];
          const almuerzoVal = row[almuerzoKey];
          const break2Val = row[break2Key];

          // Validar que haya fecha
          if (!fechaVal) {
            console.log(`  Día ${diaIdx}: Sin fecha, saltando`);
            continue;
          }

          // Convertir fecha a YYYY-MM-DD
          let fecha;
          if (typeof fechaVal === 'object' && fechaVal instanceof Date) {
            fecha = fechaVal;
          } else if (typeof fechaVal === 'number') {
            // Excel number (días desde 1900)
            fecha = new Date((fechaVal - 25569) * 86400 * 1000);
          } else if (typeof fechaVal === 'string') {
            fecha = new Date(fechaVal);
          } else {
            fecha = new Date(fechaVal);
          }

          if (isNaN(fecha.getTime())) {
            console.log(`  Día ${diaIdx}: Fecha inválida: ${fechaVal}`);
            continue;
          }

          const fechaISO = fecha.toISOString().split('T')[0];

          // Convertir horas a HH:MM
          const convertirHora = (hora) => {
            if (!hora) return null;

            if (typeof hora === 'object' && hora.hours !== undefined) {
              // Objeto time
              const h = String(hora.hours).padStart(2, '0');
              const m = String(hora.minutes || 0).padStart(2, '0');
              return `${h}:${m}`;
            } else if (typeof hora === 'string') {
              // String
              const limpio = hora.trim();
              if (limpio === '00:00' || limpio === '00:00:00' || limpio === '0') return null;
              return limpio.substring(0, 5);
            } else if (typeof hora === 'number') {
              // Decimal (Excel time)
              const horas = Math.floor(hora * 24);
              const minutos = Math.floor((hora * 24 - horas) * 60);
              if (horas === 0 && minutos === 0) return null;
              return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
            }

            return null;
          };

          const entrada = convertirHora(entradaVal);
          const salida = convertirHora(salidaVal);
          const break1 = convertirHora(break1Val);
          const almuerzo = convertirHora(almuerzoVal);
          const break2 = convertirHora(break2Val);

          // Si no hay entrada/salida, no guardar
          if (!entrada || !salida) {
            console.log(`  Día ${diaIdx} (${fechaISO}): Sin entrada/salida, saltando`);
            continue;
          }

          // Calcular el lunes de la semana
          const fechaObj = new Date(`${fechaISO}T00:00:00`);
          const dia = fechaObj.getDay();
          const diferencia = fechaObj.getDate() - dia + (dia === 0 ? -6 : 1);
          const lunes = new Date(fechaObj);
          lunes.setDate(diferencia);
          const semanaInicio = lunes.toISOString().split('T')[0];

          // Determinar día de la semana
          const diasEnIngles = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          const diaSemana = diasEnIngles[fechaObj.getDay()];

          console.log(`  Día ${diaIdx} (${fechaISO}): ${diaSemana} - ${entrada} a ${salida}`);

          // Guardar en BD
          await mallaModel.upsertDiaMalla({
            usuarioId: usuario.id,
            semanaInicio,
            diaSemana,
            horaEntrada: entrada,
            horaSalida: salida,
            break1Inicio: break1,
            break1Fin: null,
            almuerzoInicio: almuerzo,
            almuerzoFin: null,
            break2Inicio: break2,
            break2Fin: null,
          });

          diasCargados++;
          diasProcesados.push({ fecha: fechaISO, diaSemana });
        }

        if (diasCargados > 0) {
          console.log(`Fila ${rowNum}: ✓ Cargados ${diasCargados} días`);
          resultados.exitosos++;
        } else {
          resultados.advertencias.push({
            fila: rowNum,
            cedula,
            razon: 'No se encontraron horarios válidos',
          });
        }
      } catch (err) {
        console.error(`Error en fila ${rowNum}:`, err.message);
        resultados.errores.push({
          fila: rowNum,
          cedula: row['Cédula'] || 'N/A',
          razon: err.message,
        });
      }
    }

    return res.status(200).json({
      mensaje: 'Carga completada',
      resultados,
    });
  } catch (err) {
    console.error('Error cargando mallas:', err);
    return res.status(500).json({ error: 'Error al procesar el archivo: ' + err.message });
  }
}

/**
 * GET /api/mallas/descargar-plantilla
 */
async function descargarPlantilla(req, res) {
  try {
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({ error: 'Solo administradores pueden descargar plantillas.' });
    }

    // Crear encabezados
    const encabezados = ['Cédula', 'Nombre', 'Supervisor', 'Campaña'];
    
    // Agregar 7 días
    for (let i = 1; i <= 7; i++) {
      encabezados.push(`fecha ${i}`);
      encabezados.push('hora entrada');
      encabezados.push('hora salida');
      encabezados.push('break 1');
      encabezados.push('Almuerzo');
      encabezados.push('break 2');
    }

    // Crear workbook
    const ws = XLSX.utils.aoa_to_sheet([encabezados]);
    ws['!cols'] = Array(encabezados.length).fill({ wch: 15 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');

    // Enviar
    const nombreArchivo = `Plantilla_Mallas_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('Error descargando plantilla:', err);
    return res.status(500).json({ error: 'Error al generar plantilla.' });
  }
}

module.exports = { 
  obtenerMiMalla, 
  obtenerMallaDeUsuario, 
  guardarMallaDeUsuario, 
  cargarMallasExcel,
  descargarPlantilla,
};