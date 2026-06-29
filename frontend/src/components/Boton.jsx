const VARIANTES = {
  primario:
    'bg-dangerus-500 hover:bg-dangerus-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',

  oscuro:
    'bg-carbon-800 hover:bg-carbon-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',

  peligro:
    'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',

  fantasma:
    'bg-white hover:bg-dangerus-50 text-dangerus-600 border border-dangerus-200',
};

export default function Boton({
  children,
  variante = 'primario',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        font-semibold
        text-sm
        rounded-xl
        px-5
        py-3
        transition-all
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${VARIANTES[variante]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
