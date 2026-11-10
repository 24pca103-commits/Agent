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
        chatgpt: {
          bg: '#212121',
          sidebar: '#171717',
          surface: '#2f2f2f',
          elevated: '#262626',
          hover: '#383838',
          text: '#ececec',
          muted: '#b4b4b4',
          subtle: '#8e8e8e',
          accent: '#10a37f',
          'accent-hover': '#0e906f',
        },
        galaxy: {
          950: '#171717',
          900: '#1e1e1e',
          850: '#212121',
          800: '#2a2a2a',
          700: '#383838',
          600: '#424242',
          500: '#676767',
          400: '#8e8e8e',
          300: '#b4b4b4',
          200: '#d9d9e3',
          100: '#ececec',
          50: '#f7f7f8',
        },
        cosmic: {
          purple: '#10a37f',
          lavender: '#b4b4b4',
          glow: '#ececec',
          cyan: '#10a37f',
          emerald: '#10a37f',
          amber: '#f59e0b',
          rose: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
