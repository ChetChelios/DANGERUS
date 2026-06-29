// ============================================================
// Componente: HorarioSemanal
// ============================================================
// Muestra la malla (horario planificado) del empleado para la
// semana actual, en formato de tabla.
// ============================================================

import { useEffect, useState } from 'react';
import * as mallaApi from '../api/mallaApi';
import Tarjeta from './Tarjeta';

const NOMBRES_DIAS = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

// Calcula la fecha del lunes de la semana actual, en formato YYYY-MM-DD.
function obtenerLunesDeEstaSemana() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ...
  const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diferencia);
  return lunes.toISOString().split('T')[0];
}

function formatearHora(horaSql) {
  if (!horaSql) return '—';
  return horaSql.slice(0, 5); // "08:00:00" -> "08:00"
}

export default function HorarioSemanal() {
  const [malla, setMalla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const semanaInicio = obtenerLunesDeEstaSemana();
        const datos = await mallaApi.obtenerMiMalla(semanaInicio);
        setMalla(datos.malla);
      } catch (err) {
        setError('No se pudo cargar tu horario de esta semana.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <Tarjeta titulo="Mi horario de esta semana">
      {cargando && <p className="text-sm text-carbon-400">Cargando horario...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!cargando && !error && malla.length === 0 && (
        <p className="text-sm text-carbon-400">
          Aún no se ha cargado un horario para esta semana. Consulta con tu administrador.
        </p>
      )}

      {!cargando && malla.length > 0 && (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-carbon-400 border-b border-carbon-100">
                <th className="py-2 px-2 font-medium">Día</th>
                <th className="py-2 px-2 font-medium">Entrada</th>
                <th className="py-2 px-2 font-medium">Salida</th>
                <th className="py-2 px-2 font-medium">Break 1</th>
                <th className="py-2 px-2 font-medium">Almuerzo</th>
                <th className="py-2 px-2 font-medium">Break 2</th>
              </tr>
            </thead>
            <tbody>
              {malla.map((dia) => (
                <tr key={dia.id} className="border-b border-carbon-50 last:border-0">
                  <td className="py-2.5 px-2 font-medium text-carbon-700">
                    {NOMBRES_DIAS[dia.dia_semana]}
                  </td>
                  <td className="py-2.5 px-2 font-mono">{formatearHora(dia.hora_entrada)}</td>
                  <td className="py-2.5 px-2 font-mono">{formatearHora(dia.hora_salida)}</td>
                  <td className="py-2.5 px-2 font-mono text-carbon-400">
                    {formatearHora(dia.break1_inicio)} - {formatearHora(dia.break1_fin)}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-carbon-400">
                    {formatearHora(dia.almuerzo_inicio)} - {formatearHora(dia.almuerzo_fin)}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-carbon-400">
                    {formatearHora(dia.break2_inicio)} - {formatearHora(dia.break2_fin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tarjeta>
  );
}
