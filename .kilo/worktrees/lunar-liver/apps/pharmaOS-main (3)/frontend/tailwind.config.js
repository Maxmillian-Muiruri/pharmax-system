/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#CCFBF1',
          100: '#99F6E4',
          200: '#5EEAD4',
          300: '#2DD4BF',
          400: '#14B8A6',
          500: '#0D9488',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        forty: {
          dark: '#022C22',
          primary: '#0D9488',
          accent: '#00987F',
          green: '#01B81A',
          red: '#EF4444',
          violet: '#8231D3',
          orange: '#FF6565',
        },
      },
    },
  },
  plugins: [],
}
