// ============================================================
// Componente: Tarjeta Premium DGUS
// ============================================================

export default function Tarjeta({
  children,
  className = '',
  titulo,
  acciones,
}) {
  return (
    <div
      className={`
        bg-white
        rounded-2xl
        border
        border-carbon-100
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-300
        p-6
        ${className}
      `}
    >
      {(titulo || acciones) && (
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-carbon-100">
          {titulo && (
            <h3 className="text-lg font-bold text-dangerus-600 tracking-tight">
              {titulo}
            </h3>
          )}

          {acciones}
        </div>
      )}

      {children}
    </div>
  );
}