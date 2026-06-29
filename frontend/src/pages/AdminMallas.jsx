import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BarraNavegacion from '../components/BarraNavegacion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AdminMallas() {
  const { usuario, token } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const esExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (!esExcel) {
        setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
        setArchivo(null);
        return;
      }
      setArchivo(file);
      setError('');
    }
  };

  const descargarPlantilla = async () => {
    setDescargandoPlantilla(true);
    setError('');
    
    try {
      const respuesta = await fetch(`${API_URL}/api/mallas/descargar-plantilla`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        throw new Error(datos.error || 'Error al descargar plantilla');
      }

      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plantilla_Mallas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMensaje('✅ Plantilla descargada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al descargar la plantilla');
      console.error(err);
    } finally {
      setDescargandoPlantilla(false);
    }
  };

  const cargarMallas = async () => {
    if (!archivo) {
      setError('Debes seleccionar un archivo Excel primero');
      return;
    }

    setCargando(true);
    setError('');
    setMensaje('');
    setResultados(null);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const respuesta = await fetch(`${API_URL}/api/mallas/cargar-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'Error al cargar el archivo');
        return;
      }

      setResultados(datos.resultados);
      setMensaje('✅ Carga completada exitosamente');
      setArchivo(null);
      
      const inputFile = document.getElementById('archivo-input');
      if (inputFile) {
        inputFile.value = '';
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dangerus-50">
      <BarraNavegacion />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-dangerus-900 mb-8">📊 Cargar Horarios (Mallas)</h1>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-dangerus-700 mb-4">Carga Masiva de Horarios Semanales</h2>
          <p className="text-gray-700 mb-6">
            Sube un archivo Excel con los horarios de tu equipo para toda la semana. 
            El archivo debe contener las cédulas registradas en el sistema.
          </p>

          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold mb-2">📋 Formato esperado:</p>
            <p className="text-sm text-blue-700">
              El Excel debe tener: Cédula, Nombre, Supervisor, Campaña, 
              y para cada día de la semana: fecha, hora entrada, hora salida, break 1, almuerzo, break 2
            </p>
          </div>

          {/* Botones de acción - Descargar plantilla */}
          <div className="bg-dangerus-100 border border-dangerus-300 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-dangerus-700 mb-3">🎁 Obtener Plantilla</h3>
            <p className="text-sm text-gray-700 mb-4">
              Descarga una plantilla vacía con los encabezados correctos. Solo necesitas llenarla con tus datos.
            </p>
            <button
              onClick={descargarPlantilla}
              disabled={descargandoPlantilla}
              className="px-6 py-3 bg-dangerus-500 text-white font-semibold rounded-lg hover:bg-dangerus-600 transition disabled:opacity-50"
            >
              {descargandoPlantilla ? '⏳ Descargando...' : '📥 Descargar Plantilla Excel'}
            </button>
          </div>

          {/* Input de archivo */}
          <div className="border-2 border-dashed border-dangerus-300 rounded-lg p-8 mb-6 text-center hover:bg-dangerus-50 transition">
            <input
              id="archivo-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={manejarSeleccionArchivo}
              className="hidden"
            />
            <label 
              htmlFor="archivo-input"
              className="cursor-pointer block"
            >
              <div className="text-dangerus-600 text-4xl mb-2">📁</div>
              <p className="font-semibold text-dangerus-700">
                {archivo ? `✓ ${archivo.name}` : 'Haz clic o arrastra un archivo Excel aquí'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Formatos: .xlsx, .xls (Máx: 50 MB)</p>
            </label>
          </div>

          {/* Botón de carga */}
          <div className="flex gap-4">
            <button
              onClick={cargarMallas}
              disabled={!archivo || cargando}
              className="flex-1 px-6 py-3 bg-dangerus-500 text-white font-semibold rounded-lg hover:bg-dangerus-600 transition disabled:opacity-50"
            >
              {cargando ? '⏳ Cargando...' : '⬆️ Cargar Mallas'}
            </button>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
              <p className="text-red-800 font-semibold">❌ Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {mensaje && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
              <p className="text-green-800">{mensaje}</p>
            </div>
          )}

          {/* Resultados */}
          {resultados && (
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-dangerus-700 mb-4">📊 Resultado de la Carga</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow">
                  <p className="text-sm text-gray-600 font-semibold">✅ Exitosos</p>
                  <p className="text-4xl font-bold text-green-600">{resultados.exitosos}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow">
                  <p className="text-sm text-gray-600 font-semibold">❌ Con Errores</p>
                  <p className="text-4xl font-bold text-red-600">{resultados.errores.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow">
                  <p className="text-sm text-gray-600 font-semibold">⚠️ Advertencias</p>
                  <p className="text-4xl font-bold text-yellow-600">{resultados.advertencias.length}</p>
                </div>
              </div>

              {/* Detalles de errores */}
              {resultados.errores.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-red-700 mb-3">❌ Errores encontrados:</h4>
                  <div className="bg-white rounded-lg overflow-x-auto shadow">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="p-3 text-left text-red-700 font-semibold">Fila</th>
                          <th className="p-3 text-left text-red-700 font-semibold">Cédula</th>
                          <th className="p-3 text-left text-red-700 font-semibold">Nombre</th>
                          <th className="p-3 text-left text-red-700 font-semibold">Razón</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.errores.slice(0, 10).map((err, i) => (
                          <tr key={i} className="border-t border-red-100 hover:bg-red-50">
                            <td className="p-3 font-mono">{err.fila}</td>
                            <td className="p-3 font-mono">{err.cedula || '-'}</td>
                            <td className="p-3">{err.nombre || '-'}</td>
                            <td className="p-3 text-red-600">{err.razon}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {resultados.errores.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">... y {resultados.errores.length - 10} errores más</p>
                  )}
                </div>
              )}

              {/* Advertencias */}
              {resultados.advertencias.length > 0 && (
                <div>
                  <h4 className="font-bold text-yellow-700 mb-3">⚠️ Advertencias:</h4>
                  <div className="bg-white rounded-lg overflow-x-auto shadow">
                    <table className="w-full text-sm">
                      <thead className="bg-yellow-50">
                        <tr>
                          <th className="p-3 text-left text-yellow-700 font-semibold">Fila</th>
                          <th className="p-3 text-left text-yellow-700 font-semibold">Cédula</th>
                          <th className="p-3 text-left text-yellow-700 font-semibold">Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.advertencias.slice(0, 5).map((adv, i) => (
                          <tr key={i} className="border-t border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-mono">{adv.fila}</td>
                            <td className="p-3 font-mono">{adv.cedula || '-'}</td>
                            <td className="p-3 text-yellow-700">{adv.razon}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-dangerus-700 mb-4">📖 Guía de uso</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li className="font-semibold">
              Descarga la plantilla
              <p className="text-sm text-gray-600 ml-6">Usa el botón "Descargar Plantilla" para obtener un Excel vacío</p>
            </li>
            <li className="font-semibold">
              Llena los datos básicos
              <p className="text-sm text-gray-600 ml-6">Cédula, Nombre, Supervisor, Campaña (una sola vez al inicio)</p>
            </li>
            <li className="font-semibold">
              Agrega los horarios por día
              <p className="text-sm text-gray-600 ml-6">Para cada día de la semana: fecha, hora entrada, hora salida, breaks y almuerzo</p>
            </li>
            <li className="font-semibold">
              Valida las cédulas
              <p className="text-sm text-gray-600 ml-6">Solo usuarios registrados en el sistema serán procesados</p>
            </li>
            <li className="font-semibold">
              Carga el archivo
              <p className="text-sm text-gray-600 ml-6">Haz clic en "Cargar Mallas" y espera el resultado</p>
            </li>
            <li className="font-semibold">
              Revisa los resultados
              <p className="text-sm text-gray-600 ml-6">Verás exitosos, errores y advertencias detalladas</p>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-dangerus-50 rounded-lg border border-dangerus-200">
            <p className="text-sm text-dangerus-800">
              <span className="font-bold">💡 Tip:</span> Si hay errores, revisa el Excel y sube de nuevo. 
              El sistema continúa cargando aunque haya errores en algunas filas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
