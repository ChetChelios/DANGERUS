import { useState } from "react";
import BarraNavegacion from "../components/BarraNavegacion";
import Tarjeta from "../components/Tarjeta";
import Boton from "../components/Boton";
import * as reporteApi from "../api/reporteApi";

const ETIQUETAS_EVENTO = {
  login: 'Entrada',
  logout: 'Salida',
  break1_inicio: 'Inicio Break 1',
  break1_fin: 'Fin Break 1',
  almuerzo_inicio: 'Inicio Almuerzo',
  almuerzo_fin: 'Fin Almuerzo',
  break2_inicio: 'Inicio Break 2',
  break2_fin: 'Fin Break 2',
};

export default function AdminReportes() {
  const [filtros, setFiltros] = useState({
    cedula: '', nombre: '', supervisor: '', campana: '',
    fechaInicio: '', fechaFin: '',
  });
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  function manejarCambio(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  async function buscar() {
    setCargando(true);
    setError('');
    try {
      const datos = await reporteApi.obtenerReportes(filtros);
      setReportes(datos);
      setBuscado(true);
    } catch (err) {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setCargando(false);
    }
  }

  async function exportar() {
    setExportando(true);
    try {
      await reporteApi.exportarExcel(filtros);
    } catch (err) {
      setError('No se pudo exportar el Excel.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="min-h-screen bg-carbon-50">
      <BarraNavegacion />

      <main className="max-w-7xl mx-auto p-8">
        <h1 className="font-display text-3xl font-bold text-carbon-900 mb-1">
          Reportes de asistencia
        </h1>
        <p className="text-carbon-500 mb-8 text-sm">
          Consulta y exporta las marcaciones de todos los colaboradores.
        </p>

        {/* Filtros */}
        <Tarjeta className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              value={filtros.cedula}
              onChange={(e) => manejarCambio('cedula', e.target.value)}
              placeholder="Cédula"
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
            <input
              value={filtros.nombre}
              onChange={(e) => manejarCambio('nombre', e.target.value)}
              placeholder="Nombre"
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
            <input
              value={filtros.supervisor}
              onChange={(e) => manejarCambio('supervisor', e.target.value)}
              placeholder="Supervisor"
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
            <input
              value={filtros.campana}
              onChange={(e) => manejarCambio('campana', e.target.value)}
              placeholder="Campaña"
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => manejarCambio('fechaInicio', e.target.value)}
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => manejarCambio('fechaFin', e.target.value)}
              className="border border-carbon-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dangerus-500"
            />
          </div>
          <div className="mt-3">
            <Boton onClick={buscar} variante="primario" disabled={cargando}>
              {cargando ? 'Buscando...' : 'Buscar'}
            </Boton>
          </div>
        </Tarjeta>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <Tarjeta>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-carbon-900">Resultados</h2>
              {buscado && (
                <p className="text-xs text-carbon-400 mt-0.5">
                  {reportes.length} registro{reportes.length !== 1 ? 's' : ''} encontrado{reportes.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Boton
              variante="fantasma"
              onClick={exportar}
              disabled={exportando || reportes.length === 0}
            >
              {exportando ? 'Exportando...' : '⬇ Exportar Excel'}
            </Boton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-carbon-100">
                <tr className="text-left text-carbon-400 text-xs uppercase tracking-wider">
                  <th className="py-3 pr-4 font-semibold">Empleado</th>
                  <th className="py-3 pr-4 font-semibold">Cédula</th>
                  <th className="py-3 pr-4 font-semibold">Campaña</th>
                  <th className="py-3 pr-4 font-semibold">Evento</th>
                  <th className="py-3 pr-4 font-semibold">Fecha</th>
                  <th className="py-3 font-semibold">Hora</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr><td colSpan="6" className="py-10 text-center text-carbon-400">Cargando...</td></tr>
                )}
                {!cargando && reportes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-carbon-400">
                      {buscado ? 'No se encontraron registros con los filtros aplicados.' : 'Usa los filtros y presiona Buscar para ver los reportes.'}
                    </td>
                  </tr>
                )}
                {!cargando && reportes.map((r, i) => (
                  <tr key={i} className="border-b border-carbon-50 last:border-0 hover:bg-carbon-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-carbon-800">{r.nombre}</td>
                    <td className="py-3 pr-4 font-mono text-carbon-500">{r.cedula}</td>
                    <td className="py-3 pr-4 text-carbon-500">{r.campana || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.tipo_evento === 'login' ? 'bg-green-100 text-green-700' :
                        r.tipo_evento === 'logout' ? 'bg-carbon-200 text-carbon-700' :
                        'bg-dangerus-50 text-dangerus-700'
                      }`}>
                        {ETIQUETAS_EVENTO[r.tipo_evento] || r.tipo_evento}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-carbon-600">{r.fecha}</td>
                    <td className="py-3 font-mono text-carbon-600">{r.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      </main>
    </div>
  );
}
