/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff6f0',
          100: '#ffecd9',
          200: '#ffd6b3',
          300: '#ffb680',
          400: '#ff8a47',
          500: '#EA4E1B',
          600: '#d53d0e',
          700: '#b12f0b',
          800: '#8d270f',
          900: '#722210',
        },
        ink: {
          DEFAULT: '#0F172A',
          sub: '#64748B',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'elevated': '0 12px 32px -4px rgba(15, 23, 42, 0.08)',
        'brand': '0 8px 24px -4px rgba(234, 78, 27, 0.28)',
      },
    },
  },
  plugins: [],
}