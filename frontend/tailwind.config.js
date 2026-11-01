/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mediblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c90e7',
          600: '#0272c5',
          700: '#035ba0',
          800: '#074e84',
          900: '#0c416e',
        },
        mediteal: {
          50: '#effcf7',
          100: '#d7f7eb',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      }
    },
  },
  plugins: [],
}
