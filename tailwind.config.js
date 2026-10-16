/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        galaxy: {
          950: '#04060d',
          900: '#090d20',
          850: '#0f1738',
          800: '#141e46',
          700: '#1e2b58',
          600: '#2b3d75',
          500: '#3d5299',
          400: '#637ec6',
          300: '#8fa5e3',
          200: '#c2cefa',
          100: '#e5ecff',
          50: '#f4f7ff',
        },
        cosmic: {
          purple: '#6d28d9',
          lavender: '#a78bfa',
          glow: '#818cf8',
          cyan: '#38bdf8',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
        }
      },
      backgroundImage: {
        'galaxy-gradient': 'radial-gradient(ellipse at top, #141e42 0%, #0b1124 50%, #04060d 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(20, 30, 66, 0.6) 0%, rgba(11, 17, 36, 0.7) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #637ec6 0%, #818cf8 50%, #a78bfa 100%)',
      }
    },
  },
  plugins: [],
}
