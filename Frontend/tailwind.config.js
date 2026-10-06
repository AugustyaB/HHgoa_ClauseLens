/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070c18', // Deepest Navy
          900: '#0b1329', // Primary Dark Background
          800: '#111c38', // Glass Panel Background
          700: '#1b2a4a', // Card Background
          600: '#273a66', // Borders / Dividers
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Sapphire Blue Accent
          700: '#1d4ed8',
          800: '#1e40af',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        risk: {
          danger: '#ef4444',
          warning: '#f59e0b',
          safe: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
