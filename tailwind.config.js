/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}", // <-- Correct path
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}