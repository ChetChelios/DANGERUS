import Boton from "./Boton";

export default function Modal({
  abierto,
  titulo,
  mensaje,
  confirmarTexto = "Aceptar",
  cancelarTexto = "Cancelar",
  onConfirmar,
  onCancelar,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-dangerus-500 px-6 py-5">

          <h2 className="text-white text-xl font-bold">
            {titulo}
          </h2>

        </div>

        <div className="p-6">

          <p className="text-carbon-600 leading-relaxed">
            {mensaje}
          </p>

          <div className="flex justify-end gap-3 mt-8">

            <Boton
              variante="fantasma"
              onClick={onCancelar}
            >
              {cancelarTexto}
            </Boton>

            <Boton
              variante="primario"
              onClick={onConfirmar}
            >
              {confirmarTexto}
            </Boton>

          </div>

        </div>

      </div>

    </div>
  );
}