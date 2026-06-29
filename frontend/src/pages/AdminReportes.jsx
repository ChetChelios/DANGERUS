import { useState } from "react";
import BarraNavegacion from "../components/BarraNavegacion";
import Tarjeta from "../components/Tarjeta";
import Boton from "../components/Boton";
import * as reporteApi from "../api/reporteApi";

export default function AdminReportes() {

  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscar() {

    setCargando(true);
    setError("");

    try {

      const datos = await reporteApi.obtenerReportes({
        cedula,
        nombre,
        fechaInicio,
        fechaFin,
      });

      setReportes(datos);

    } catch (err) {

      setError("No se pudieron cargar los reportes.");

    } finally {

      setCargando(false);

    }

  }

  return (
    <div className="min-h-screen bg-carbon-50">

      <BarraNavegacion />

      <main className="max-w-7xl mx-auto p-8">

        <h1 className="font-display text-4xl font-bold text-dangerus-700 mb-2">
          Reportes
        </h1>

        <p className="text-carbon-500 mb-8">
          Consulta las marcaciones realizadas por los colaboradores.
        </p>

        <Tarjeta className="mb-8">

          <div className="grid md:grid-cols-5 gap-4">

            <input
              value={cedula}
              onChange={(e)=>setCedula(e.target.value)}
              placeholder="Cédula"
              className="border border-carbon-200 rounded-xl px-4 py-3 outline-none focus:border-dangerus-500"
            />

            <input
              value={nombre}
              onChange={(e)=>setNombre(e.target.value)}
              placeholder="Nombre"
              className="border border-carbon-200 rounded-xl px-4 py-3 outline-none focus:border-dangerus-500"
            />

            <input
              type="date"
              value={fechaInicio}
              onChange={(e)=>setFechaInicio(e.target.value)}
              className="border border-carbon-200 rounded-xl px-4 py-3 outline-none focus:border-dangerus-500"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(e)=>setFechaFin(e.target.value)}
              className="border border-carbon-200 rounded-xl px-4 py-3 outline-none focus:border-dangerus-500"
            />

            <Boton onClick={buscar}>
              Buscar
            </Boton>

          </div>

        </Tarjeta>

        {error && (
          <p className="text-red-600 mb-4">
            {error}
          </p>
        )}

        <Tarjeta>

          <div className="flex justify-between items-center mb-6">

            <h2 className="font-display text-xl font-semibold">
              Resultados
            </h2>

            <Boton variante="fantasma">
              Exportar Excel
            </Boton>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-carbon-200">

                <tr className="text-left text-carbon-500">

                  <th className="py-3">Empleado</th>
                  <th>Cédula</th>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Hora</th>

                </tr>

              </thead>

              <tbody>

                {cargando && (

                  <tr>

                    <td colSpan="5" className="py-10 text-center">
                      Cargando...
                    </td>

                  </tr>

                )}

                {!cargando && reportes.length === 0 && (

                  <tr>

                    <td colSpan="5" className="py-10 text-center">
                      No hay registros.
                    </td>

                  </tr>

                )}

                {!cargando && reportes.map((r) => (

                  <tr
                    key={r.id}
                    className="border-b border-carbon-100"
                  >

                    <td className="py-3">{r.nombre}</td>
                    <td>{r.cedula}</td>
                    <td>{r.tipo_evento}</td>
                    <td>{r.fecha}</td>
                    <td>{r.hora}</td>

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