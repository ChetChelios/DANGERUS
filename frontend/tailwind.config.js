/** ============================================================
 *  Configuración de Tailwind CSS - Tokens de diseño DGUS
 *  ============================================================
 *  Paleta Dangerus:
 *    - Verde Oscuro (corporativo principal)
 *    - Blanco (superficies y texto)
 *    - Grises (sutiles)
 *  ============================================================ */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dangerus: {
          50: '#F0FAF7',
          100: '#DEF4EE',
          200: '#B3E5DB',
          300: '#5DC4A8',
          400: '#2D8B6B',
          500: '#1B6B4F', // verde oscuro principal
          600: '#155246',
          700: '#103A33',
          800: '#0B2620',
          900: '#061510',
        },
        ambar: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          300: '#FCD34D',
          400: '#F5B400', // mantener para compatibilidad
          500: '#E2A200',
          600: '#C28800',
          700: '#8F6400',
        },
        carbon: {
          50: '#F7F7F6',
          100: '#EDEDEB',
          200: '#D9D9D6',
          300: '#B8B8B3',
          400: '#86867F',
          600: '#52524C',
          700: '#3A3A35',
          800: '#262622',
          900: '#1A1A17',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(26,26,23,0.06), 0 1px 1px 0 rgba(26,26,23,0.04)',
      },
    },
  },
  plugins: [],
}
