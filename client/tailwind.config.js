/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#1a1a20',
        'charcoal-light': '#2d2d35',
        'gold': '#d4a960',
        'gold-dark': '#c89645',
      }
    },
  },
  plugins: [],
}