import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BarraNavegacion from '../components/BarraNavegacion';
import Tarjeta from '../components/Tarjeta';
import Boton from '../components/Boton';

export default function AdminMallas() {
  const { token } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea Excel
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
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/mallas/cargar-excel`, {
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
      
      // Limpiar input
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

  const descargarPlantilla = () => {
    // Crear una plantilla Excel básica
    const datos = [
      {
        'Cédula': '1234567890',
        'Nombre': 'Juan Pérez',
        'Supervisor': 'Carlos López',
        'Campaña': 'Ventas',
        '29/06/2026 Entrada': '08:00',
        '29/06/2026 Salida': '17:00',
        '29/06/2026 Break1': '10:00-10:30',
        '29/06/2026 Almuerzo': '12:00-13:00',
        '29/06/2026 Break2': '15:00-15:30',
        '30/06/2026 Entrada': '08:00',
        '30/06/2026 Salida': '17:00',
        '30/06/2026 Break1': '10:00-10:30',
        '30/06/2026 Almuerzo': '12:00-13:00',
        '30/06/2026 Break2': '15:00-15:30',
      },
    ];
    
    // Nota: Para generar Excel real, usarías librería como xlsx en el frontend
    // Por ahora, mostramos instrucciones
    alert('Plantilla:\nPara descargar la plantilla completa, contacta al administrador.\n\nFormato esperado:\n- Cédula, Nombre, Supervisor, Campaña\n- Para cada día: Fecha Entrada, Fecha Salida, Fecha Break1, Fecha Almuerzo, Fecha Break2\n- Ejemplo: "29/06/2026 Entrada"');
  };

  return (
    <div className="min-h-screen bg-carbon-50">
      <BarraNavegacion />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="font-display text-4xl font-bold text-dangerus-700 mb-2">
    Carga de Mallas
</h1>

<p className="text-carbon-500 mb-8">
    Importa los horarios semanales de los colaboradores mediante Excel.
</p>

        {/* Tarjeta Principal */}
        <Tarjeta className="mb-6">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-dangerus-700 mb-4">Carga Masiva de Horarios</h2>
            <p className="text-carbon-700 mb-6">
              Sube un archivo Excel con los horarios de tu equipo. Solo debes ser administrador para hacer esto.
            </p>

            {/* Instrucciones */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Formato esperado:</strong> Columnas de Cédula, Nombre, Supervisor, Campaña, y para cada día: 
                "DD/MM/YYYY Entrada", "DD/MM/YYYY Salida", "DD/MM/YYYY Break1", "DD/MM/YYYY Almuerzo", "DD/MM/YYYY Break2"
              </p>
            </div>

            {/* Input de archivo */}
            <div className="border-2 border-dashed border-dangerus-200 rounded-2xl p-12 text-center hover:border-dangerus-500 hover:bg-dangerus-50 transition-all duration-300">

    <input
        id="archivo-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={manejarSeleccionArchivo}
        className="hidden"
    />

    <label htmlFor="archivo-input" className="cursor-pointer">

        <div className="text-6xl mb-4">
            📄
        </div>

        <h3 className="font-display text-xl font-semibold text-dangerus-700">
            {archivo ? archivo.name : "Selecciona un archivo Excel"}
        </h3>

        <p className="text-carbon-500 mt-2">
            Arrastra el archivo aquí o haz clic para seleccionarlo.
        </p>

        <p className="text-xs text-carbon-400 mt-4">
            Formatos permitidos: XLSX / XLS
        </p>

    </label>

</div>

            {/* Botones de acción */}
           <div className="flex gap-4 mt-6">

    <Boton
        onClick={cargarMallas}
        disabled={!archivo || cargando}
        className="flex-1"
    >
        {cargando ? "Cargando..." : "Cargar mallas"}
    </Boton>

    <Boton
        variante="fantasma"
        className="flex-1"
        onClick={descargarPlantilla}
    >
        Descargar plantilla
    </Boton>

</div>
            {/* Mensajes de error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Mensaje de éxito */}
            {mensaje && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="text-green-800">{mensaje}</p>
              </div>
            )}

            {/* Resultados */}
            {resultados && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-dangerus-700 mb-4">Resultado de la Carga</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-carbon-600">Exitosos</p>
                    <p className="text-3xl font-bold text-green-600">{resultados.exitosos}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-carbon-600">Con Errores</p>
                    <p className="text-3xl font-bold text-red-600">{resultados.errores.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm text-carbon-600">Advertencias</p>
                    <p className="text-3xl font-bold text-yellow-600">{resultados.advertencias.length}</p>
                  </div>
                </div>

                {/* Detalles de errores */}
                {resultados.errores.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-red-700 mb-2">Errores encontrados:</h4>
                    <div className="bg-white rounded-lg overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="p-2 text-left text-red-700">Fila</th>
                            <th className="p-2 text-left text-red-700">Cédula</th>
                            <th className="p-2 text-left text-red-700">Razón</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.errores.slice(0, 5).map((err, i) => (
                            <tr key={i} className="border-t border-red-100">
                              <td className="p-2">{err.fila}</td>
                              <td className="p-2">{err.cedula || '-'}</td>
                              <td className="p-2 text-red-600">{err.razon}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {resultados.errores.length > 5 && (
                      <p className="text-sm text-carbon-600 mt-2">... y {resultados.errores.length - 5} errores más</p>
                    )}
                  </div>
                )}

                {/* Advertencias */}
                {resultados.advertencias.length > 0 && (
                  <div>
                    <h4 className="font-bold text-yellow-700 mb-2">Advertencias:</h4>
                    <div className="bg-white rounded-lg overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-yellow-50">
                          <tr>
                            <th className="p-2 text-left text-yellow-700">Fila</th>
                            <th className="p-2 text-left text-yellow-700">Columna</th>
                            <th className="p-2 text-left text-yellow-700">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.advertencias.slice(0, 5).map((adv, i) => (
                            <tr key={i} className="border-t border-yellow-100">
                              <td className="p-2">{adv.fila}</td>
                              <td className="p-2">{adv.columna}</td>
                              <td className="p-2 text-yellow-700">{adv.razon}</td>
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
        </Tarjeta>

        {/* Información adicional */}
        <Tarjeta>
          <div className="p-8">
            <h3 className="text-xl font-bold text-dangerus-700 mb-4">¿Cómo usar?</h3>
            <ol className="list-decimal list-inside space-y-2 text-carbon-700">
              <li>Descarga la plantilla Excel desde el botón arriba</li>
              <li>Llena los datos: Cédula, Nombre, Supervisor, Campaña</li>
              <li>Para cada día de la semana, agrega las columnas:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
                  <li>DD/MM/YYYY Entrada (ej: 08:00)</li>
                  <li>DD/MM/YYYY Salida (ej: 17:00)</li>
                  <li>DD/MM/YYYY Break1 (ej: 10:00-10:30)</li>
                  <li>DD/MM/YYYY Almuerzo (ej: 12:00-13:00)</li>
                  <li>DD/MM/YYYY Break2 (ej: 15:00-15:30)</li>
                </ul>
              </li>
              <li>Sube el archivo y el sistema procederá a cargar los horarios</li>
              <li>Verifica el resultado: exitosos, errores, advertencias</li>
            </ol>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
